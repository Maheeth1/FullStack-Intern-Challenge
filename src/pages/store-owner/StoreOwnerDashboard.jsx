import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { toast } from 'react-toastify';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const StoreOwnerDashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState({ field: 'createdAt', direction: 'desc' });

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stores/owner/ratings');
      setStoreData(response.data.store);
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError(error.response?.data?.message || 'Failed to load store data');
      toast.error(error.response?.data?.message || 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSorting((prev) => ({
      field,
      direction:
        prev.field === field
          ? prev.direction === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc',
    }));
  };

  const getSortIcon = (field) => {
    if (sorting.field !== field) return <FaSort className="text-gray-400" />;
    return sorting.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Sort ratings based on current sorting
  const getSortedRatings = () => {
    if (!storeData || !storeData.ratings) return [];

    return [...storeData.ratings].sort((a, b) => {
      let aValue, bValue;

      // Handle special cases
      if (sorting.field === 'name') {
        aValue = a.user.name;
        bValue = b.user.name;
      } else if (sorting.field === 'email') {
        aValue = a.user.email;
        bValue = b.user.email;
      } else {
        aValue = a[sorting.field];
        bValue = b[sorting.field];
      }

      if (typeof aValue === 'string') {
        return sorting.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sorting.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">Notice</h2>
          <p className="text-yellow-500">You don't have a store assigned to your account yet. Please contact the system administrator.</p>
        </div>
      </div>
    );
  }

  const sortedRatings = getSortedRatings();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Store Dashboard</h1>

      {/* Store Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">{storeData.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 mb-1">Address</p>
            <p className="font-medium">{storeData.address}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Email</p>
            <p className="font-medium">{storeData.email}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Overall Rating</p>
            <div className="flex items-center">
              <StarRating
                initialRating={storeData.averageRating || 0}
                readOnly={true}
              />
              <span className="ml-2">
                ({storeData.averageRating ? storeData.averageRating.toFixed(1) : '0.0'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ratings Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-1">Total Ratings</p>
            <p className="text-3xl font-bold text-blue-600">{storeData.totalRatings || 0}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-1">Average Rating</p>
            <p className="text-3xl font-bold text-green-600">
              {storeData.averageRating ? storeData.averageRating.toFixed(1) : '0.0'}
            </p>
          </div>
        </div>
      </div>

      {/* User Ratings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">User Ratings</h2>
        </div>

        {sortedRatings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No ratings submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      User Name
                      <span className="ml-1">{getSortIcon('name')}</span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      <span className="ml-1">{getSortIcon('email')}</span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center">
                      Rating
                      <span className="ml-1">{getSortIcon('value')}</span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date Submitted
                      <span className="ml-1">{getSortIcon('createdAt')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedRatings.map((rating) => (
                  <tr key={rating.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rating.user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {rating.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StarRating
                          initialRating={rating.value}
                          readOnly={true}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
