
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CreditCardIcon, PlusIcon, TrashIcon, XMarkIcon, EyeIcon, EyeSlashIcon, PencilIcon, ClipboardDocumentIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function PaymentCardsPage() {
    const [cards, setCards] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardType: 'Visa',
        bankName: '',
        cardColor: 'from-gray-900 to-gray-800'
    });
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null); // For Details Modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCVV, setShowCVV] = useState(false); // Toggle CVV visibility
    const [isEditing, setIsEditing] = useState(false); // Track if we are editing
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        fetchCards();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.username) {
                    setFormData(prev => ({ ...prev, cardHolderName: data.username }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch user profile', error);
        }
    };

    const fetchCards = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cards`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCards(data);
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                throw new Error('Failed to fetch cards');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        let newCardType = formData.cardType;

        if (name === 'cardNumber') {
            // Remove non-digit characters and spaces (clean input for processing)
            const rawValue = value.replace(/\D/g, '');
            const truncatedValue = rawValue.slice(0, 19);
            // Re-format with spaces
            newValue = truncatedValue.replace(/(\d{4})(?=\d)/g, '$1 ');

            // Auto-detect Card Type
            if (rawValue.startsWith('4')) {
                newCardType = 'Visa';
            } else if (/^3[47]/.test(rawValue)) {
                newCardType = 'Amex';
            } else if (/^(60|65|81|82)/.test(rawValue) || rawValue.startsWith('508')) {
                newCardType = 'RuPay';
            } else {
                // Mastercard Logic
                // Range: 51-55
                const firstTwo = parseInt(rawValue.slice(0, 2));
                // Range: 2221-2720
                const firstFour = parseInt(rawValue.slice(0, 4));

                if (rawValue.length >= 2 && firstTwo >= 51 && firstTwo <= 55) {
                    newCardType = 'Mastercard';
                } else if (rawValue.length >= 4 && firstFour >= 2221 && firstFour <= 2720) {
                    newCardType = 'Mastercard';
                }
            }
        } else if (name === 'expiryDate') {
            // Remove non-digit characters
            const cleanValue = value.replace(/\D/g, '');
            // Limit to 4 digits
            const truncatedValue = cleanValue.slice(0, 4);

            // Handle backspace properly
            const isDeleting = e.nativeEvent.inputType === 'deleteContentBackward';

            if (truncatedValue.length >= 2 && !isDeleting) {
                newValue = `${truncatedValue.slice(0, 2)}/${truncatedValue.slice(2)}`;
            } else if (truncatedValue.length >= 2 && isDeleting && truncatedValue.length === 2) {
                // specific case: backspacing the slash
                newValue = truncatedValue;
            } else if (truncatedValue.length > 2) {
                // if editing the end, just ensure format
                newValue = `${truncatedValue.slice(0, 2)}/${truncatedValue.slice(2)}`;
            } else {
                newValue = truncatedValue;
            }
        } else if (name === 'cardType') {
            newCardType = value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
            cardType: name === 'cardNumber' ? newCardType : (name === 'cardType' ? value : prev.cardType)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            // Clean formatting before sending
            const payload = {
                ...formData,
                cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces
                expiryDate: formData.expiryDate // Send as MM/YY
            };

            const url = isEditing && selectedCard
                ? `${import.meta.env.VITE_API_BASE_URL}/cards/${selectedCard.id}`
                : `${import.meta.env.VITE_API_BASE_URL}/cards`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'add'} card`);
            }

            setSuccess(`Card ${isEditing ? 'updated' : 'added'} successfully!`);

            // Reset form
            setFormData(prev => ({
                cardHolderName: prev.cardHolderName,
                cardNumber: '',
                expiryDate: '',
                cvv: '',
                cardType: 'Visa',
                bankName: '',
                cardColor: 'from-gray-900 to-gray-800'
            }));

            setShowAddModal(false);
            setIsEditing(false); // Reset editing state
            if (isEditing) setShowDetailsModal(false); // Close details if we were editing from there
            fetchCards(); // Refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditStart = () => {
        if (!selectedCard) return;
        setFormData({
            cardHolderName: selectedCard.card_holder_name,
            cardNumber: selectedCard.card_number_plain.replace(/(\d{4})(?=\d)/g, '$1 '), // Format with spaces
            expiryDate: selectedCard.expiry_date,
            cvv: selectedCard.cvv_plain,
            cardType: selectedCard.card_type,
            bankName: selectedCard.bank_name || '',
            cardColor: selectedCard.card_color || 'from-gray-900 to-gray-800'
        });
        setIsEditing(true);
        setShowDetailsModal(false); // Close details
        setShowAddModal(true); // Open edit form
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData(prev => ({
            ...prev,
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            bankName: '',
            cardColor: 'from-gray-900 to-gray-800'
        }));
        setShowAddModal(true);
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setShowDetailsModal(true);
        setShowCVV(false); // Reset CVV visibility
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this card?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cards/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete card');
            }

            setCards(cards.filter(card => card.id !== id));
            setShowDetailsModal(false); // Close modal if open
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    // Filter cards based on search query
    const filteredCards = cards.filter(card => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            card.card_holder_name?.toLowerCase().includes(query) ||
            card.bank_name?.toLowerCase().includes(query) ||
            card.card_type?.toLowerCase().includes(query) ||
            card.card_number_masked?.includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 md:gap-4 mb-1">
                            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-white transition-colors flex-shrink-0">
                                <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Payment Methods</h1>
                        </div>
                        <p className="text-gray-500 ml-11 md:ml-14 text-sm md:text-base">Securely manage your credit and debit cards</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-2.5 md:py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add Card
                    </button>
                </div>

                {/* Search Bar */}
                {cards.length > 0 && (
                    <div className="mb-6">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by card holder, bank, or card type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-sm md:text-base"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCards.length === 0 && cards.length > 0 ? (
                        <div className="col-span-full bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
                            <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No cards found matching "{searchQuery}"</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="col-span-full bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
                            <CreditCardIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No cards added yet.</p>
                            <button
                                onClick={openAddModal}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                Add your first card
                            </button>
                        </div>
                    ) : (
                        filteredCards.map(card => (
                            <div key={card.id} onClick={() => handleCardClick(card)} className={`aspect-[1.586/1] ${card.card_color || 'from-gray-900 to-gray-800'} bg-gradient-to-br text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 cursor-pointer`}>
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    {/* Action buttons reserved for details modal to keep card clean? Or keep delete here? Keeping delete here for quick action */}
                                </div>

                                {/* Top Row: Bank & Logo */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">BANK NAME</p>
                                        <p className="text-lg font-bold tracking-wide">{card.bank_name || 'Bank Name'}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                                        <div className="relative border border-white/20 bg-white/5 rounded-lg px-2 py-1 backdrop-blur-md">
                                            <span className="font-bold italic tracking-wider">{card.card_type}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: Card Number */}
                                <div>
                                    <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">Card Number</p>
                                    <div className="flex items-center gap-3 text-2xl font-mono tracking-widest">
                                        <span className="text-xl tracking-widest">•••• •••• ••••</span>
                                        <span>{card.card_number_masked.slice(-4)}</span>
                                    </div>
                                </div>

                                {/* Bottom: Holder & Expiry */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">CARD HOLDER</p>
                                        <p className="font-medium tracking-wider uppercase">{card.card_holder_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">EXPIRES</p>
                                        <p className="font-medium tracking-wider">{card.expiry_date}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Card Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg md:max-w-5xl overflow-hidden animate-scale-in flex flex-col md:flex-row">

                            {/* Left Side: Form */}
                            <div className="flex-1 flex flex-col">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <PlusIcon className="h-6 w-6 text-primary" />
                                        {isEditing ? 'Edit Card' : 'Add New Card'}
                                    </h2>
                                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors md:hidden">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto max-h-[80vh] md:max-h-auto">
                                    {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{error}</div>}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                                                <input type="text" name="cardHolderName" value={formData.cardHolderName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required placeholder="John Doe" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                                <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required placeholder="0000 0000 0000 0000" maxLength="19" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                                <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required placeholder="MM/YY" maxLength="5" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                                <input type="password" name="cvv" value={formData.cvv} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required placeholder="123" maxLength="4" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required placeholder="e.g. HDFC, Chase" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                                                <select name="cardType" value={formData.cardType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                                    <option value="Visa">Visa</option>
                                                    <option value="Mastercard">Mastercard</option>
                                                    <option value="RuPay">RuPay</option>
                                                    <option value="Amex">Amex</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Color</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {[

                                                        'from-zinc-900 to-zinc-700',
                                                        'from-sky-500 to-indigo-700',
                                                        'from-violet-500 to-indigo-800',
                                                        'from-emerald-500 to-teal-800',
                                                        'from-amber-400 to-orange-700',
                                                        'from-slate-800/80 to-slate-700/60',
                                                        'from-purple-600 to-purple-800',
                                                        'from-green-600 to-green-800',
                                                        'from-red-600 to-red-800',
                                                        'from-teal-600 to-emerald-800',
                                                        'from-rose-600 to-pink-800',
                                                        'from-indigo-600 to-violet-800',
                                                        'from-cyan-600 to-blue-800',


                                                    ].map((color) => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, cardColor: color })}
                                                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} ${formData.cardColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'} transition-all`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddModal(false)}
                                                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all md:hidden"
                                            >
                                                Cancel
                                            </button>
                                            <button className="flex-1 w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all">
                                                {isEditing ? 'Update Card' : 'Save Card'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Right Side: Live Preview (Desktop Only) */}
                            <div className="hidden md:flex w-96 bg-gray-50 border-l border-gray-100 flex-col relative">
                                <div className="absolute top-4 right-4 z-10">
                                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 hover:bg-gray-100">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-8">
                                    <h3 className="text-lg font-bold text-gray-500 mb-6 uppercase tracking-wider">Live Preview</h3>

                                    {/* Card Preview Component */}
                                    <div className={`w-full aspect-[1.586/1] ${formData.cardColor} bg-gradient-to-br text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-500`}>
                                        {/* Top Row: Bank & Logo */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">BANK NAME</p>
                                                <p className="text-lg font-bold tracking-wide truncate max-w-[140px]">{formData.bankName || 'Bank Name'}</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                                                <div className="relative border border-white/20 bg-white/5 rounded-lg px-2 py-1 backdrop-blur-md">
                                                    <span className="font-bold italic tracking-wider">{formData.cardType}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Middle: Card Number */}
                                        <div>
                                            <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">Card Number</p>
                                            <div className="flex items-center gap-3 text-2xl font-mono tracking-widest overflow-hidden">
                                                <span className="truncate">{formData.cardNumber || '0000 0000 0000 0000'}</span>
                                            </div>
                                        </div>

                                        {/* Bottom: Holder & Expiry */}
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">CARD HOLDER</p>
                                                <p className="font-medium tracking-wider uppercase truncate max-w-[150px]">{formData.cardHolderName || 'YOUR NAME'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">EXPIRES</p>
                                                <p className="font-medium tracking-wider">{formData.expiryDate || 'MM/YY'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-gray-400">
                                            This is how your card will appear in the dashboard.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Card Details Modal */}
                {showDetailsModal && selectedCard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-in relative">
                            <div className="flex justify-between items-center p-5 md:p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Card Details</h2>
                                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 duration-300">
                                    <XMarkIcon className="h-6 w-6 md:h-8 md:w-8" />
                                </button>
                            </div>

                            <div className="p-5 md:p-8 overflow-y-auto">
                                {/* Card Preview */}
                                <div className={`aspect-[1.586/1] ${selectedCard.card_color || 'from-gray-900 to-gray-800'} bg-gradient-to-br text-white p-4 md:p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between mb-6 md:mb-8 shrink-0`}>
                                    {/* Top Row */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">BANK NAME</p>
                                            <p className="text-base md:text-lg font-bold tracking-wide">{selectedCard.bank_name || 'Bank Name'}</p>
                                        </div>
                                        <div className="relative border border-white/20 bg-white/5 rounded-lg px-2 py-1 backdrop-blur-md">
                                            <span className="font-bold italic tracking-wider text-sm">{selectedCard.card_type}</span>
                                        </div>
                                    </div>
                                    {/* Middle */}
                                    <div>
                                        <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">Card Number</p>
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <p className="text-lg md:text-2xl font-mono tracking-widest truncate">{selectedCard.card_number_plain ? selectedCard.card_number_plain.replace(/(\d{4})(?=\d)/g, '$1 ') : selectedCard.card_number_masked}</p>
                                            <button
                                                onClick={() => {
                                                    const textToCopy = selectedCard.card_number_plain || selectedCard.card_number_masked;
                                                    navigator.clipboard.writeText(textToCopy.replace(/\s/g, ''));
                                                    setCopySuccess(true);
                                                    setTimeout(() => setCopySuccess(false), 2000);
                                                }}
                                                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white flex-shrink-0"
                                                title="Copy Card Number"
                                            >
                                                {copySuccess ? (
                                                    <CheckIcon className="h-5 w-5" />
                                                ) : (
                                                    <ClipboardDocumentIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Bottom */}
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">CARD HOLDER</p>
                                            <p className="font-medium tracking-wider uppercase text-sm md:text-base">{selectedCard.card_holder_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase opacity-70 tracking-widest font-semibold mb-1">EXPIRES</p>
                                            <p className="font-medium tracking-wider text-sm md:text-base">{selectedCard.expiry_date}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Details */}
                                <div className="space-y-4 mb-6 md:mb-8">
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">CVV Security Code</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-xl font-mono font-bold text-gray-800">
                                                    {showCVV ? selectedCard.cvv_plain : '•••'}
                                                </p>
                                                <button onClick={() => setShowCVV(!showCVV)} className="text-primary hover:text-primary-dark transition-colors">
                                                    {showCVV ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <button
                                        onClick={handleEditStart}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all text-sm md:text-base"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                        Edit Card
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedCard.id)}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-red-100 bg-red-50 text-red-600 font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-sm md:text-base"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
