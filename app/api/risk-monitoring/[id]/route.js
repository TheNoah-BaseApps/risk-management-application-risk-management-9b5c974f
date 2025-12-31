import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-monitoring/{id}:
 *   get:
 *     summary: Get a risk monitoring record by ID
 *     description: Retrieve a single risk monitoring record by its UUID
 *     tags: [Risk Monitoring]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk monitoring record UUID
 *     responses:
 *       200:
 *         description: Successfully retrieved risk monitoring record
 *       404:
 *         description: Risk monitoring record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM risk_monitoring WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk monitoring record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching risk monitoring record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-monitoring/{id}:
 *   put:
 *     summary: Update a risk monitoring record
 *     description: Update an existing risk monitoring record by ID
 *     tags: [Risk Monitoring]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk monitoring record UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monitoring_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               monitoring_date:
 *                 type: string
 *                 format: date-time
 *               monitored_by:
 *                 type: string
 *               monitoring_method:
 *                 type: string
 *               issue_detected:
 *                 type: boolean
 *               response_triggered:
 *                 type: boolean
 *               status_after_check:
 *                 type: string
 *     responses:
 *       200:
 *         description: Risk monitoring record updated successfully
 *       404:
 *         description: Risk monitoring record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      monitoring_id,
      risk_id,
      monitoring_date,
      monitored_by,
      monitoring_method,
      issue_detected,
      response_triggered,
      status_after_check,
    } = body;

    const result = await query(
      `UPDATE risk_monitoring 
       SET monitoring_id = COALESCE($1, monitoring_id),
           risk_id = COALESCE($2, risk_id),
           monitoring_date = COALESCE($3, monitoring_date),
           monitored_by = COALESCE($4, monitored_by),
           monitoring_method = COALESCE($5, monitoring_method),
           issue_detected = COALESCE($6, issue_detected),
           response_triggered = COALESCE($7, response_triggered),
           status_after_check = COALESCE($8, status_after_check),
           updated_at = now()
       WHERE id = $9
       RETURNING *`,
      [monitoring_id, risk_id, monitoring_date, monitored_by, monitoring_method, issue_detected, response_triggered, status_after_check, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk monitoring record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating risk monitoring record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-monitoring/{id}:
 *   delete:
 *     summary: Delete a risk monitoring record
 *     description: Delete a risk monitoring record by ID
 *     tags: [Risk Monitoring]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk monitoring record UUID
 *     responses:
 *       200:
 *         description: Risk monitoring record deleted successfully
 *       404:
 *         description: Risk monitoring record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'DELETE FROM risk_monitoring WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk monitoring record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Risk monitoring record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting risk monitoring record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}