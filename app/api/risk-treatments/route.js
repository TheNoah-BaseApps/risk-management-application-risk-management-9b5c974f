import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-treatments:
 *   get:
 *     summary: Get all risk treatments
 *     description: Retrieve a list of all risk treatment records with pagination support
 *     tags: [Risk Treatments]
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
 *           default: 50
 *         description: Number of records per page
 *       - in: query
 *         name: risk_id
 *         schema:
 *           type: string
 *         description: Filter by risk ID
 *     responses:
 *       200:
 *         description: Successfully retrieved risk treatments
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
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new risk treatment
 *     description: Add a new risk treatment record
 *     tags: [Risk Treatments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - treatment_id
 *               - risk_id
 *               - treatment_option
 *               - responsible_person
 *               - start_date
 *               - end_date
 *               - treatment_cost
 *               - approval_status
 *             properties:
 *               treatment_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               treatment_option:
 *                 type: string
 *               responsible_person:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               treatment_cost:
 *                 type: integer
 *               approval_status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk treatment created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const riskId = searchParams.get('risk_id');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM risk_treatments';
    let queryParams = [];
    
    if (riskId) {
      queryText += ' WHERE risk_id = $1';
      queryParams.push(riskId);
      queryText += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      queryParams.push(limit, offset);
    } else {
      queryText += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      queryParams.push(limit, offset);
    }

    const result = await query(queryText, queryParams);
    
    const countQuery = riskId 
      ? 'SELECT COUNT(*) FROM risk_treatments WHERE risk_id = $1'
      : 'SELECT COUNT(*) FROM risk_treatments';
    const countParams = riskId ? [riskId] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching risk treatments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      treatment_id,
      risk_id,
      treatment_option,
      responsible_person,
      start_date,
      end_date,
      treatment_cost,
      approval_status
    } = body;

    // Validation
    if (!treatment_id || !risk_id || !treatment_option || !responsible_person || 
        !start_date || !end_date || treatment_cost === undefined || !approval_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_treatments 
       (treatment_id, risk_id, treatment_option, responsible_person, start_date, end_date, treatment_cost, approval_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [treatment_id, risk_id, treatment_option, responsible_person, start_date, end_date, treatment_cost, approval_status]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk treatment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}