/**
 * @swagger
 * /api/risks:
 *   get:
 *     summary: Get all risks with optional filters
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of risks
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new risk
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               risk_category:
 *                 type: string
 *               risk_description:
 *                 type: string
 *               risk_source:
 *                 type: string
 *               risk_trigger:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';
import { generateRiskId } from '@/lib/riskIdGenerator';
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
    if (!user || !checkPermission(user.role, 'view_risks')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = `
      SELECT r.*, u.name as identified_by_name,
             (SELECT COUNT(*) FROM risk_assignments WHERE risk_id = r.id) as assignments_count
      FROM risks r
      LEFT JOIN users u ON r.identified_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      sql += ` AND r.risk_category = $${paramCount}`;
      params.push(category);
    }

    if (status) {
      paramCount++;
      sql += ` AND r.status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      sql += ` AND (r.risk_id ILIKE $${paramCount} OR r.risk_description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get risks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risks' },
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
    if (!user || !checkPermission(user.role, 'create_risk')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { risk_category, risk_description, risk_source, risk_trigger, status } = body;

    // Validation
    if (!risk_category || !risk_description || !risk_source) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (risk_description.length < 20 || risk_description.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Risk description must be between 20 and 1000 characters' },
        { status: 400 }
      );
    }

    const validCategories = ['Technical', 'Financial', 'Operational', 'Strategic', 'Compliance', 'Security', 'Other'];
    if (!validCategories.includes(risk_category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid risk category' },
        { status: 400 }
      );
    }

    const validSources = ['Internal Audit', 'External Audit', 'Customer Feedback', 'Incident Report', 'Project Review', 'Regulatory Change', 'Market Analysis', 'Other'];
    if (!validSources.includes(risk_source)) {
      return NextResponse.json(
        { success: false, error: 'Invalid risk source' },
        { status: 400 }
      );
    }

    // Generate risk ID
    const risk_id = await generateRiskId();

    // Insert risk
    const result = await query(
      `INSERT INTO risks (
        risk_id, identified_by, identification_date, risk_category,
        risk_description, risk_source, risk_trigger, status, created_at, updated_at
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *`,
      [risk_id, user.id, risk_category, risk_description, risk_source, risk_trigger || null, status || 'Identified']
    );

    return NextResponse.json(
      { success: true, message: 'Risk created successfully', data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create risk error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create risk' },
      { status: 500 }
    );
  }
}