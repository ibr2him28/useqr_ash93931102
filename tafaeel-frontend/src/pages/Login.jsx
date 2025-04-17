import React, { useState } from 'react';
import logo from '../assets/img/logo.png';
import { useNavigate } from 'react-router-dom'
import LoginCheck from '../components/LoginCheck';
import { useAuth } from '../context/AuthContext';
import { MdEmail } from "react-icons/md";
import { FiAlertCircle } from "react-icons/fi";


const api = `${import.meta.env.VITE_BACKEND_URL}/login`
// `${import.meta.env.VITE_BACKEND_URL}/login`
export default function Login() {
    const [email, setEmail] = useState('ibrahim.almasoudi92@gmail.com');
    const [password, setPassword] = useState('tafaeel1234');
    const [error, setError] = useState();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email || !password) {
            setError('Please fill in both fields');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Attempting login...');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Login response:', data);
            
            if (response.ok) {
                await login(data.user);
                navigate('/dashboard');
            } else {
                setError(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
            <div className="mx-auto my-auto max-w-md w-full px-4">
                {/* Main Login Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm mb-4">
                    <div className="mb-8">
                        <img className="mx-auto" src={logo} alt="Logo" />
                    </div>
                    {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <input
                            className="h-12 w-full rounded-full border p-[6px_20px] border-[#D5D6D9]"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className="h-12 w-full rounded-full border p-[6px_20px] border-[#D5D6D9] mt-5"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`mt-5 btn w-full h-14 !text-lg !border-0 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* Password Reset Note Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <FiAlertCircle className="text-[#1F547C] text-xl" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Forgot Your Password?
                        </h3>
                    </div>
                    
                    <div className="bg-[#F8F9FA] rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#E9EEF2] rounded-full shrink-0">
                                <MdEmail className="text-[#1F547C] text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                    If you've forgotten your password, please contact our support team for assistance with resetting it.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <a 
                                        href="mailto:support@tafaeel.ai"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F547C] text-white rounded-lg hover:bg-[#1a4569] transition-colors text-sm"
                                    >
                                        <MdEmail />
                                        Contact Support
                                    </a>
                                    <span className="text-sm text-gray-500 self-center">
                                        support@tafaeel.ai
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
