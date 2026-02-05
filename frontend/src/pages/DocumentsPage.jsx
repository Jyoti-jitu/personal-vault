import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    DocumentTextIcon,
    FolderIcon,
    FolderPlusIcon,
    XMarkIcon,
    TrashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modals
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Form State
    const [newFolderName, setNewFolderName] = useState('');
    const [uploadFiles, setUploadFiles] = useState([]);
    const [documentTitle, setDocumentTitle] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const [docsRes, foldersRes] = await Promise.all([
                fetch('http://localhost:5000/documents', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/document-folders', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (docsRes.ok && foldersRes.ok) {
                const docsData = await docsRes.json();
                const foldersData = await foldersRes.json();
                setDocuments(docsData);
                setFolders(foldersData);
            } else if (docsRes.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/document-folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newFolderName })
            });

            if (!response.ok) throw new Error('Failed to create folder');

            const data = await response.json();
            setFolders([data.folder, ...folders]);
            setShowFolderModal(false);
            setNewFolderName('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteFolder = async (id) => {
        if (!window.confirm('Delete this folder and all documents inside?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/document-folders/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFolders(folders.filter(f => f.id !== id));
            if (selectedFolder && selectedFolder.id === id) setSelectedFolder(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (uploadFiles.length === 0) return;

        // Validation for root level uploads (Outside Folder)
        if (!selectedFolder) {
            if (uploadFiles.length > 1) {
                return alert('You can only upload one document at a time outside a folder');
            }
            if (!documentTitle.trim()) {
                return alert('Document title is required');
            }
        }

        const formData = new FormData();

        if (selectedFolder) {
            formData.append('folder_id', selectedFolder.id);
        } else {
            formData.append('title', documentTitle);
        }

        Array.from(uploadFiles).forEach(file => {
            formData.append('files', file);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/documents', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload documents');
            }

            const data = await response.json();
            setDocuments([...data.documents, ...documents]);
            setShowUploadModal(false);
            setUploadFiles([]);
            setDocumentTitle('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                            <ArrowLeftIcon className="h-6 w-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-2">
                                <DocumentTextIcon className="h-8 w-8 text-orange-600" />
                                {selectedFolder ? selectedFolder.name : 'Documents'}
                            </h1>
                            <p className="text-gray-500">
                                {selectedFolder ? 'Manage documents in this folder' : 'Organize your documents'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {selectedFolder ? (
                            <button
                                onClick={() => setSelectedFolder(null)}
                                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all"
                            >
                                Back to Folders
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowFolderModal(true)}
                                className="px-4 py-2 bg-white text-orange-600 border border-orange-100 hover:bg-orange-50 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
                            >
                                <FolderPlusIcon className="h-5 w-5" /> New Folder
                            </button>
                        )}
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                        >
                            <DocumentTextIcon className="h-5 w-5" /> Upload Document
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">

                    {/* Grid View */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">

                        {/* 1. Show Folders (Only in Root View) */}
                        {!selectedFolder && folders.map(folder => (
                            <div key={`folder-${folder.id}`} className="group relative">
                                <button
                                    onClick={() => setSelectedFolder(folder)}
                                    className="w-full aspect-square bg-orange-50/50 rounded-2xl border-2 border-dashed border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-3 p-4"
                                >
                                    <FolderIcon className="h-16 w-16 text-orange-300 group-hover:text-orange-500 transition-colors" />
                                    <span className="font-bold text-gray-700 group-hover:text-orange-700 truncate w-full text-center">{folder.name}</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                    title="Delete Folder"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {/* 2. Show Documents (Filtered by Folder or Root) */}
                        {documents.filter(doc => selectedFolder ? doc.folder_id === selectedFolder.id : !doc.folder_id).map(doc => (
                            <div key={doc.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all aspect-square flex flex-col">
                                <div className="flex-1 flex items-center justify-center bg-gray-100">
                                    <DocumentTextIcon className="h-16 w-16 text-gray-400" />
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                    <div className="flex justify-end gap-2">
                                        <a href={`http://localhost:5000${doc.file_path}`} target="_blank" rel="noreferrer" className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-orange-600 transition-colors shadow-sm">
                                            <EyeIcon className="h-4 w-4" />
                                        </a>
                                        <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors shadow-sm">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3 bg-white border-t border-gray-100">
                                    <p className="text-gray-700 font-bold text-sm truncate" title={doc.title}>{doc.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(doc.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}

                        {/* Empty States */}
                        {!selectedFolder && folders.length === 0 && documents.filter(d => !d.folder_id).length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                <DocumentTextIcon className="h-20 w-20 mx-auto mb-4 opacity-10" />
                                <p className="text-xl font-medium">No documents yet</p>
                                <p className="text-sm">Create a folder or upload a document to get started</p>
                            </div>
                        )}

                        {selectedFolder && documents.filter(d => d.folder_id === selectedFolder.id).length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                <DocumentTextIcon className="h-20 w-20 mx-auto mb-4 opacity-10" />
                                <p className="text-xl font-medium">This folder is empty</p>
                                <button onClick={() => setShowUploadModal(true)} className="mt-2 text-orange-600 hover:underline font-bold">
                                    Upload a document here
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Folder Modal */}
            {showFolderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Create New Folder</h3>
                            <button onClick={() => setShowFolderModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Folder Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Reports, Invoices"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all">
                                Create Folder
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Document Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedFolder ? `Add to ${selectedFolder.name}` : 'Upload Document'}
                            </h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            {!selectedFolder && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                                    <input
                                        type="text"
                                        placeholder="Document Name"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                        value={documentTitle}
                                        onChange={e => setDocumentTitle(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {selectedFolder ? 'Select Files (Multiple allowed)' : 'Select File (Single)'}
                                </label>
                                <input
                                    type="file"
                                    multiple={!!selectedFolder}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    onChange={e => setUploadFiles(e.target.files)}
                                    required
                                />
                            </div>
                            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all">
                                {selectedFolder ? 'Upload Documents' : 'Upload Document'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
