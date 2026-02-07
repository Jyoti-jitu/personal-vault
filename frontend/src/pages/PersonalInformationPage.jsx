import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, DocumentPlusIcon, TrashIcon, ArrowDownTrayIcon, XMarkIcon, EyeIcon, PencilIcon, PhotoIcon, DocumentTextIcon, MusicalNoteIcon, FilmIcon, DocumentIcon } from '@heroicons/react/24/outline';
import FilePreviewModal from '../components/FilePreviewModal';

export default function PersonalInformationPage() {
    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            return { icon: <PhotoIcon className="h-6 w-6" />, color: 'text-purple-500' };
        } else if (['pdf'].includes(ext)) {
            return { icon: <DocumentTextIcon className="h-6 w-6" />, color: 'text-red-500' };
        } else if (['doc', 'docx', 'txt'].includes(ext)) {
            return { icon: <DocumentTextIcon className="h-6 w-6" />, color: 'text-blue-500' };
        } else if (['mp3', 'wav'].includes(ext)) {
            return { icon: <MusicalNoteIcon className="h-6 w-6" />, color: 'text-pink-500' };
        } else if (['mp4', 'mov', 'avi'].includes(ext)) {
            return { icon: <FilmIcon className="h-6 w-6" />, color: 'text-orange-500' };
        }
        return { icon: <DocumentIcon className="h-6 w-6" />, color: 'text-gray-500' };
    };
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDocModal, setShowDocModal] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: '', file: null });
    const [editingDoc, setEditingDoc] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);
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

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/personal-information`, {
                headers: { 'Authorization': `Bearer ${token} ` }
            });

            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                throw new Error('We couldn\'t load your personal information.');
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
            setDocError('Please enter a title.');
            return;
        }
        if (!editingDoc && !newDoc.file) {
            setDocError('Please select a file to upload.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('title', newDoc.title);
            if (newDoc.file) {
                formDataToSend.append('file', newDoc.file);
            }

            const url = editingDoc
                ? `${import.meta.env.VITE_API_BASE_URL}/personal-information/${editingDoc.id}`
                : `${import.meta.env.VITE_API_BASE_URL}/personal-information`;

            const method = editingDoc ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) throw new Error(editingDoc ? 'We couldn\'t update your document.' : 'We couldn\'t upload your document.');

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
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/personal-information/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDocuments(documents.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = async (doc) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/personal-information/${doc.id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.title;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 md:gap-4 mb-1">
                            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-white transition-colors flex-shrink-0">
                                <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 break-words line-clamp-1">Personal Information</h1>
                        </div>
                        <p className="text-gray-500 ml-11 md:ml-14 text-sm md:text-base">Manage your personal files and additional details</p>
                    </div>
                    {/* Desktop Add Button */}
                    <button
                        onClick={openAddModal}
                        className="hidden md:flex bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all items-center justify-center gap-2"
                    >
                        <DocumentPlusIcon className="h-5 w-5" />
                        Add Info
                    </button>
                </div>

                {/* Floating Action Button for Add Info (Mobile Only) */}
                <button
                    onClick={openAddModal}
                    className="md:hidden fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110 z-30 flex items-center justify-center group"
                    title="Add Information"
                >
                    <DocumentPlusIcon className="h-7 w-7" />
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
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
                                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all bg-gray-50/50 group gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`p-3 bg-white rounded-lg shadow-sm group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0 ${getFileIcon(doc.title).color}`}>
                                            {getFileIcon(doc.title).icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-gray-800 text-lg truncate">{doc.title}</h3>
                                            <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 justify-end">
                                        {doc.file_path && (
                                            <>
                                                <button
                                                    onClick={() => setPreviewDoc(doc)}
                                                    className="p-2 text-gray-500 hover:text-primary hover:bg-white rounded-lg transition-all"
                                                    title="View Document"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-white rounded-lg transition-all"
                                                    title="Download"
                                                >
                                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
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
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const name = file.name;
                                                const title = name.substring(0, name.lastIndexOf('.')) || name;
                                                setNewDoc({ ...newDoc, file: file, title: title });
                                            }
                                        }}
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

                {/* File Preview Modal */}
                {previewDoc && (
                    <FilePreviewModal
                        isOpen={!!previewDoc}
                        onClose={() => setPreviewDoc(null)}
                        fileUrl={previewDoc.file_path.startsWith('http') ? previewDoc.file_path : `${import.meta.env.VITE_API_BASE_URL}${previewDoc.file_path}`}
                        title={previewDoc.title}
                    />
                )}
            </div>
        </div>
    );
}
