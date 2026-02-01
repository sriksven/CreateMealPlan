import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Recipes from './pages/Recipes';
import MyPantry from './pages/MyPantry';
import ReceiptScanner from './pages/ReceiptScanner';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected App */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/recipes" replace />} />

            <Route path="recipes" element={<Recipes />} />
            <Route path="pantry" element={<MyPantry />} />
            <Route path="scanner" element={<ReceiptScanner />} />
            <Route path="profile" element={<Profile />} />

            <Route path="dashboard" element={<Navigate to="/pantry" replace />} />
            <Route path="*" element={<div className="p-10 text-center">Page Not Found</div>} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
