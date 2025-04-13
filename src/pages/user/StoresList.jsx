import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { toast } from 'react-toastify';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState({ field: 'name', direction: 'asc' });
  const [ratings, setRatings] = useState({});
  const [originalRatings, setOriginalRatings] = useState({});
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stores');
      setStores(response.data.stores);

      // Initialize ratings state from store data
      const initialRatings = {};
      const initialOriginalRatings = {};

      response.data.stores.forEach((store) => {
        initialRatings[store.id] = store.userRating || 0;
        initialOriginalRatings[store.id] = store.userRating || 0;
      });

      setRatings(initialRatings);
      setOriginalRatings(initialOriginalRatings);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

  const handleRatingChange = (storeId, value) => {
    setRatings((prev) => ({ ...prev, [storeId]: value }));
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedStore(null);
  };

  const submitRating = async () => {
    if (!selectedStore) return;

    try {
      const storeId = selectedStore.id;
      const value = ratings[storeId];

      await api.post('/ratings', { storeId, value });

      // Update original ratings
      setOriginalRatings((prev) => ({ ...prev, [storeId]: value }));

      // Update the store in the list
      setStores((prev) =>
        prev.map((store) =>
          store.id === storeId
            ? { ...store, userRating: value }
            : store
        )
      );

      toast.success('Rating submitted successfully');
      closeRatingModal();
      fetchStores(); // Refresh to get updated averages
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  // Filter stores based on search term
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort stores based on current sorting
  const sortedStores = [...filteredStores].sort((a, b) => {
    let aValue = a[sorting.field];
    let bValue = b[sorting.field];

    // Handle special cases
    if (sorting.field === 'averageRating') {
      aValue = a.averageRating || 0;
      bValue = b.averageRating || 0;
    }

    if (typeof aValue === 'string') {
      if (sorting.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    } else {
      if (sorting.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }
  });

  const getSortIcon = (field) => {
    if (sorting.field !== field) return <FaSort className="text-gray-400" />;
    return sorting.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
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
      <h1 className="text-3xl font-bold mb-6">Stores</h1>

      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Stores list */}
      {sortedStores.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No stores found matching your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Store Name
                      <span className="ml-1">{getSortIcon('name')}</span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('address')}
                  >
                    <div className="flex items-center">
                      Address
                      <span className="ml-1">{getSortIcon('address')}</span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('averageRating')}
                  >
                    <div className="flex items-center">
                      Overall Rating
                      <span className="ml-1">{getSortIcon('averageRating')}</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Your Rating
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedStores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {store.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {store.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StarRating
                          initialRating={store.averageRating || 0}
                          readOnly={true}
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          ({store.averageRating ? store.averageRating.toFixed(1) : '0.0'})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StarRating
                          initialRating={originalRatings[store.id] || 0}
                          readOnly={true}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openRatingModal(store)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {originalRatings[store.id] ? 'Update Rating' : 'Rate Store'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Rate {selectedStore.name}
            </h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">Select your rating:</p>
              <div className="flex justify-center">
                <StarRating
                  initialRating={ratings[selectedStore.id] || 0}
                  onChange={(value) => handleRatingChange(selectedStore.id, value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRatingModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {originalRatings[selectedStore.id] ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresList;
