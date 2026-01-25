import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function SignupPage() {
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
                    <h2 className="text-3xl font-heading font-bold text-center text-gray-900 mb-2">Create Account</h2>
                    <p className="text-center text-gray-500 mb-8">Start protecting your digital life today</p>

                    <form className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>

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
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    <span>At least 8 characters</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <CheckCircleIcon className="w-4 h-4 text-gray-300" />
                                    <span>Contains number and symbol</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary hover:text-primary-dark">
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
