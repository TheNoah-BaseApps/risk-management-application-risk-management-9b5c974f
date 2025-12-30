import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-reports/{id}:
 *   get:
 *     summary: Get a specific risk report
 *     description: Retrieve a single risk report by ID
 *     tags: [Risk Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk report ID
 *     responses:
 *       200:
 *         description: Risk report details
 *       404:
 *         description: Risk report not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM risk_reports WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching risk report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-reports/{id}:
 *   put:
 *     summary: Update a risk report
 *     description: Update an existing risk report
 *     tags: [Risk Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               report_id:
 *                 type: string
 *               risk_id:
 *                 type: string
 *               report_date:
 *                 type: string
 *                 format: date-time
 *               reporter_name:
 *                 type: string
 *               report_summary:
 *                 type: string
 *               report_type:
 *                 type: string
 *               attached_documents:
 *                 type: string
 *               distribution_list:
 *                 type: string
 *     responses:
 *       200:
 *         description: Risk report updated
 *       404:
 *         description: Risk report not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      report_id,
      risk_id,
      report_date,
      reporter_name,
      report_summary,
      report_type,
      attached_documents,
      distribution_list
    } = body;

    const queryText = `
      UPDATE risk_reports
      SET report_id = $1, risk_id = $2, report_date = $3, reporter_name = $4,
          report_summary = $5, report_type = $6, attached_documents = $7,
          distribution_list = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;

    const result = await query(queryText, [
      report_id,
      risk_id,
      report_date,
      reporter_name,
      report_summary,
      report_type,
      attached_documents,
      distribution_list,
      id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating risk report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-reports/{id}:
 *   delete:
 *     summary: Delete a risk report
 *     description: Remove a risk report from the system
 *     tags: [Risk Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Risk report deleted
 *       404:
 *         description: Risk report not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM risk_reports WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Risk report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting risk report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}