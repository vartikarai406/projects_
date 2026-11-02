import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { ReportIncidentPage } from './pages/ReportIncidentPage';
import { VerificationPage } from './pages/VerificationPage';
import { InventoryPage } from './pages/InventoryPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { ShelterPage } from './pages/ShelterPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { ForecastPage } from './pages/ForecastPage';
import { AuditPage } from './pages/AuditPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading ResQNet Operations Console...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <OfflineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedLayout>
                  <MapPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedLayout>
                  <ReportIncidentPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/verification"
              element={
                <ProtectedLayout>
                  <VerificationPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedLayout>
                  <InventoryPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/optimizer"
              element={
                <ProtectedLayout>
                  <OptimizerPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/shelters"
              element={
                <ProtectedLayout>
                  <ShelterPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/volunteers"
              element={
                <ProtectedLayout>
                  <VolunteerPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/forecast"
              element={
                <ProtectedLayout>
                  <ForecastPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedLayout>
                  <AuditPage />
                </ProtectedLayout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </OfflineProvider>
    </AuthProvider>
  );
};

export default App;
