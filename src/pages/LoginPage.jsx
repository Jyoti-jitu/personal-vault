import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <Link to="/" className="bg-primary/10 p-3 rounded-xl group hover:bg-primary/20 transition-colors">
                            <ShieldCheckIcon className="h-10 w-10 text-primary" />
                        </Link>
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-center text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-center text-gray-500 mb-8">Sign in to access your secure vault</p>

                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">Forgot Password?</a>
                            </div>
                        </div>

                        <button className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-primary hover:text-primary-dark">
                            Create free account
                        </Link>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
                    &copy; {new Date().getFullYear()} My Secure Vault. Secure & Encrypted.
                </div>
            </div>
        </div>
    );
}
