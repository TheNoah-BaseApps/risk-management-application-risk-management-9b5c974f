import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/mitigation-plans:
 *   get:
 *     summary: Get all risk mitigation plans
 *     description: Retrieve a list of all risk mitigation plans with pagination and filtering
 *     tags:
 *       - Risk Mitigation Plans
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: risk_id
 *         schema:
 *           type: string
 *         description: Filter by risk ID
 *       - in: query
 *         name: effectiveness
 *         schema:
 *           type: string
 *         description: Filter by effectiveness level
 *     responses:
 *       200:
 *         description: Successfully retrieved mitigation plans
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
 *         description: Internal server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const riskId = searchParams.get('risk_id');
    const effectiveness = searchParams.get('effectiveness');

    let queryText = 'SELECT * FROM risk_mitigation_plans WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (riskId) {
      queryText += ` AND risk_id = $${paramCount}`;
      queryParams.push(riskId);
      paramCount++;
    }

    if (effectiveness) {
      queryText += ` AND effectiveness = $${paramCount}`;
      queryParams.push(effectiveness);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM risk_mitigation_plans WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (riskId) {
      countQuery += ` AND risk_id = $${countParamIndex}`;
      countParams.push(riskId);
      countParamIndex++;
    }

    if (effectiveness) {
      countQuery += ` AND effectiveness = $${countParamIndex}`;
      countParams.push(effectiveness);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching mitigation plans:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/mitigation-plans:
 *   post:
 *     summary: Create a new risk mitigation plan
 *     description: Create a new mitigation plan for a risk
 *     tags:
 *       - Risk Mitigation Plans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mitigation_plan_id
 *               - risk_id
 *               - mitigation_action
 *               - action_owner
 *               - implementation_date
 *               - review_frequency
 *               - effectiveness
 *               - monitoring_plan
 *             properties:
 *               mitigation_plan_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               mitigation_action:
 *                 type: string
 *               action_owner:
 *                 type: string
 *               implementation_date:
 *                 type: string
 *                 format: date-time
 *               review_frequency:
 *                 type: string
 *               effectiveness:
 *                 type: string
 *               monitoring_plan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mitigation plan created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mitigation_plan_id,
      risk_id,
      mitigation_action,
      action_owner,
      implementation_date,
      review_frequency,
      effectiveness,
      monitoring_plan
    } = body;

    // Validation
    if (!mitigation_plan_id || !risk_id || !mitigation_action || !action_owner || !implementation_date || !review_frequency || !effectiveness || !monitoring_plan) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_mitigation_plans 
       (mitigation_plan_id, risk_id, mitigation_action, action_owner, implementation_date, review_frequency, effectiveness, monitoring_plan, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
       RETURNING *`,
      [mitigation_plan_id, risk_id, mitigation_action, action_owner, implementation_date, review_frequency, effectiveness, monitoring_plan]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating mitigation plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}