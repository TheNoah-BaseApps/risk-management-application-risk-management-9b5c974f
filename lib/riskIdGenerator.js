import { query } from '@/lib/db';

export async function generateRiskId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `RISK-${year}-${month}`;

  // Get the count of risks created this month
  const result = await query(
    `SELECT COUNT(*) as count FROM risks 
     WHERE risk_id LIKE $1`,
    [`${prefix}-%`]
  );

  const count = parseInt(result.rows[0].count) + 1;
  const sequence = String(count).padStart(4, '0');

  return `${prefix}-${sequence}`;
}

export async function generateAssignmentId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `ASGN-${year}-${month}`;

  // Get the count of assignments created this month
  const result = await query(
    `SELECT COUNT(*) as count FROM risk_assignments 
     WHERE assignment_id LIKE $1`,
    [`${prefix}-%`]
  );

  const count = parseInt(result.rows[0].count) + 1;
  const sequence = String(count).padStart(4, '0');

  return `${prefix}-${sequence}`;
}