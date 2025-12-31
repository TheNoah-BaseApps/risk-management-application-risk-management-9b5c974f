import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risk-validations:
 *   get:
 *     summary: Get all risk validations
 *     description: Retrieve a list of all risk validation records with pagination support
 *     tags:
 *       - Risk Validations
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by validation status
 *     responses:
 *       200:
 *         description: List of risk validations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM risk_validations';
    let countQuery = 'SELECT COUNT(*) FROM risk_validations';
    const params = [];
    const whereConditions = [];

    if (status) {
      whereConditions.push(`validation_status = $${params.length + 1}`);
      params.push(status);
    }

    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      queryText += whereClause;
      countQuery += whereClause;
    }

    queryText += ` ORDER BY validation_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      query(queryText, params),
      query(countQuery, params.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching risk validations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risk-validations:
 *   post:
 *     summary: Create a new risk validation
 *     description: Add a new risk validation record to the system
 *     tags:
 *       - Risk Validations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - validation_id
 *               - validated_by
 *               - validation_date
 *               - validation_status
 *               - validation_method
 *               - validation_score
 *               - validation_reviewer
 *             properties:
 *               validation_id:
 *                 type: string
 *                 description: Unique validation identifier
 *               validated_by:
 *                 type: string
 *                 description: Name of person who performed validation
 *               validation_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of validation
 *               validation_status:
 *                 type: string
 *                 description: Validation status (Approved, Rejected, Pending Review)
 *               validation_notes:
 *                 type: string
 *                 description: Additional validation notes
 *               validation_method:
 *                 type: string
 *                 description: Method used for validation
 *               validation_score:
 *                 type: integer
 *                 description: Validation score (0-100)
 *               validation_reviewer:
 *                 type: string
 *                 description: Name of validation reviewer
 *               validation_reference:
 *                 type: string
 *                 description: Reference documentation or ID
 *               validation_audit_log:
 *                 type: string
 *                 description: Audit log entries
 *     responses:
 *       201:
 *         description: Risk validation created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      validation_id,
      validated_by,
      validation_date,
      validation_status,
      validation_notes,
      validation_method,
      validation_score,
      validation_reviewer,
      validation_reference,
      validation_audit_log
    } = body;

    // Validation
    if (!validation_id || !validated_by || !validation_date || !validation_status || !validation_method || validation_score === undefined || !validation_reviewer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (validation_score < 0 || validation_score > 100) {
      return NextResponse.json(
        { success: false, error: 'Validation score must be between 0 and 100' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO risk_validations 
       (validation_id, validated_by, validation_date, validation_status, validation_notes, 
        validation_method, validation_score, validation_reviewer, validation_reference, validation_audit_log) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [validation_id, validated_by, validation_date, validation_status, validation_notes,
       validation_method, validation_score, validation_reviewer, validation_reference, validation_audit_log]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk validation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}