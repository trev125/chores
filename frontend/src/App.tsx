import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import ChoreHistory from "./pages/ChoreHistory";
import SetupWizard from "./pages/SetupWizard";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { SetupProvider, useSetup } from "./contexts/SetupContext";
import { ErrorBoundary } from "./components";

function AppContent() {
  const { setupNeeded, loading, completeSetup } = useSetup();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (setupNeeded) {
    return (
      <ErrorBoundary>
        <SetupWizard onSetupComplete={completeSetup} />
      </ErrorBoundary>
    );
  }

  return (
    <AuthProvider>
      <DataProvider>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="activity" element={<ActivityLog />} />
                <Route path="history" element={<ChoreHistory />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </DataProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SetupProvider>
        <AppContent />
      </SetupProvider>
    </div>
  );
}

export default App;
