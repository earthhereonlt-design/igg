import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Navigation from './components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';

function PrivateRoute({ children, reqAdmin = false }: { children: React.ReactNode, reqAdmin?: boolean }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (reqAdmin && !user.isAdmin) return <Navigate to="/dashboard" />;
  return children;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen pb-20 md:pb-0">
      <div className="flex-1 md:ml-64 overflow-y-auto">
        {children}
      </div>
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <MainLayout><Dashboard /></MainLayout>
              </PrivateRoute>
            } />
            <Route path="/reports" element={
              <PrivateRoute>
                <MainLayout><Reports /></MainLayout>
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <MainLayout><Profile /></MainLayout>
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute reqAdmin={true}>
                <MainLayout><AdminDashboard /></MainLayout>
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

