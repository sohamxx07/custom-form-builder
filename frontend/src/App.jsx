import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FormEditor from './pages/FormEditor';
import FormBuilder from './pages/FormBuilder';
import FormPreview from './pages/FormPreview';
import PublicForm from './pages/PublicForm';
import Responses from './pages/Responses';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Marketing Landing Page */}
              <Route path="/" element={<Landing />} />

              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public Form Route - Unauthenticated for Respondents */}
              <Route path="/public/forms/:slug" element={<PublicForm />} />

              {/* Protected Creator Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/new"
                element={
                  <ProtectedRoute>
                    <FormEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/:id/edit"
                element={
                  <ProtectedRoute>
                    <FormEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/:formId/builder"
                element={
                  <ProtectedRoute>
                    <FormBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/:formId/preview"
                element={
                  <ProtectedRoute>
                    <FormPreview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/:formId/responses"
                element={
                  <ProtectedRoute>
                    <Responses />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
