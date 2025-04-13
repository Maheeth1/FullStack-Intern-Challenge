import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaUsers, FaStore, FaStar } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/dashboard-stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Users Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex">
          <div className="flex-shrink-0 mr-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUsers className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
              View Users →
            </Link>
          </div>
        </div>

        {/* Stores Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex">
          <div className="flex-shrink-0 mr-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FaStore className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Total Stores</p>
            <p className="text-2xl font-bold">{stats.totalStores}</p>
            <Link to="/admin/stores" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
              View Stores →
            </Link>
          </div>
        </div>

        {/* Ratings Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex">
          <div className="flex-shrink-0 mr-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaStar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Total Ratings</p>
            <p className="text-2xl font-bold">{stats.totalRatings}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/users/new"
            className="block p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            <h3 className="font-medium text-blue-700">Add New User</h3>
            <p className="text-sm text-gray-600 mt-1">Create a new user account</p>
          </Link>

          <Link
            to="/admin/stores/new"
            className="block p-4 border border-green-200 rounded-lg hover:bg-green-50 transition"
          >
            <h3 className="font-medium text-green-700">Add New Store</h3>
            <p className="text-sm text-gray-600 mt-1">Register a new store on the platform</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
