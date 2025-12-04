// API Configuration for Express.js Backend
// Uses environment variable for flexibility (localhost for dev, Railway for production)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backtest-production-7.up.railway.app";

// Helper function to get the full API URL
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

// Helper to get auth headers with JWT token
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// API Endpoints mapping - Only endpoints that exist in Express.js backend
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',      // POST - { email, password } -> { token, user }
    SIGNUP: '/auth/signup',    // POST - { first_name, last_name, email, password } -> { userId }
    GOOGLE: '/auth/google',    // POST - { credential } -> { token, user, needsPasswordSetup }
  },
  // Users endpoints (protected - requires JWT)
  USERS: {
    GET: (id: string | number) => `/users/${id}`,           // GET -> user data
    UPDATE_NAME: (id: string | number) => `/users/name/${id}`, // PUT - { first_name, last_name }
    SET_PASSWORD: (id: string | number) => `/users/password/${id}`, // PUT - { password }
  },
  // Teams endpoints (protected - requires JWT)
  TEAMS: {
    GET_ALL: '/teams',                                               // GET -> user's teams array
    GET_BY_URL: (teamUrl: string) => `/teams/${teamUrl}`,            // GET -> single team with members
    GET_REPORT: (teamUrl: string) => `/teams/${teamUrl}/report`,     // GET -> team statistics/report
    CREATE: '/teams',                                                // POST - { team_name, team_url? }
    UPDATE: (teamId: string | number) => `/teams/${teamId}`,         // PUT - { team_name }
    DELETE: (teamId: string | number) => `/teams/${teamId}`,         // DELETE
    ADD_MEMBER: (teamId: string | number) => `/teams/${teamId}/members`,              // POST - { email, role }
    REMOVE_MEMBER: (teamId: string | number, userId: string | number) => `/teams/${teamId}/members/${userId}`, // DELETE
    LEAVE_TEAM: (teamId: string | number, userId: string | number) => `/teams/${teamId}/members/${userId}`,    // POST
  },
  // Projects endpoints (protected - requires JWT)
  PROJECTS: {
    GET_BY_URL: (projectUrl: string) => `/projects/${projectUrl}`,    // GET -> single project with participants
    GET_BY_TEAM: '/projects',                                         // GET /projects?team_id=X
    CREATE: '/projects',                                              // POST - { project_name, description, team_id, project_url? }
    DELETE: (projectId: string | number) => `/projects/${projectId}`, // DELETE - delete project
    ADD_PARTICIPANT: (projectId: string | number) => `/projects/${projectId}/participants`,              // POST - { userId }
    REMOVE_PARTICIPANT: (projectId: string | number, userId: string | number) => `/projects/${projectId}/participants/${userId}`, // DELETE
  },
  // Tasks endpoints (protected - requires JWT)
  TASKS: {
    GET_BY_PROJECT: '/tasks',                                // GET /tasks?project_id=X
    CREATE: '/tasks/task/create',                            // POST - { title, project_id, assigned_user_id?, due_date?, priority?, description?, status? }
    UPDATE_STATUS: (taskId: string | number) => `/tasks/task/update/${taskId}`, // PUT - { status }
  },
  // Comments endpoints (protected - requires JWT)
  COMMENTS: {
    CREATE: (taskId: string | number) => `/comments/comment/create/${taskId}`, // POST - { comment_text }
    GET: (taskId: string | number) => `/comments/task/create/${taskId}`,       // GET -> comments array
    DELETE: (commentId: string | number) => `/comments/delete/${commentId}`,   // DELETE
  },
  // Notifications endpoints (protected - requires JWT)
  NOTIFICATIONS: {
    CREATE: '/notifications',                                   // POST (admin only) - { title, message, task_id }
    GET_ALL: '/notifications',                                  // GET -> notifications array
    MARK_READ: (id: string | number) => `/notifications/${id}/read`, // PUT
    DELETE: (id: string | number) => `/notifications/${id}`,        // DELETE (admin only)
  },
};

/**
 * FEATURES NOT AVAILABLE IN EXPRESS.JS BACKEND:
 * 
 * 1. Teams:
 *    - GET /teams (fetch user's teams list) - NOT AVAILABLE
 *    - PUT /teams/:id (update team) - NOT AVAILABLE
 *    - DELETE /teams/:id (delete team) - NOT AVAILABLE
 *    - GET /teams/:id (get single team) - NOT AVAILABLE
 *    - GET /teams/:id/members (get team members) - NOT AVAILABLE
 * 
 * 2. Projects:
 *    - GET /projects (fetch projects list) - NOT AVAILABLE
 *    - GET /projects/:id (get single project) - NOT AVAILABLE
 *    - PUT /projects/:id (update project) - NOT AVAILABLE
 *    - DELETE /projects/:id (delete project) - NOT AVAILABLE
 * 
 * 3. Tasks:
 *    - GET /tasks (fetch tasks list) - NOT AVAILABLE
 *    - GET /tasks/:id (get single task) - NOT AVAILABLE
 *    - PUT /tasks/:id (update task) - NOT AVAILABLE (only status update available)
 *    - DELETE /tasks/:id (delete task) - NOT AVAILABLE
 *    - POST /tasks/assign (assign users to task) - NOT AVAILABLE
 * 
 * 4. Task Files:
 *    - All file operations - NOT AVAILABLE
 * 
 * 5. Reports:
 *    - All report endpoints - NOT AVAILABLE
 * 
 * 6. Google OAuth:
 *    - NOT AVAILABLE
 * 
 * 7. User Profile:
 *    - Profile image upload - NOT AVAILABLE
 *    - Full profile update - NOT AVAILABLE (only name update available)
 */
