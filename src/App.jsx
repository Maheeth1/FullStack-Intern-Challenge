import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// User Pages
import StoresList from './pages/user/StoresList';

// Store Owner Pages
import StoreOwnerDashboard from './pages/store-owner/StoreOwnerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import CreateUser from './pages/admin/CreateUser';
import AdminStoresList from './pages/admin/StoresList';
import CreateStore from './pages/admin/CreateStore';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes for All Users */}
            <Route
              path="/profile"
              element={<PrivateRoute element={<Profile />} />}
            />

            {/* Normal User Routes */}
            <Route
              path="/stores"
              element={<PrivateRoute element={<StoresList />} requiredRoles={['USER']} />}
            />
            <Route
              path="/"
              element={<Navigate to="/stores" />}
            />

            {/* Store Owner Routes */}
            <Route
              path="/store-owner/dashboard"
              element={<PrivateRoute element={<StoreOwnerDashboard />} requiredRoles={['STORE_OWNER']} />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={<PrivateRoute element={<AdminDashboard />} requiredRoles={['ADMIN']} />}
            />
            <Route
              path="/admin/users"
              element={<PrivateRoute element={<UsersList />} requiredRoles={['ADMIN']} />}
            />
            <Route
              path="/admin/users/new"
              element={<PrivateRoute element={<CreateUser />} requiredRoles={['ADMIN']} />}
            />
            <Route
              path="/admin/stores"
              element={<PrivateRoute element={<AdminStoresList />} requiredRoles={['ADMIN']} />}
            />
            <Route
              path="/admin/stores/new"
              element={<PrivateRoute element={<CreateStore />} requiredRoles={['ADMIN']} />}
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
