import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-reports:
 *   get:
 *     summary: Get all risk reports
 *     description: Retrieve a list of all risk reports with optional filtering
 *     tags: [Risk Reports]
 *     parameters:
 *       - in: query
 *         name: risk_id
 *         schema:
 *           type: string
 *         description: Filter by risk ID
 *       - in: query
 *         name: report_type
 *         schema:
 *           type: string
 *         description: Filter by report type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of risk reports
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
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const risk_id = searchParams.get('risk_id');
    const report_type = searchParams.get('report_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = 'SELECT * FROM risk_reports WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (risk_id) {
      queryText += ` AND risk_id = $${paramCount}`;
      queryParams.push(risk_id);
      paramCount++;
    }

    if (report_type) {
      queryText += ` AND report_type = $${paramCount}`;
      queryParams.push(report_type);
      paramCount++;
    }

    queryText += ` ORDER BY report_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    const countResult = await query('SELECT COUNT(*) as total FROM risk_reports');
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching risk reports:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-reports:
 *   post:
 *     summary: Create a new risk report
 *     description: Create a new risk report record
 *     tags: [Risk Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - report_id
 *               - risk_id
 *               - report_date
 *               - reporter_name
 *               - report_summary
 *               - report_type
 *             properties:
 *               report_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               report_date:
 *                 type: string
 *                 format: date-time
 *               reporter_name:
 *                 type: string
 *               report_summary:
 *                 type: string
 *               report_type:
 *                 type: string
 *               attached_documents:
 *                 type: string
 *               distribution_list:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk report created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      report_id,
      risk_id,
      report_date,
      reporter_name,
      report_summary,
      report_type,
      attached_documents,
      distribution_list
    } = body;

    // Validation
    if (!report_id || !risk_id || !report_date || !reporter_name || !report_summary || !report_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const queryText = `
      INSERT INTO risk_reports (
        report_id, risk_id, report_date, reporter_name, report_summary,
        report_type, attached_documents, distribution_list, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(queryText, [
      report_id,
      risk_id,
      report_date,
      reporter_name,
      report_summary,
      report_type,
      attached_documents || null,
      distribution_list || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}