import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-responses:
 *   get:
 *     summary: Get all risk responses
 *     description: Retrieve a list of all risk response records with pagination
 *     tags: [Risk Responses]
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
 *     responses:
 *       200:
 *         description: List of risk responses retrieved successfully
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

    let queryText = 'SELECT * FROM risk_responses';
    let params = [];
    
    if (riskId) {
      queryText += ' WHERE risk_id = $1';
      params.push(riskId);
      queryText += ' ORDER BY response_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY response_date DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);
    
    const countResult = await query(
      riskId 
        ? 'SELECT COUNT(*) FROM risk_responses WHERE risk_id = $1' 
        : 'SELECT COUNT(*) FROM risk_responses',
      riskId ? [riskId] : []
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching risk responses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-responses:
 *   post:
 *     summary: Create a new risk response
 *     description: Create a new risk response record
 *     tags: [Risk Responses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response_id
 *               - risk_id
 *               - response_strategy
 *               - response_details
 *               - response_date
 *               - responder_name
 *               - escalation_level
 *             properties:
 *               response_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               response_strategy:
 *                 type: string
 *               response_details:
 *                 type: string
 *               response_date:
 *                 type: string
 *                 format: date-time
 *               responder_name:
 *                 type: string
 *               escalation_level:
 *                 type: string
 *               contingency_plan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk response created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      response_id,
      risk_id,
      response_strategy,
      response_details,
      response_date,
      responder_name,
      escalation_level,
      contingency_plan,
    } = body;

    // Validation
    if (!response_id || !risk_id || !response_strategy || !response_details || !response_date || !responder_name || !escalation_level) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_responses 
       (response_id, risk_id, response_strategy, response_details, response_date, responder_name, escalation_level, contingency_plan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [response_id, risk_id, response_strategy, response_details, response_date, responder_name, escalation_level, contingency_plan]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk response:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}