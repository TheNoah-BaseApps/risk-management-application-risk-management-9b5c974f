CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'Team Member' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS risks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  risk_id text NOT NULL UNIQUE,
  identified_by uuid NOT NULL,
  identification_date timestamp with time zone DEFAULT now() NOT NULL,
  risk_category text NOT NULL,
  risk_description text NOT NULL,
  risk_source text NOT NULL,
  risk_trigger text,
  status text DEFAULT 'Identified' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_risks_risk_id ON risks (risk_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks (status);
CREATE INDEX IF NOT EXISTS idx_risks_category ON risks (risk_category);
CREATE INDEX IF NOT EXISTS idx_risks_identified_by ON risks (identified_by);

CREATE TABLE IF NOT EXISTS risk_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  assignment_id text NOT NULL UNIQUE,
  risk_id uuid NOT NULL,
  assigned_to uuid NOT NULL,
  assigned_by uuid NOT NULL,
  assignment_date timestamp with time zone DEFAULT now() NOT NULL,
  assignment_status text DEFAULT 'Pending' NOT NULL,
  priority_level text NOT NULL,
  deadline_date timestamp with time zone NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assignments_assignment_id ON risk_assignments (assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignments_risk_id ON risk_assignments (risk_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON risk_assignments (assigned_to);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON risk_assignments (assignment_status);
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON risk_assignments (priority_level);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON risk_assignments (deadline_date);

CREATE TABLE IF NOT EXISTS risk_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  risk_id uuid NOT NULL,
  updated_by uuid NOT NULL,
  update_type text NOT NULL,
  previous_value text,
  new_value text,
  comment text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_updates_risk_id ON risk_updates (risk_id);
CREATE INDEX IF NOT EXISTS idx_updates_updated_by ON risk_updates (updated_by);
CREATE INDEX IF NOT EXISTS idx_updates_created_at ON risk_updates (created_at);