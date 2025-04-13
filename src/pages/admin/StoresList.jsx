import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { toast } from 'react-toastify';
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaPlus, FaEye } from 'react-icons/fa';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  });
  const [sorting, setSorting] = useState({ field: 'name', direction: 'asc' });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      // Apply any active filters
      const queryParams = new URLSearchParams();

      if (filters.name) queryParams.append('name', filters.name);
      if (filters.address) queryParams.append('address', filters.address);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get(`/stores${query}`);

      setStores(response.data.stores);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      address: ''
    });
    // Re-fetch without filters
    setSearchTerm('');
    fetchStores();
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

  // Filter stores based on search term
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.email && store.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (store.owner && store.owner.name && store.owner.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort stores based on current sorting
  const sortedStores = [...filteredStores].sort((a, b) => {
    let aValue, bValue;

    // Handle special cases
    if (sorting.field === 'owner') {
      aValue = a.owner ? a.owner.name : '';
      bValue = b.owner ? b.owner.name : '';
    } else if (sorting.field === 'averageRating') {
      aValue = a.averageRating || 0;
      bValue = b.averageRating || 0;
    } else {
      aValue = a[sorting.field];
      bValue = b[sorting.field];
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stores</h1>
        <Link
          to="/admin/stores/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Store
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <form onSubmit={applyFilters}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
                placeholder="Filter by name"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={filters.address}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
                placeholder="Filter by address"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Stores List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : sortedStores.length === 0 ? (
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
                      Name
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
                    onClick={() => handleSort('address')}
                  >
                    <div className="flex items-center">
                      Address
                      <span className="ml-1">{getSortIcon('address')}</span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('owner')}
                  >
                    <div className="flex items-center">
                      Owner
                      <span className="ml-1">{getSortIcon('owner')}</span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('averageRating')}
                  >
                    <div className="flex items-center">
                      Rating
                      <span className="ml-1">{getSortIcon('averageRating')}</span>
                    </div>
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
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{store.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{store.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {store.owner ? store.owner.name : 'No Owner'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/stores/${store.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <FaEye className="mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresList;
