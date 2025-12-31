import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-responses:
 *   get:
 *     summary: Get all risk responses
 *     description: Retrieve a list of all risk response records with pagination and filtering
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
 *       - in: query
 *         name: response_strategy
 *         schema:
 *           type: string
 *         description: Filter by response strategy (e.g., Mitigate, Accept, Transfer, Avoid)
 *       - in: query
 *         name: escalation_level
 *         schema:
 *           type: string
 *         description: Filter by escalation level (e.g., Low, Medium, High, Critical)
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       response_id:
 *                         type: string
 *                       risk_id:
 *                         type: string
 *                       response_strategy:
 *                         type: string
 *                       response_details:
 *                         type: string
 *                       response_date:
 *                         type: string
 *                         format: date-time
 *                       responder_name:
 *                         type: string
 *                       escalation_level:
 *                         type: string
 *                       contingency_plan:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                   example: 50
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const riskId = searchParams.get('risk_id');
    const responseStrategy = searchParams.get('response_strategy');
    const escalationLevel = searchParams.get('escalation_level');

    let queryText = 'SELECT * FROM risk_responses';
    let countQueryText = 'SELECT COUNT(*) FROM risk_responses';
    let params = [];
    let countParams = [];
    let whereClauses = [];
    let paramCounter = 1;

    // Build WHERE clauses
    if (riskId) {
      whereClauses.push(`risk_id = $${paramCounter}`);
      params.push(riskId);
      countParams.push(riskId);
      paramCounter++;
    }

    if (responseStrategy) {
      whereClauses.push(`response_strategy = $${paramCounter}`);
      params.push(responseStrategy);
      countParams.push(responseStrategy);
      paramCounter++;
    }

    if (escalationLevel) {
      whereClauses.push(`escalation_level = $${paramCounter}`);
      params.push(escalationLevel);
      countParams.push(escalationLevel);
      paramCounter++;
    }

    // Add WHERE clause if filters exist
    if (whereClauses.length > 0) {
      const whereClause = ' WHERE ' + whereClauses.join(' AND ');
      queryText += whereClause;
      countQueryText += whereClause;
    }

    // Add ORDER BY, LIMIT, and OFFSET
    queryText += ` ORDER BY response_date DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    const countResult = await query(countQueryText, countParams);

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
 *     description: Create a new risk response record with validation
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
 *                 description: Unique identifier for the risk response
 *                 example: "RESP-001"
 *               risk_id:
 *                 type: string
 *                 description: ID of the associated risk
 *                 example: "RISK-001"
 *               response_strategy:
 *                 type: string
 *                 description: Strategy for responding to the risk
 *                 enum: [Mitigate, Accept, Transfer, Avoid]
 *                 example: "Mitigate"
 *               response_details:
 *                 type: string
 *                 description: Detailed description of the response
 *                 example: "Implement additional security controls"
 *               response_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date when the response was implemented
 *                 example: "2024-01-15T10:30:00Z"
 *               responder_name:
 *                 type: string
 *                 description: Name of the person responsible for the response
 *                 example: "John Doe"
 *               escalation_level:
 *                 type: string
 *                 description: Level of escalation required
 *                 enum: [Low, Medium, High, Critical]
 *                 example: "High"
 *               contingency_plan:
 *                 type: string
 *                 description: Backup plan if primary response fails
 *                 example: "Fallback to manual process"
 *     responses:
 *       201:
 *         description: Risk response created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     response_id:
 *                       type: string
 *                     risk_id:
 *                       type: string
 *                     response_strategy:
 *                       type: string
 *                     response_details:
 *                       type: string
 *                     response_date:
 *                       type: string
 *                       format: date-time
 *                     responder_name:
 *                       type: string
 *                     escalation_level:
 *                       type: string
 *                     contingency_plan:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
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

    // Validation for required fields
    if (!response_id || !risk_id || !response_strategy || !response_details || !response_date || !responder_name || !escalation_level) {
      console.error('Validation error: Missing required fields', {
        response_id: !!response_id,
        risk_id: !!risk_id,
        response_strategy: !!response_strategy,
        response_details: !!response_details,
        response_date: !!response_date,
        responder_name: !!responder_name,
        escalation_level: !!escalation_level,
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: response_id, risk_id, response_strategy, response_details, response_date, responder_name, escalation_level' },
        { status: 400 }
      );
    }

    // Validate response_strategy enum
    const validStrategies = ['Mitigate', 'Accept', 'Transfer', 'Avoid'];
    if (!validStrategies.includes(response_strategy)) {
      console.error('Validation error: Invalid response_strategy', { response_strategy });
      return NextResponse.json(
        { success: false, error: `Invalid response_strategy. Must be one of: ${validStrategies.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate escalation_level enum
    const validEscalationLevels = ['Low', 'Medium', 'High', 'Critical'];
    if (!validEscalationLevels.includes(escalation_level)) {
      console.error('Validation error: Invalid escalation_level', { escalation_level });
      return NextResponse.json(
        { success: false, error: `Invalid escalation_level. Must be one of: ${validEscalationLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate date format
    const dateObj = new Date(response_date);
    if (isNaN(dateObj.getTime())) {
      console.error('Validation error: Invalid response_date format', { response_date });
      return NextResponse.json(
        { success: false, error: 'Invalid response_date format. Must be a valid ISO 8601 date-time string' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_responses 
       (response_id, risk_id, response_strategy, response_details, response_date, responder_name, escalation_level, contingency_plan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [response_id, risk_id, response_strategy, response_details, response_date, responder_name, escalation_level, contingency_plan || null]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk response:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A risk response with this ID already exists' },
        { status: 400 }
      );
    }
    
    // Handle foreign key violations
    if (error.code === '23503') {
      return NextResponse.json(
        { success: false, error: 'Referenced risk_id does not exist' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}