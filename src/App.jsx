import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PatientHome from './pages/PatientHome';
import SearchDoctors from './pages/SearchDoctors';
import DoctorProfile from './pages/DoctorProfile';
import PatientAppointments from './pages/PatientAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAvailability from './pages/DoctorAvailability';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import SpecialtyManagement from './pages/SpecialtyManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<PatientHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchDoctors />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />

              {/* Espace Patient Sécurisé */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientAppointments />
                  </ProtectedRoute>
                }
              />

              {/* Espace Médecin Sécurisé */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/availability"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorAvailability />
                  </ProtectedRoute>
                }
              />

              {/* Espace Administrateur Sécurisé */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/specialties"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SpecialtyManagement />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
