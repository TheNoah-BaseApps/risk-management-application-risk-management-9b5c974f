import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-monitoring:
 *   get:
 *     summary: Get all risk monitoring records
 *     description: Retrieve all risk monitoring records with pagination and filtering support
 *     tags: [Risk Monitoring]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *       - in: query
 *         name: risk_id
 *         schema:
 *           type: string
 *         description: Filter by risk ID
 *       - in: query
 *         name: issue_detected
 *         schema:
 *           type: boolean
 *         description: Filter by issue detection status
 *     responses:
 *       200:
 *         description: Successfully retrieved risk monitoring records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const riskId = searchParams.get('risk_id');
    const issueDetected = searchParams.get('issue_detected');

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (riskId) {
      whereConditions.push(`risk_id = $${paramIndex}`);
      queryParams.push(riskId);
      paramIndex++;
    }

    if (issueDetected !== null && issueDetected !== undefined) {
      whereConditions.push(`issue_detected = $${paramIndex}`);
      queryParams.push(issueDetected === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM risk_monitoring ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated data
    queryParams.push(limit, offset);
    const result = await query(
      `SELECT * FROM risk_monitoring ${whereClause} ORDER BY monitoring_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching risk monitoring records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-monitoring:
 *   post:
 *     summary: Create a new risk monitoring record
 *     description: Create a new risk monitoring record with validation
 *     tags: [Risk Monitoring]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monitoring_id
 *               - risk_id
 *               - monitoring_date
 *               - monitored_by
 *               - monitoring_method
 *               - issue_detected
 *               - response_triggered
 *               - status_after_check
 *             properties:
 *               monitoring_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               monitoring_date:
 *                 type: string
 *                 format: date-time
 *               monitored_by:
 *                 type: string
 *               monitoring_method:
 *                 type: string
 *               issue_detected:
 *                 type: boolean
 *               response_triggered:
 *                 type: boolean
 *               status_after_check:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk monitoring record created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      monitoring_id,
      risk_id,
      monitoring_date,
      monitored_by,
      monitoring_method,
      issue_detected,
      response_triggered,
      status_after_check,
    } = body;

    // Validation
    if (!monitoring_id || !risk_id || !monitoring_date || !monitored_by || !monitoring_method || issue_detected === undefined || response_triggered === undefined || !status_after_check) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_monitoring 
        (monitoring_id, risk_id, monitoring_date, monitored_by, monitoring_method, issue_detected, response_triggered, status_after_check)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [monitoring_id, risk_id, monitoring_date, monitored_by, monitoring_method, issue_detected, response_triggered, status_after_check]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk monitoring record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}