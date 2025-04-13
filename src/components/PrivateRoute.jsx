import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const mockUserData = {
  currentUser: {
    role: 'ADMIN', // Example role for mocked data
  },
  loading: false, // Example loading state for mocked data
};

const PrivateRoute = ({ element, requiredRoles = [] }) => {
  // Use mocked data instead of useAuth
  const { currentUser, loading } = mockUserData;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has the required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.role)) {
    // Redirect based on user role
    if (currentUser.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" />;
    } else if (currentUser.role === 'STORE_OWNER') {
      return <Navigate to="/store-owner/dashboard" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  return element;
};

export default PrivateRoute;
