import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';

const CreateStore = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [potentialOwners, setPotentialOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      searchUsers();
    } else {
      setPotentialOwners([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      // Search for potential store owners (users with STORE_OWNER role or USER role)
      const response = await api.get(`/users?name=${searchTerm}`);

      // Filter to only show users who can be store owners (not admins)
      const filteredUsers = response.data.users.filter(
        user => user.role === 'STORE_OWNER' || user.role === 'USER'
      );

      setPotentialOwners(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowOwnerDropdown(true);
  };

  const selectOwner = (user) => {
    setFormData({ ...formData, ownerId: user.id });
    setSearchTerm(user.name);
    setShowOwnerDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Store name is required';
    } else if (formData.name.length > 60) {
      newErrors.name = 'Store name cannot exceed 60 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Address validation: max 400 characters
    if (!formData.address) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length > 400) {
      newErrors.address = 'Address cannot exceed 400 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await api.post('/stores', formData);

      toast.success('Store created successfully');
      navigate('/admin/stores');
    } catch (error) {
      console.error('Create store error:', error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create store');
      }

      // Handle validation errors from server
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Store</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Store Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="Enter store name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Store Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="Enter store email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                Store Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="Enter store address (max 400 characters)"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="mb-6 relative">
              <label htmlFor="storeOwner" className="block text-gray-700 font-medium mb-2">
                Store Owner (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="storeOwner"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Search for a user to assign as owner"
                  autoComplete="off"
                  onFocus={() => setShowOwnerDropdown(true)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>

              {/* Owner Dropdown */}
              {showOwnerDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-2 text-center text-gray-500">Searching...</div>
                  ) : potentialOwners.length === 0 ? (
                    <div className="p-2 text-center text-gray-500">
                      {searchTerm.trim().length < 2
                        ? 'Type at least 2 characters to search'
                        : 'No matching users found'}
                    </div>
                  ) : (
                    <ul>
                      {potentialOwners.map(user => (
                        <li
                          key={user.id}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                          onClick={() => selectOwner(user)}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">
                            {user.role === 'STORE_OWNER' ? 'Store Owner' : 'Normal User'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <p className="text-gray-500 text-xs mt-1">
                If you assign a normal user as store owner, their role will be updated to Store Owner automatically.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/stores')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStore;
