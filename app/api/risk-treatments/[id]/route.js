import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-treatments/{id}:
 *   get:
 *     summary: Get a risk treatment by ID
 *     description: Retrieve a single risk treatment record
 *     tags: [Risk Treatments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk treatment UUID
 *     responses:
 *       200:
 *         description: Successfully retrieved risk treatment
 *       404:
 *         description: Risk treatment not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a risk treatment
 *     description: Update an existing risk treatment record
 *     tags: [Risk Treatments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk treatment UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Risk treatment updated successfully
 *       404:
 *         description: Risk treatment not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a risk treatment
 *     description: Remove a risk treatment record
 *     tags: [Risk Treatments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk treatment UUID
 *     responses:
 *       200:
 *         description: Risk treatment deleted successfully
 *       404:
 *         description: Risk treatment not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM risk_treatments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk treatment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching risk treatment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(body).forEach((key) => {
      if (key !== 'id' && key !== 'created_at') {
        updates.push(`${key} = $${paramCount}`);
        values.push(body[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE risk_treatments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk treatment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating risk treatment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM risk_treatments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk treatment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Risk treatment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting risk treatment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}