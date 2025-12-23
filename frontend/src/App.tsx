import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ROUTES } from './constants';

// Components
import Layout from './components/layout/Layout/Layout';
import { NotificationProvider } from './components/ui/NotificationProvider/NotificationProvider';

// Pages
import HomePage from './pages/public/HomePage/HomePage';
import LoginPage from './pages/public/LoginPage/LoginPage';
import RegisterPage from './pages/public/RegisterPage/RegisterPage';
import NeedsPage from './pages/public/NeedsPage/NeedsPage';
import TrackPage from './pages/public/TrackPage/TrackPage';
import PredictionsPage from './pages/official/PredictionsPage/PredictionsPage';

// Protected Routes
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      {/* Layout as parent route - all nested routes will render at <Outlet /> */}
      <Route element={<Layout />}>
        {/* Home page route */}
        <Route path={ROUTES.HOME} element={<HomePage />} />

        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.NEEDS} element={<NeedsPage />} />
        <Route path={ROUTES.TRACK} element={<TrackPage />} />

        {/* Official protected routes */}
        <Route
          path="/official/*"
          element={
            <ProtectedRoute requiredRole="official">
              <Routes>
                <Route path="predictions" element={<PredictionsPage />} />
                <Route path="*" element={<Navigate to="predictions" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Admin protected routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <div className="container mx-auto py-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="mt-2 text-gray-600">Admin dashboard coming soon...</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </NotificationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
