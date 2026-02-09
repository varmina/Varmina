import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicCatalog } from './pages/PublicCatalog';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicLayout>
          <PublicCatalog />
        </PublicLayout>
      } />

      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
