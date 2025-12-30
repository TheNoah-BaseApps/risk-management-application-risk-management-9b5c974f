/**
 * @swagger
 * /api/risks/{id}/updates:
 *   get:
 *     summary: Get risk update history
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
 *         description: Risk update history
 *       500:
 *         description: Server error
 *   post:
 *     summary: Log risk update activity
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
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
 *               update_type:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Update logged
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;

    const result = await query(
      `SELECT ru.*, u.name as updated_by_name
       FROM risk_updates ru
       LEFT JOIN users u ON ru.updated_by = u.id
       WHERE ru.risk_id = $1
       ORDER BY ru.created_at DESC`,
      [id]
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get risk updates error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risk updates' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    const { id } = params;
    const body = await request.json();
    const { update_type, comment, previous_value, new_value } = body;

    const result = await query(
      `INSERT INTO risk_updates (risk_id, updated_by, update_type, previous_value, new_value, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [id, user.id, update_type, previous_value || null, new_value || null, comment || null]
    );

    return NextResponse.json(
      { success: true, message: 'Update logged successfully', data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Log risk update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log update' },
      { status: 500 }
    );
  }
}