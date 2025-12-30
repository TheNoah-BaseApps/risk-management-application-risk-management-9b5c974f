import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/mitigation-plans/{id}:
 *   get:
 *     summary: Get a specific mitigation plan
 *     description: Retrieve details of a specific mitigation plan by ID
 *     tags: [Risk Mitigation Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mitigation plan UUID
 *     responses:
 *       200:
 *         description: Mitigation plan retrieved successfully
 *       404:
 *         description: Mitigation plan not found
 *       500:
 *         description: Server error
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

    return NextResponse.json({ success: true, data: result.rows[0] });
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
 *     summary: Update a mitigation plan
 *     description: Update an existing mitigation plan
 *     tags: [Risk Mitigation Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mitigation plan UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *       200:
 *         description: Mitigation plan updated successfully
 *       404:
 *         description: Mitigation plan not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const allowedFields = [
      'mitigation_action',
      'action_owner',
      'implementation_date',
      'review_frequency',
      'effectiveness',
      'monitoring_plan',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(body[field]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const result = await query(
      `UPDATE risk_mitigation_plans SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mitigation plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
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
 *     summary: Delete a mitigation plan
 *     description: Remove a mitigation plan from the system
 *     tags: [Risk Mitigation Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mitigation plan UUID
 *     responses:
 *       200:
 *         description: Mitigation plan deleted successfully
 *       404:
 *         description: Mitigation plan not found
 *       500:
 *         description: Server error
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
      message: 'Mitigation plan deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting mitigation plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}