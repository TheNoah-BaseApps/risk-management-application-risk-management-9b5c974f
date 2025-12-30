/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get single assignment details
 *     tags: [Assignments]
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
 *         description: Assignment details
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update assignment
 *     tags: [Assignments]
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
 *         description: Assignment updated
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete assignment
 *     tags: [Assignments]
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
 *         description: Assignment deleted
 *       404:
 *         description: Assignment not found
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
    if (!user || !checkPermission(user.role, 'view_assignments')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;

    const result = await query(
      `SELECT ra.*, r.risk_id as risk_id_code, r.risk_category, r.status as risk_status,
              u1.name as assigned_to_name, u2.name as assigned_by_name
       FROM risk_assignments ra
       LEFT JOIN risks r ON ra.risk_id = r.id
       LEFT JOIN users u1 ON ra.assigned_to = u1.id
       LEFT JOIN users u2 ON ra.assigned_by = u2.id
       WHERE ra.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get assignment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignment details' },
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
    if (!user || !checkPermission(user.role, 'update_assignment')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { assignment_status, priority_level, deadline_date, notes } = body;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Get current assignment
      const currentAssignment = await client.query(
        'SELECT * FROM risk_assignments WHERE id = $1',
        [id]
      );

      if (currentAssignment.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Assignment not found' },
          { status: 404 }
        );
      }

      const current = currentAssignment.rows[0];

      // Update assignment
      const result = await client.query(
        `UPDATE risk_assignments
         SET assignment_status = COALESCE($1, assignment_status),
             priority_level = COALESCE($2, priority_level),
             deadline_date = COALESCE($3, deadline_date),
             notes = COALESCE($4, notes),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [assignment_status, priority_level, deadline_date, notes, id]
      );

      // Log status change
      if (assignment_status && assignment_status !== current.assignment_status) {
        await client.query(
          `INSERT INTO risk_updates (risk_id, updated_by, update_type, previous_value, new_value, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [current.risk_id, user.id, 'Assignment Status Change', current.assignment_status, assignment_status]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json(
        { success: true, message: 'Assignment updated successfully', data: result.rows[0] },
        { status: 200 }
      );
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assignment' },
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
    if (!user || !checkPermission(user.role, 'delete_assignment')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;

    const result = await query('DELETE FROM risk_assignments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Assignment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete assignment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}