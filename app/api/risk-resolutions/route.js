import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-resolutions:
 *   get:
 *     summary: Get all risk resolutions
 *     description: Retrieve a list of all risk resolution records
 *     tags:
 *       - Risk Resolutions
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: risk_id
 *         schema:
 *           type: string
 *         description: Filter by risk ID
 *       - in: query
 *         name: final_status
 *         schema:
 *           type: string
 *         description: Filter by final status
 *     responses:
 *       200:
 *         description: Successful response
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const riskId = searchParams.get('risk_id');
    const finalStatus = searchParams.get('final_status');

    let queryText = 'SELECT * FROM risk_resolutions WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (riskId) {
      queryText += ` AND risk_id = $${paramCount}`;
      params.push(riskId);
      paramCount++;
    }

    if (finalStatus) {
      queryText += ` AND final_status = $${paramCount}`;
      params.push(finalStatus);
      paramCount++;
    }

    queryText += ` ORDER BY resolution_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    
    const countResult = await query('SELECT COUNT(*) FROM risk_resolutions');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching risk resolutions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-resolutions:
 *   post:
 *     summary: Create a new risk resolution
 *     description: Add a new risk resolution record
 *     tags:
 *       - Risk Resolutions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution_id
 *               - risk_id
 *               - resolution_summary
 *               - resolution_date
 *               - resolved_by
 *               - final_status
 *             properties:
 *               resolution_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               resolution_summary:
 *                 type: string
 *               resolution_date:
 *                 type: string
 *                 format: date-time
 *               resolved_by:
 *                 type: string
 *               final_status:
 *                 type: string
 *               resolution_evidence:
 *                 type: string
 *               follow_up_action:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resolution created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      resolution_id,
      risk_id,
      resolution_summary,
      resolution_date,
      resolved_by,
      final_status,
      resolution_evidence,
      follow_up_action
    } = body;

    // Validation
    if (!resolution_id || !risk_id || !resolution_summary || !resolution_date || !resolved_by || !final_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_resolutions 
       (resolution_id, risk_id, resolution_summary, resolution_date, resolved_by, final_status, resolution_evidence, follow_up_action)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [resolution_id, risk_id, resolution_summary, resolution_date, resolved_by, final_status, resolution_evidence, follow_up_action]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk resolution:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}