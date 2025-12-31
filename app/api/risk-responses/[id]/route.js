import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-responses/{id}:
 *   get:
 *     summary: Get a risk response by ID
 *     description: Retrieve a single risk response record by ID with complete details
 *     tags: [Risk Responses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk response ID (UUID)
 *     responses:
 *       200:
 *         description: Risk response retrieved successfully
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
 *                     id:
 *                       type: string
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
 *       404:
 *         description: Risk response not found
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
 *                   example: Risk response not found
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
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Risk response ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT * FROM risk_responses WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching risk response:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-responses/{id}:
 *   put:
 *     summary: Update a risk response
 *     description: Update an existing risk response record with validation
 *     tags: [Risk Responses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk response ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               response_id:
 *                 type: string
 *                 description: Unique response identifier
 *               risk_id:
 *                 type: string
 *                 description: Associated risk ID
 *               response_strategy:
 *                 type: string
 *                 description: Strategy for risk response (e.g., mitigate, accept, transfer, avoid)
 *               response_details:
 *                 type: string
 *                 description: Detailed description of the response
 *               response_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date when response was implemented
 *               responder_name:
 *                 type: string
 *                 description: Name of the person responsible for the response
 *               escalation_level:
 *                 type: string
 *                 description: Escalation level (e.g., low, medium, high)
 *               contingency_plan:
 *                 type: string
 *                 description: Contingency plan if primary response fails
 *     responses:
 *       200:
 *         description: Risk response updated successfully
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
 *       400:
 *         description: Bad request - validation error or no fields to update
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
 *       404:
 *         description: Risk response not found
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
 *                   example: Risk response not found
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
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Risk response ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate response_strategy if provided
    const validStrategies = ['mitigate', 'accept', 'transfer', 'avoid'];
    if (body.response_strategy && !validStrategies.includes(body.response_strategy.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid response_strategy. Must be one of: ${validStrategies.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate escalation_level if provided
    const validEscalationLevels = ['low', 'medium', 'high', 'critical'];
    if (body.escalation_level && !validEscalationLevels.includes(body.escalation_level.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid escalation_level. Must be one of: ${validEscalationLevels.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate response_date if provided
    if (body.response_date && isNaN(Date.parse(body.response_date))) {
      return NextResponse.json(
        { success: false, error: 'Invalid response_date format' },
        { status: 400 }
      );
    }

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    // Protected fields that cannot be updated
    const protectedFields = ['id', 'created_at'];
    
    Object.entries(body).forEach(([key, value]) => {
      if (!protectedFields.includes(key) && value !== undefined) {
        setClauses.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (setClauses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE risk_responses SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating risk response:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-responses/{id}:
 *   delete:
 *     summary: Delete a risk response
 *     description: Delete a risk response record by ID. This operation is irreversible.
 *     tags: [Risk Responses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk response ID (UUID)
 *     responses:
 *       200:
 *         description: Risk response deleted successfully
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
 *                   description: Deleted risk response record
 *       400:
 *         description: Bad request - ID is required
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
 *       404:
 *         description: Risk response not found
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
 *                   example: Risk response not found
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
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Risk response ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM risk_responses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Risk response deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting risk response:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}