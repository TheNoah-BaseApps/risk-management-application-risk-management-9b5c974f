import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-evaluations:
 *   get:
 *     summary: Get all risk evaluations
 *     description: Retrieve a list of all risk evaluation records with optional filtering
 *     tags: [Risk Evaluations]
 *     parameters:
 *       - in: query
 *         name: risk_id
 *         schema:
 *           type: string
 *         description: Filter by risk ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of risk evaluations retrieved successfully
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
 *         description: Internal server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const risk_id = searchParams.get('risk_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = 'SELECT * FROM risk_evaluations';
    const params = [];
    
    if (risk_id) {
      queryText += ' WHERE risk_id = $1';
      params.push(risk_id);
      queryText += ' ORDER BY evaluation_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY evaluation_date DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(queryText, params);

    // Get total count
    const countQuery = risk_id 
      ? 'SELECT COUNT(*) FROM risk_evaluations WHERE risk_id = $1'
      : 'SELECT COUNT(*) FROM risk_evaluations';
    const countParams = risk_id ? [risk_id] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching risk evaluations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-evaluations:
 *   post:
 *     summary: Create a new risk evaluation
 *     description: Create a new risk evaluation record
 *     tags: [Risk Evaluations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evaluation_id
 *               - risk_id
 *               - evaluation_date
 *               - evaluation_result
 *               - evaluator_name
 *               - evaluation_method
 *               - effectiveness
 *             properties:
 *               evaluation_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               evaluation_date:
 *                 type: string
 *                 format: date-time
 *               evaluation_result:
 *                 type: string
 *               evaluator_name:
 *                 type: string
 *               evaluation_method:
 *                 type: string
 *               effectiveness:
 *                 type: string
 *               feedback_comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk evaluation created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      evaluation_id,
      risk_id,
      evaluation_date,
      evaluation_result,
      evaluator_name,
      evaluation_method,
      effectiveness,
      feedback_comment,
    } = body;

    // Validation
    if (!evaluation_id || !risk_id || !evaluation_date || !evaluation_result || 
        !evaluator_name || !evaluation_method || !effectiveness) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_evaluations 
       (evaluation_id, risk_id, evaluation_date, evaluation_result, evaluator_name, 
        evaluation_method, effectiveness, feedback_comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [evaluation_id, risk_id, evaluation_date, evaluation_result, evaluator_name,
       evaluation_method, effectiveness, feedback_comment || null]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk evaluation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}