import React, { useState } from 'react';
import { useAuthStore } from '~/store/auth-store'; // Adjust path
import { authApi } from '~/services/auth-api'; // Adjust path
import { useNavigate } from 'react-router'; // Use react-router-dom hook

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const setCredentials = useAuthStore((state) => state.setCredentials);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { accessToken, user } = await authApi.login({ username, password });
            console.log({accessToken, user });
            setCredentials(accessToken, user);
            navigate('/'); // Redirect to home/chat page after login
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 shadow-md mx-auto p-6 rounded-lg max-w-sm">
             <h2 className="font-bold text-gray-800 dark:text-white text-2xl text-center">Login</h2>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="dark:bg-gray-700 px-3 py-2 border border-gray-300 focus:border-indigo-500 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 w-full dark:text-white"
                />
            </div>
             <div>
                 <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dark:bg-gray-700 px-3 py-2 border border-gray-300 focus:border-indigo-500 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 w-full dark:text-white"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full text-white"
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
             <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/register')} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Register
                </button>
            </p>
        </form>
    );
}
