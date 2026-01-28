import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Recipes from './pages/Recipes';
import MyPantry from './pages/MyPantry';
import ReceiptScanner from './pages/ReceiptScanner';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Redirect Root to Recipes (1st Tab) */}
          <Route index element={<Navigate to="/recipes" replace />} />

          <Route path="recipes" element={<Recipes />} />
          <Route path="pantry" element={<MyPantry />} />
          <Route path="scanner" element={<ReceiptScanner />} />
          <Route path="profile" element={<Profile />} />

          {/* Fallbacks */}
          <Route path="dashboard" element={<Navigate to="/pantry" replace />} />
          <Route path="*" element={<div className="p-10 text-center">Page Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
