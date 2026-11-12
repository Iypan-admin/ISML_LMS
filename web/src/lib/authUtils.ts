// ============================================================================
// ISML COLLEGE LMS — CENTRALIZED LOGOUT / SIGN OUT HELPER
// ============================================================================

export function handleUserLogout() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('isml_user');
      localStorage.removeItem('isml_admin_user');
      localStorage.removeItem('isml_student_profile');
      localStorage.removeItem('isml_token');
      localStorage.removeItem('isml_role');
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing user session', e);
    }
    // Hard navigate to /login so that all React contexts reset completely
    window.location.href = '/login';
  }
}

