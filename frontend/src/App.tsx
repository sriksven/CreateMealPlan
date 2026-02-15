import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Recipes from './pages/Recipes';
import MyPantry from './pages/MyPantry';
import ReceiptScanner from './pages/ReceiptScanner';
import ShoppingList from './pages/ShoppingList';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import AccountDetails from './pages/AccountDetails';
import AppPreferences from './pages/AppPreferences';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected App Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/pantry" element={<MyPantry />} />
            <Route path="/scanner" element={<ReceiptScanner />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/account" element={<AccountDetails />} />
            <Route path="/preferences" element={<AppPreferences />} />

            {/* Redirect old dashboard link or default authenticated view */}
            <Route path="/dashboard" element={<Navigate to="/pantry" replace />} />
          </Route>

          <Route path="*" element={<div className="p-10 text-center text-red-500">Page Not Found</div>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
