/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
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
    if (!user || !checkPermission(user.role, 'view_dashboard')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Total risks
    const totalRisksResult = await query('SELECT COUNT(*) as count FROM risks');
    const totalRisks = parseInt(totalRisksResult.rows[0].count);

    // Risks by priority (assignments)
    const risksByPriorityResult = await query(
      `SELECT priority_level as priority, COUNT(*) as count
       FROM risk_assignments
       GROUP BY priority_level
       ORDER BY 
         CASE priority_level
           WHEN 'Critical' THEN 1
           WHEN 'High' THEN 2
           WHEN 'Medium' THEN 3
           WHEN 'Low' THEN 4
         END`
    );

    // Critical risks
    const criticalRisksResult = await query(
      `SELECT COUNT(*) as count FROM risk_assignments WHERE priority_level = 'Critical'`
    );
    const criticalRisks = parseInt(criticalRisksResult.rows[0].count);

    // Active assignments
    const activeAssignmentsResult = await query(
      `SELECT COUNT(*) as count FROM risk_assignments
       WHERE assignment_status IN ('Pending', 'In Progress', 'Under Review')`
    );
    const activeAssignments = parseInt(activeAssignmentsResult.rows[0].count);

    // Resolved risks
    const resolvedRisksResult = await query(
      `SELECT COUNT(*) as count FROM risks WHERE status IN ('Resolved', 'Closed')`
    );
    const resolvedRisks = parseInt(resolvedRisksResult.rows[0].count);

    // Overdue assignments
    const overdueAssignmentsResult = await query(
      `SELECT COUNT(*) as count FROM risk_assignments
       WHERE deadline_date < NOW() AND assignment_status NOT IN ('Completed', 'Cancelled')`
    );
    const overdueAssignments = parseInt(overdueAssignmentsResult.rows[0].count);

    // Assignments by status
    const assignmentsByStatusResult = await query(
      `SELECT assignment_status as status, COUNT(*) as count
       FROM risk_assignments
       GROUP BY assignment_status
       ORDER BY count DESC`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          totalRisks,
          criticalRisks,
          activeAssignments,
          resolvedRisks,
          overdueAssignments,
          risksByPriority: risksByPriorityResult.rows,
          assignmentsByStatus: assignmentsByStatusResult.rows,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}