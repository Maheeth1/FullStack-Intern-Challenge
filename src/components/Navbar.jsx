import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect based on user role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'ADMIN' && window.location.pathname === '/') {
        navigate('/admin/dashboard');
      } else if (currentUser.role === 'STORE_OWNER' && window.location.pathname === '/') {
        navigate('/store-owner/dashboard');
      }
    }
  }, [currentUser, navigate]);

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Store Rating App
        </Link>

        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <Link to="/profile" className="hover:text-blue-200">
                Profile
              </Link>

              {currentUser.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" className="hover:text-blue-200">
                    Dashboard
                  </Link>
                  <Link to="/admin/users" className="hover:text-blue-200">
                    Users
                  </Link>
                  <Link to="/admin/stores" className="hover:text-blue-200">
                    Stores
                  </Link>
                </>
              )}

              {currentUser.role === 'STORE_OWNER' && (
                <Link to="/store-owner/dashboard" className="hover:text-blue-200">
                  Store Dashboard
                </Link>
              )}

              {currentUser.role === 'USER' && (
                <Link to="/stores" className="hover:text-blue-200">
                  Stores
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-1 rounded"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
