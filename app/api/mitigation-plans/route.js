import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/mitigation-plans:
 *   get:
 *     summary: Get all risk mitigation plans
 *     description: Retrieve a list of all risk mitigation plans with pagination and filtering
 *     tags: [Risk Mitigation Plans]
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
 *         name: action_owner
 *         schema:
 *           type: string
 *         description: Filter by action owner
 *       - in: query
 *         name: effectiveness
 *         schema:
 *           type: string
 *           enum: [High, Medium, Low]
 *         description: Filter by effectiveness level
 *     responses:
 *       200:
 *         description: List of mitigation plans retrieved successfully
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
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const riskId = searchParams.get('risk_id');
    const actionOwner = searchParams.get('action_owner');
    const effectiveness = searchParams.get('effectiveness');

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (riskId) {
      whereConditions.push(`risk_id = $${paramIndex}`);
      queryParams.push(riskId);
      paramIndex++;
    }

    if (actionOwner) {
      whereConditions.push(`action_owner ILIKE $${paramIndex}`);
      queryParams.push(`%${actionOwner}%`);
      paramIndex++;
    }

    if (effectiveness) {
      whereConditions.push(`effectiveness = $${paramIndex}`);
      queryParams.push(effectiveness);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM risk_mitigation_plans ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated data
    const dataResult = await query(
      `SELECT * FROM risk_mitigation_plans ${whereClause} ORDER BY implementation_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
 *     description: Create a new mitigation plan with validation
 *     tags: [Risk Mitigation Plans]
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
 *                 enum: [High, Medium, Low]
 *               monitoring_plan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mitigation plan created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
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
      monitoring_plan,
    } = body;

    // Validation
    if (!mitigation_plan_id || !risk_id || !mitigation_action || !action_owner || 
        !implementation_date || !review_frequency || !effectiveness || !monitoring_plan) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (!['High', 'Medium', 'Low'].includes(effectiveness)) {
      return NextResponse.json(
        { success: false, error: 'Effectiveness must be High, Medium, or Low' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_mitigation_plans 
       (mitigation_plan_id, risk_id, mitigation_action, action_owner, implementation_date, 
        review_frequency, effectiveness, monitoring_plan, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
       RETURNING *`,
      [mitigation_plan_id, risk_id, mitigation_action, action_owner, implementation_date, 
       review_frequency, effectiveness, monitoring_plan]
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