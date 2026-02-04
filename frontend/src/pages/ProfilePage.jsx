import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone_number: '',
        dob: '',
        profile_picture: ''
    });
    const [initialFormData, setInitialFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setFormData({
                username: data.username || '',
                email: data.email || '',
                phone_number: data.phone_number || '',
                dob: data.dob ? data.dob.split('T')[0] : '',
                profile_picture: data.profile_picture || ''
            });
            setInitialFormData({
                username: data.username || '',
                email: data.email || '',
                phone_number: data.phone_number || '',
                dob: data.dob ? data.dob.split('T')[0] : '',
                profile_picture: data.profile_picture || ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profile_picture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    phone_number: formData.phone_number,
                    dob: formData.dob,
                    profile_picture: formData.profile_picture
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setSuccess('Profile updated successfully!');
            setInitialFormData(formData); // Update initial state to match new saved state
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link to="/dashboard" className="p-2 rounded-lg hover:bg-white transition-colors mr-4">
                        <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">My Profile</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex items-center gap-6">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                {formData.profile_picture ? (
                                    <img src={formData.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="h-20 w-20 text-primary" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100">
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                            </label>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{formData.username || 'User'}</h2>
                            <p className="text-gray-500">{formData.email}</p>
                        </div>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5" />
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="+1..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {JSON.stringify(formData) !== JSON.stringify(initialFormData) && (
                                <div className="flex justify-end pt-6 border-t border-gray-100 animate-fade-in-up">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(initialFormData)}
                                        className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors mr-4"
                                    >
                                        Cancel
                                    </button>
                                    <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
