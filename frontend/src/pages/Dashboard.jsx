import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCardIcon,
    UserIcon,
    PhotoIcon,
    DocumentTextIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,
    ChevronDownIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'User', email: '' });
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        // Simple check for token (in a real app, verify token validity)
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
        // Ideally fetch user details here
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const cards = [
        {
            title: "Payment Cards",
            description: "Manage your credit and debit cards",
            icon: CreditCardIcon,
            buttonText: "Add New Card",
            color: "bg-blue-500",
            extra: "2 Cards Linked"
        },
        {
            title: "Personal Information",
            description: "Update your personal details",
            icon: UserIcon,
            buttonText: "Edit Details",
            color: "bg-green-500",
            extra: "80% Complete"
        },
        {
            title: "Important Images",
            description: "Store and manage important photos",
            icon: PhotoIcon,
            buttonText: "Upload Image",
            color: "bg-purple-500",
            extra: "12 Images"
        },
        {
            title: "Documents",
            description: "Securely store important documents",
            icon: DocumentTextIcon,
            buttonText: "Upload Document",
            color: "bg-orange-500",
            extra: "5 Documents"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <ShieldCheckIcon className="h-8 w-8 text-primary" />
                            <span className="ml-2 text-xl font-bold font-heading text-gray-900">Personal Vault</span>
                        </div>

                        <div className="flex items-center">
                            <div className="relative ml-3">
                                <div
                                    className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">Free Plan</div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-primary/20">
                                        <UserIcon className="h-6 w-6" />
                                    </div>
                                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                </div>

                                {/* Dropdown */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-fade-in-down">
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                                            My Profile
                                        </button>
                                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-400" />
                                            Settings
                                        </a>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-red-500" />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, here's what's happening with your vault.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
                            <div className={`h-12 w-12 rounded-xl ${card.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 h-10">{card.description}</p>

                            {card.extra && (
                                <div className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {card.extra}
                                </div>
                            )}

                            <button className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                                {card.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
