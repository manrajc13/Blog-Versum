/**
 * Routing guards for BlogVerse
 *
 * AuthGuard   — wraps authenticated-only routes (e.g. /home, /journal).
 *               If authUser is null, redirects to the public landing page (/).
 *
 * PublicRoute — wraps public-only routes (/, /login, /signup).
 *               If authUser is already set, redirects to /home.
 *
 * Usage in App.jsx / router config:
 *
 *   <Route path="/"      element={<PublicRoute authUser={authUser}><Home2 /></PublicRoute>} />
 *   <Route path="/login" element={<PublicRoute authUser={authUser}><Login /></PublicRoute>} />
 *   <Route path="/signup"element={<PublicRoute authUser={authUser}><Signup /></PublicRoute>} />
 *   <Route path="/home"  element={<AuthGuard  authUser={authUser}><Home  authUser={authUser}/></AuthGuard>} />
 *   <Route path="/journal" element={<AuthGuard authUser={authUser}><Journal /></AuthGuard>} />
 *
 * The authUser prop comes straight from useAuthStore in the top-level App component,
 * populated after checkAuth() resolves. While checkAuth is in-flight, render nothing
 * (or a Loader) so guards don't flash the wrong page.
 */

import { Navigate } from 'react-router-dom'

/**
 * Protects authenticated routes.
 * Redirects unauthenticated visitors to the public landing page.
 */
export function AuthGuard({ authUser, children }) {
  if (!authUser) {
    return <Navigate to="/" replace />
  }
  return children
}

/**
 * Protects public-only routes (login, signup, landing).
 * Redirects already-authenticated users to the main feed.
 */
export function PublicRoute({ authUser, children }) {
  if (authUser) {
    return <Navigate to="/home" replace />
  }
  return children
}
