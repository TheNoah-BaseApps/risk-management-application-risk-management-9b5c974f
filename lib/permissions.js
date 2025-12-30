const rolePermissions = {
  Admin: [
    'view_dashboard',
    'view_risks',
    'create_risk',
    'update_risk',
    'delete_risk',
    'view_assignments',
    'assign_risk',
    'update_assignment',
    'delete_assignment',
    'view_reports',
    'view_profile',
    'manage_users',
  ],
  'Risk Manager': [
    'view_dashboard',
    'view_risks',
    'create_risk',
    'update_risk',
    'view_assignments',
    'assign_risk',
    'update_assignment',
    'view_reports',
    'view_profile',
  ],
  'Team Member': [
    'view_dashboard',
    'view_risks',
    'create_risk',
    'view_assignments',
    'update_assignment',
    'view_profile',
  ],
  Viewer: [
    'view_dashboard',
    'view_risks',
    'view_assignments',
    'view_reports',
    'view_profile',
  ],
};

export function checkPermission(role, permission) {
  if (!role || !permission) return false;
  
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  
  return permissions.includes(permission);
}

export function getUserPermissions(role) {
  return rolePermissions[role] || [];
}

export function canCreateRisk(role) {
  return checkPermission(role, 'create_risk');
}

export function canAssignRisk(role) {
  return checkPermission(role, 'assign_risk');
}

export function canDeleteRisk(role) {
  return checkPermission(role, 'delete_risk');
}

export function canManageUsers(role) {
  return checkPermission(role, 'manage_users');
}