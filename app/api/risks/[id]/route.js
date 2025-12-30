/**
 * @swagger
 * /api/risks/{id}:
 *   get:
 *     summary: Get single risk details
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Risk details
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update risk
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Risk updated
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete risk
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Risk deleted
 *       400:
 *         description: Cannot delete risk with active assignments
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query, getClient } from '@/lib/db';
import { checkPermission } from '@/lib/permissions';

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || !checkPermission(user.role, 'view_risks')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;

    const result = await query(
      `SELECT r.*, u.name as identified_by_name
       FROM risks r
       LEFT JOIN users u ON r.identified_by = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk not found' },
        { status: 404 }
      );
    }

    const risk = result.rows[0];

    // Get assignments
    const assignmentsResult = await query(
      `SELECT ra.*, u1.name as assigned_to_name, u2.name as assigned_by_name
       FROM risk_assignments ra
       LEFT JOIN users u1 ON ra.assigned_to = u1.id
       LEFT JOIN users u2 ON ra.assigned_by = u2.id
       WHERE ra.risk_id = $1
       ORDER BY ra.created_at DESC`,
      [id]
    );

    risk.assignments = assignmentsResult.rows;

    return NextResponse.json(
      { success: true, data: risk },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get risk error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risk details' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || !checkPermission(user.role, 'update_risk')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { risk_category, risk_description, risk_source, risk_trigger, status } = body;

    // Validation
    if (risk_description && (risk_description.length < 20 || risk_description.length > 1000)) {
      return NextResponse.json(
        { success: false, error: 'Risk description must be between 20 and 1000 characters' },
        { status: 400 }
      );
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Get current risk
      const currentRisk = await client.query('SELECT * FROM risks WHERE id = $1', [id]);
      if (currentRisk.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Risk not found' },
          { status: 404 }
        );
      }

      const current = currentRisk.rows[0];

      // Update risk
      const result = await client.query(
        `UPDATE risks
         SET risk_category = COALESCE($1, risk_category),
             risk_description = COALESCE($2, risk_description),
             risk_source = COALESCE($3, risk_source),
             risk_trigger = COALESCE($4, risk_trigger),
             status = COALESCE($5, status),
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [risk_category, risk_description, risk_source, risk_trigger, status, id]
      );

      // Log update if status changed
      if (status && status !== current.status) {
        await client.query(
          `INSERT INTO risk_updates (risk_id, updated_by, update_type, previous_value, new_value, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [id, user.id, 'Status Change', current.status, status]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json(
        { success: true, message: 'Risk updated successfully', data: result.rows[0] },
        { status: 200 }
      );
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update risk error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update risk' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || !checkPermission(user.role, 'delete_risk')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check for active assignments
    const assignmentsCheck = await query(
      `SELECT COUNT(*) as count FROM risk_assignments
       WHERE risk_id = $1 AND assignment_status NOT IN ('Completed', 'Cancelled')`,
      [id]
    );

    if (parseInt(assignmentsCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete risk with active assignments' },
        { status: 400 }
      );
    }

    const result = await query('DELETE FROM risks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Risk deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete risk error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete risk' },
      { status: 500 }
    );
  }
}