/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all assignments with filters
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assignments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create new risk assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               risk_id:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *               priority_level:
 *                 type: string
 *               deadline_date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assignment created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query, getClient } from '@/lib/db';
import { generateAssignmentId } from '@/lib/riskIdGenerator';
import { checkPermission } from '@/lib/permissions';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = searchParams.get('limit');

    let sql = `
      SELECT ra.*, r.risk_id as risk_id_code, r.risk_category, r.status as risk_status,
             u1.name as assigned_to_name, u2.name as assigned_by_name
      FROM risk_assignments ra
      LEFT JOIN risks r ON ra.risk_id = r.id
      LEFT JOIN users u1 ON ra.assigned_to = u1.id
      LEFT JOIN users u2 ON ra.assigned_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      sql += ` AND ra.assignment_status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      sql += ` AND ra.priority_level = $${paramCount}`;
      params.push(priority);
    }

    sql += ' ORDER BY ra.created_at DESC';

    if (limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    }

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: { assignments: result.rows } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || !checkPermission(user.role, 'assign_risk')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { risk_id, assigned_to, priority_level, deadline_date, notes, assignment_status } = body;

    // Validation
    if (!risk_id || !assigned_to || !priority_level || !deadline_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validPriorities = ['Critical', 'High', 'Medium', 'Low'];
    if (!validPriorities.includes(priority_level)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority level' },
        { status: 400 }
      );
    }

    // Check deadline is in future
    if (new Date(deadline_date) <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Deadline must be in the future' },
        { status: 400 }
      );
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Generate assignment ID
      const assignment_id = await generateAssignmentId();

      // Insert assignment
      const result = await client.query(
        `INSERT INTO risk_assignments (
          assignment_id, risk_id, assigned_to, assigned_by, assignment_date,
          assignment_status, priority_level, deadline_date, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, NOW(), NOW())
        RETURNING *`,
        [
          assignment_id,
          risk_id,
          assigned_to,
          user.id,
          assignment_status || 'Pending',
          priority_level,
          deadline_date,
          notes || null,
        ]
      );

      // Update risk status to 'Assigned' if it's 'Identified'
      await client.query(
        `UPDATE risks SET status = 'Assigned', updated_at = NOW()
         WHERE id = $1 AND status = 'Identified'`,
        [risk_id]
      );

      // Log assignment creation
      await client.query(
        `INSERT INTO risk_updates (risk_id, updated_by, update_type, new_value, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [risk_id, user.id, 'Assignment Created', assignment_id]
      );

      await client.query('COMMIT');

      return NextResponse.json(
        { success: true, message: 'Assignment created successfully', data: result.rows[0] },
        { status: 201 }
      );
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}