import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-validations/{id}:
 *   get:
 *     summary: Get a specific risk validation
 *     description: Retrieve details of a single risk validation by ID
 *     tags:
 *       - Risk Validations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk validation UUID
 *     responses:
 *       200:
 *         description: Risk validation retrieved successfully
 *       404:
 *         description: Risk validation not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM risk_validations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk validation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching risk validation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-validations/{id}:
 *   put:
 *     summary: Update a risk validation
 *     description: Update an existing risk validation record
 *     tags:
 *       - Risk Validations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk validation UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               validation_id:
 *                 type: string
 *               validated_by:
 *                 type: string
 *               validation_date:
 *                 type: string
 *                 format: date-time
 *               validation_status:
 *                 type: string
 *               validation_notes:
 *                 type: string
 *               validation_method:
 *                 type: string
 *               validation_score:
 *                 type: integer
 *               validation_reviewer:
 *                 type: string
 *               validation_reference:
 *                 type: string
 *               validation_audit_log:
 *                 type: string
 *     responses:
 *       200:
 *         description: Risk validation updated successfully
 *       404:
 *         description: Risk validation not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'validation_id', 'validated_by', 'validation_date', 'validation_status',
      'validation_notes', 'validation_method', 'validation_score', 'validation_reviewer',
      'validation_reference', 'validation_audit_log'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE risk_validations SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk validation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating risk validation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-validations/{id}:
 *   delete:
 *     summary: Delete a risk validation
 *     description: Remove a risk validation record from the system
 *     tags:
 *       - Risk Validations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk validation UUID
 *     responses:
 *       200:
 *         description: Risk validation deleted successfully
 *       404:
 *         description: Risk validation not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM risk_validations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk validation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Risk validation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting risk validation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}