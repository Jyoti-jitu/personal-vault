import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCardIcon,
    UserCircleIcon,
    PhotoIcon,
    DocumentTextIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,
    ChevronDownIcon,
    ShieldCheckIcon,
    Squares2X2Icon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'User', email: '' });
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser({
                        name: data.username || 'User',
                        email: data.email || '',
                        profile_picture: data.profile_picture || ''
                    });
                } else if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: Squares2X2Icon, active: true },
        { name: 'Payment Cards', icon: CreditCardIcon, active: false },
        { name: 'Personal Information', icon: UserCircleIcon, active: false },
        { name: 'Important Images', icon: PhotoIcon, active: false },
        { name: 'Documents', icon: DocumentTextIcon, active: false },
        { name: 'Settings', icon: Cog6ToothIcon, active: false },
    ];

    const cards = [
        {
            title: "Payment Cards",
            description: "Manage your credit and debit cards",
            icon: CreditCardIcon,
            buttonText: "Add New Card",
            color: "text-blue-600 bg-blue-50",
            stat: "2 CARDS LINKED",
            progress: null
        },
        {
            title: "Personal Information",
            description: "Update your personal details",
            icon: UserCircleIcon,
            buttonText: "Edit Details",
            color: "text-green-600 bg-green-50",
            stat: "80% COMPLETE",
            progress: 80
        },
        {
            title: "Important Images",
            description: "Store and manage important photos",
            icon: PhotoIcon,
            buttonText: "Upload Image",
            color: "text-purple-600 bg-purple-50",
            stat: "12 IMAGES",
            progress: null
        },
        {
            title: "Documents",
            description: "Securely store important documents",
            icon: DocumentTextIcon,
            buttonText: "Upload Document",
            color: "text-orange-600 bg-orange-50",
            stat: "5 DOCUMENTS",
            progress: null
        }
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e293b] text-white hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-gray-700/50">
                    <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
                    <span className="text-lg font-bold">Personal Vault</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => {
                                if (item.name === 'Payment Cards') navigate('/cards');
                                if (item.name === 'Personal Information') navigate('/personal-info');
                                if (item.name === 'ImportantImages') navigate('/important-images');
                                if (item.name === 'Documents') navigate('/documents');
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${item.active
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium text-sm">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)} // Reusing profile menu state for now, but should ideally be separate. Let's create a new state for sidebar.
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Squares2X2Icon className="h-6 w-6" />
                        </button>
                        <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                        <span className="font-bold text-gray-800">Personal Vault</span>
                    </div>

                    <div className="flex items-center gap-2 hidden md:flex">
                        <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                        <span className="font-bold text-gray-800">Personal Vault</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors focus:outline-none"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">Free Plan</div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="h-6 w-6" />
                                )}
                            </div>
                            <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden sm:block" />
                        </button>

                        {/* Dropdown */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-fade-in-down">
                                <div className="md:hidden border-b border-gray-100 mb-1">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => {
                                                if (item.name === 'Payment Cards') navigate('/cards');
                                                if (item.name === 'Personal Information') navigate('/personal-info');
                                                if (item.name === 'ImportantImages') navigate('/important-images');
                                                if (item.name === 'Documents') navigate('/documents');
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <item.icon className="h-4 w-4 mr-3 text-gray-400" />
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <UserCircleIcon className="h-4 w-4 mr-3 text-gray-400" />
                                    My Profile
                                </button>
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
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-500 mt-2">Welcome back, here's what's happening with your vault.</p>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {cards.map((card, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (card.title === "Personal Information") navigate('/personal-info');
                                        if (card.title === "Payment Cards") navigate('/cards');
                                        if (card.title === "Important Images") navigate('/important-images');
                                        if (card.title === "Documents") navigate('/documents');
                                    }}
                                    className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col cursor-pointer`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                                        <card.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{card.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 flex-1">{card.description}</p>

                                    <div className="mb-4">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{card.stat}</span>
                                        </div>
                                        {card.progress && (
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${card.progress}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>

                                    <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                        {card.buttonText}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Hero Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-100">
                            <div className="md:w-1/2 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    Secure Vault
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                    Keep your sensitive information safe and secure
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    Manage your sensitive files, payment cards, and personal documents with bank-grade encryption.
                                </p>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                                    Learn More &rarr;
                                </button>
                            </div>

                            <div className="md:w-1/2 flex justify-center">
                                {/* Abstract Vault Illustration */}
                                <div className="relative w-64 h-64">
                                    <div className="absolute inset-0 bg-blue-600 rounded-full opacity-10 animate-pulse"></div>
                                    <div className="absolute inset-4 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 border-gray-50 rotate-3 transition-transform hover:rotate-0 duration-500">
                                        <LockClosedIcon className="h-32 w-32 text-blue-500" />
                                    </div>
                                    <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                                        <CreditCardIcon className="h-8 w-8 text-purple-500" />
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '4s' }}>
                                        <DocumentTextIcon className="h-8 w-8 text-orange-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
