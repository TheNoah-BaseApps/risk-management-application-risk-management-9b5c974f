import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-evaluations/{id}:
 *   get:
 *     summary: Get a risk evaluation by ID
 *     description: Retrieve a single risk evaluation record
 *     tags: [Risk Evaluations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk evaluation UUID
 *     responses:
 *       200:
 *         description: Risk evaluation retrieved successfully
 *       404:
 *         description: Risk evaluation not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM risk_evaluations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk evaluation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching risk evaluation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-evaluations/{id}:
 *   put:
 *     summary: Update a risk evaluation
 *     description: Update an existing risk evaluation record
 *     tags: [Risk Evaluations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk evaluation UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Risk evaluation updated successfully
 *       404:
 *         description: Risk evaluation not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE risk_evaluations 
       SET evaluation_id = COALESCE($1, evaluation_id),
           risk_id = COALESCE($2, risk_id),
           evaluation_date = COALESCE($3, evaluation_date),
           evaluation_result = COALESCE($4, evaluation_result),
           evaluator_name = COALESCE($5, evaluator_name),
           evaluation_method = COALESCE($6, evaluation_method),
           effectiveness = COALESCE($7, effectiveness),
           feedback_comment = COALESCE($8, feedback_comment),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [evaluation_id, risk_id, evaluation_date, evaluation_result, evaluator_name,
       evaluation_method, effectiveness, feedback_comment, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk evaluation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating risk evaluation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-evaluations/{id}:
 *   delete:
 *     summary: Delete a risk evaluation
 *     description: Delete a risk evaluation record
 *     tags: [Risk Evaluations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk evaluation UUID
 *     responses:
 *       200:
 *         description: Risk evaluation deleted successfully
 *       404:
 *         description: Risk evaluation not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM risk_evaluations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk evaluation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Risk evaluation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting risk evaluation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}