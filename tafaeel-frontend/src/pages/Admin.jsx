import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { card20 } from '../components/Icons';

export default function CreateAccount() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        mobile: '',
        user_type: 'customer',
        shop_id: ''
    });

    // Add new state for reset password form
    const [resetPasswordData, setResetPasswordData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [resetPasswordError, setResetPasswordError] = useState(null);
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    // Fetch all users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/users/`,
                { withCredentials: true }
            );
            // Direct access to response data since it's an array
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else if (response.data.data) {
                setUsers(response.data.data);
            }
            console.log('Fetched users:', response.data); // Debug log
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const processedValue = name === 'shop_id' ? 
            (value === '' ? '' : Number(value)) : 
            value;

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const submitData = {
            ...formData,
            shop_id: formData.shop_id === '' ? null : Number(formData.shop_id)
        };

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/users/create`,
                submitData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.status === 'success') {
                fetchUsers(); // Refresh users list after creating new user
                // Reset form
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    mobile: '',
                    user_type: 'customer',
                    shop_id: ''
                });
            } else {
                setError(response.data.message || 'Failed to create user');
            }
        } catch (err) {
            console.error('Create user error:', err);
            setError(err.response?.data?.message || 'An error occurred while creating the user');
        } finally {
            setIsLoading(false);
        }
    };

    // Add handler for reset password form
    const handleResetPasswordChange = (e) => {
        const { name, value } = e.target;
        setResetPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        setResetPasswordError(null);
        setResetPasswordSuccess(null);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsResetting(true);
        setResetPasswordError(null);
        setResetPasswordSuccess(null);

        // Validate passwords match
        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            setResetPasswordError(t("Passwords do not match"));
            setIsResetting(false);
            return;
        }

        // Validate password length
        if (resetPasswordData.newPassword.length < 6) {
            setResetPasswordError(t("Password must be at least 6 characters long"));
            setIsResetting(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/users/reset-password`,
                {
                    email: resetPasswordData.email,
                    newPassword: resetPasswordData.newPassword
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.status === 'success') {
                setResetPasswordSuccess(t("Password has been reset successfully"));
                // Reset form
                setResetPasswordData({
                    email: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (err) {
            console.error('Reset password error:', err);
            // Handle specific error messages from the backend
            const errorMessage = err.response?.data?.message || t("Failed to reset password");
            setResetPasswordError(errorMessage);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className='create-account'>
            <div className={card20}>
                <h2 className="text-2xl font-semibold mb-6">{t("Create New User")}</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("First Name")}*
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                required
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("Last Name")}*
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Email")}*
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Password")}*
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Mobile")}
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("User Type")}*
                        </label>
                        <select
                            name="user_type"
                            required
                            value={formData.user_type}
                            onChange={handleChange}

                            className="w-full p-2 border rounded-md"
                        >
                            <option value="customer">{t("Customer")}</option>
                            <option value="admin">{t("Admin")}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Shop ID")}
                        </label>
                        <input
                            type="number"
                            name="shop_id"
                            value={formData.shop_id}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-2 border rounded-md"
                            placeholder={t("Enter shop ID (optional)")}
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/users')}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                            {t("Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-4 py-2 bg-[#1F547C] text-white rounded-md hover:bg-blue-700 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? t("Creating...") : t("Create User")}
                        </button>
                    </div>
                </form>
            </div>

            <div className={`mt-8 ${card20}`}>
                <h2 className="text-2xl font-semibold mb-6">{t("Reset User Password")}</h2>
                
                {resetPasswordError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {resetPasswordError}
                    </div>
                )}

                {resetPasswordSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {resetPasswordSuccess}
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("User Email")}*
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={resetPasswordData.email}
                            onChange={handleResetPasswordChange}
                            className="w-full p-2 border rounded-md"
                            placeholder={t("Enter user email")}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("New Password")}*
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            required
                            value={resetPasswordData.newPassword}
                            onChange={handleResetPasswordChange}
                            className="w-full p-2 border rounded-md"
                            placeholder={t("Enter new password")}
                            minLength="6"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Confirm New Password")}*
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={resetPasswordData.confirmPassword}
                            onChange={handleResetPasswordChange}
                            className="w-full p-2 border rounded-md"
                            placeholder={t("Confirm new password")}
                            minLength="6"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isResetting}
                            className={`px-4 py-2 bg-[#1F547C] text-white rounded-md hover:bg-blue-700 ${
                                isResetting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isResetting ? t("Resetting...") : t("Reset Password")}
                        </button>
                    </div>
                </form>
            </div>

            <div className={`mt-8 ${card20}`}>
                <h2 className="text-2xl font-semibold mb-6">{t("All Users")}</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("Name")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("Email")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("User Type")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("Mobile")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("Shop ID")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.user_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {`${user.first_name} ${user.last_name}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.user_type === 'admin' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.user_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.mobile || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.shop_id || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

