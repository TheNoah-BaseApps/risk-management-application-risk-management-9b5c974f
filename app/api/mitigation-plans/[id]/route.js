import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/mitigation-plans/{id}:
 *   get:
 *     summary: Get a single risk mitigation plan
 *     description: Retrieve details of a specific mitigation plan
 *     tags:
 *       - Risk Mitigation Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mitigation plan ID
 *     responses:
 *       200:
 *         description: Successfully retrieved mitigation plan
 *       404:
 *         description: Mitigation plan not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM risk_mitigation_plans WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mitigation plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching mitigation plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/mitigation-plans/{id}:
 *   put:
 *     summary: Update a risk mitigation plan
 *     description: Update an existing mitigation plan
 *     tags:
 *       - Risk Mitigation Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mitigation plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Mitigation plan updated successfully
 *       404:
 *         description: Mitigation plan not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE risk_mitigation_plans 
       SET mitigation_plan_id = $1, risk_id = $2, mitigation_action = $3, action_owner = $4, 
           implementation_date = $5, review_frequency = $6, effectiveness = $7, monitoring_plan = $8, updated_at = NOW()
       WHERE id = $9 
       RETURNING *`,
      [mitigation_plan_id, risk_id, mitigation_action, action_owner, implementation_date, review_frequency, effectiveness, monitoring_plan, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mitigation plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating mitigation plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/mitigation-plans/{id}:
 *   delete:
 *     summary: Delete a risk mitigation plan
 *     description: Remove a mitigation plan from the system
 *     tags:
 *       - Risk Mitigation Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mitigation plan ID
 *     responses:
 *       200:
 *         description: Mitigation plan deleted successfully
 *       404:
 *         description: Mitigation plan not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM risk_mitigation_plans WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mitigation plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mitigation plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mitigation plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}