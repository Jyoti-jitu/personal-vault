import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, DocumentPlusIcon, TrashIcon, ArrowDownTrayIcon, XMarkIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function PersonalInformationPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDocModal, setShowDocModal] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: '', file: null });
    const [editingDoc, setEditingDoc] = useState(null);
    const [error, setError] = useState('');
    const [docError, setDocError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/documents', {
                headers: { 'Authorization': `Bearer ${token} ` }
            });

            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                throw new Error('Failed to fetch information');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDocSubmit = async (e) => {
        e.preventDefault();
        setDocError('');

        if (!newDoc.title) {
            setDocError('Title is required.');
            return;
        }
        if (!editingDoc && !newDoc.file) {
            setDocError('File is required for new documents.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('title', newDoc.title);
            if (newDoc.file) {
                const fieldName = editingDoc ? 'file' : 'files';
                formDataToSend.append(fieldName, newDoc.file);
            }

            const url = editingDoc
                ? `http://localhost:5000/documents/${editingDoc.id}`
                : 'http://localhost:5000/documents';

            const method = editingDoc ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) throw new Error(editingDoc ? 'Failed to update document' : 'Failed to upload document');

            const data = await response.json();

            if (editingDoc) {
                setDocuments(documents.map(d => d.id === editingDoc.id ? data.document : d));
            } else {
                setDocuments([data.document, ...documents]);
            }

            setShowDocModal(false);
            setNewDoc({ title: '', file: null });
            setEditingDoc(null);
        } catch (err) {
            setDocError(err.message);
        }
    };

    const handleEditClick = (doc) => {
        setEditingDoc(doc);
        setNewDoc({ title: doc.title, file: null });
        setShowDocModal(true);
    };

    const openAddModal = () => {
        setEditingDoc(null);
        setNewDoc({ title: '', file: null });
        setShowDocModal(true);
    };

    const handleDeleteDoc = async (id) => {
        if (!window.confirm('Delete this information?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDocuments(documents.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-white transition-colors">
                                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                            </Link>
                            <h1 className="text-3xl font-heading font-bold text-gray-900">Personal Information</h1>
                        </div>
                        <p className="text-gray-500 ml-14">Manage your personal files and additional details</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <DocumentPlusIcon className="h-5 w-5" />
                        Add Info
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    {documents.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <DocumentPlusIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No additional information added yet.</p>
                            <button onClick={openAddModal} className="mt-2 text-primary font-bold hover:underline">
                                Upload your first file
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all bg-gray-50/50 group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-lg shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <DocumentPlusIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{doc.title}</h3>
                                            <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`http://localhost:5000${doc.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-gray-500 hover:text-primary hover:bg-white rounded-lg transition-all"
                                            title="View Document"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </a>
                                        <button
                                            onClick={() => handleEditClick(doc)}
                                            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-white rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDoc(doc.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Info Modal */}
                {showDocModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900">{editingDoc ? 'Edit Information' : 'Add Information'}</h3>
                                <button onClick={() => setShowDocModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={handleDocSubmit} className="p-6 space-y-4">
                                {docError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{docError}</div>}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Information Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Aadhar Card, Resume, Notes"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={newDoc.title}
                                        onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload File {editingDoc && '(Optional)'}</label>
                                    <input
                                        type="file"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        onChange={e => setNewDoc({ ...newDoc, file: e.target.files[0] })}
                                        required={!editingDoc}
                                    />
                                </div>
                                <div className="pt-2">
                                    <button className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all">
                                        {editingDoc ? 'Update Information' : 'Upload Information'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
