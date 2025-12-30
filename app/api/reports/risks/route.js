/**
 * @swagger
 * /api/reports/risks:
 *   get:
 *     summary: Generate risk report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *     responses:
 *       200:
 *         description: Risk report
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';
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
    if (!user || !checkPermission(user.role, 'view_reports')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json';

    let sql = `
      SELECT r.risk_id, r.risk_category, r.risk_description, r.risk_source,
             r.status, r.identification_date, u.name as identified_by,
             COUNT(ra.id) as assignment_count
      FROM risks r
      LEFT JOIN users u ON r.identified_by = u.id
      LEFT JOIN risk_assignments ra ON r.id = ra.risk_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (startDate) {
      paramCount++;
      sql += ` AND r.identification_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      sql += ` AND r.identification_date <= $${paramCount}`;
      params.push(endDate);
    }

    sql += ' GROUP BY r.id, u.name ORDER BY r.identification_date DESC';

    const result = await query(sql, params);

    // Generate CSV if requested
    if (format === 'csv') {
      const headers = ['Risk ID', 'Category', 'Description', 'Source', 'Status', 'Identified By', 'Date', 'Assignments'];
      const rows = result.rows.map((row) => [
        row.risk_id,
        row.risk_category,
        `"${row.risk_description.replace(/"/g, '""')}"`,
        row.risk_source,
        row.status,
        row.identified_by,
        new Date(row.identification_date).toISOString().split('T')[0],
        row.assignment_count,
      ]);

      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      return NextResponse.json(
        { success: true, csv, data: result.rows },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}