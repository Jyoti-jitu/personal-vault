import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    DocumentTextIcon,
    FolderIcon,
    FolderPlusIcon,
    XMarkIcon,
    TrashIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import FilePreviewModal from '../components/FilePreviewModal';

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
    const [selectedDocs, setSelectedDocs] = useState(new Set());
    const [editingDoc, setEditingDoc] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);

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
                fetch(`${import.meta.env.VITE_API_BASE_URL}/documents`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/document-folders`, { headers: { 'Authorization': `Bearer ${token}` } })
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
                throw new Error('We couldn\'t load your data. Please try again.');
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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/document-folders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newFolderName })
            });

            if (!response.ok) throw new Error('We couldn\'t create your folder.');

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
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/document-folders/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFolders(folders.filter(f => f.id !== id));
            if (selectedFolder && selectedFolder.id === id) setSelectedFolder(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = async (doc) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/documents/${doc.id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('We couldn\'t start the download.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.title; // Browser might auto-detect extension or we set it if needed
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('We couldn\'t download your document.');
        }
    };

    const toggleDocSelection = (id) => {
        const newSelected = new Set(selectedDocs);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedDocs(newSelected);
    };

    const handleSelectAll = () => {
        const visibleDocs = documents.filter(doc => selectedFolder ? doc.folder_id === selectedFolder.id : !doc.folder_id);
        if (selectedDocs.size === visibleDocs.length && visibleDocs.length > 0) {
            setSelectedDocs(new Set());
        } else {
            const newSelected = new Set();
            visibleDocs.forEach(doc => newSelected.add(doc.id));
            setSelectedDocs(newSelected);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedDocs.size === 0) return;
        if (!window.confirm(`Are you sure you want to delete these ${selectedDocs.size} documents?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/documents/delete-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ids: Array.from(selectedDocs) })
            });

            if (!response.ok) throw new Error('Batch delete failed');

            setDocuments(documents.filter(doc => !selectedDocs.has(doc.id)));
            setSelectedDocs(new Set());
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditClick = (doc) => {
        setEditingDoc(doc);
        setDocumentTitle(doc.title);
        setUploadFiles([]); // Reset files, user might not want to change file
        setShowUploadModal(true);
    };

    const openUploadModal = () => {
        setEditingDoc(null);
        setDocumentTitle('');
        setUploadFiles([]);
        setShowUploadModal(true);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        // If editing, title is required. File is optional.
        if (editingDoc) {
            if (!documentTitle.trim()) return alert('Document title is required');
        } else {
            // Creating new
            if (uploadFiles.length === 0) return;
            if (!selectedFolder) {
                if (uploadFiles.length > 1 && !editingDoc) return alert('You can only upload one document at a time outside a folder');
                if (!documentTitle.trim()) return alert('Document title is required');
            }
        }

        const formData = new FormData();

        if (selectedFolder) {
            formData.append('folder_id', selectedFolder.id);
        }

        // For editing, we might send title even if folder is selected, to update title
        if (!selectedFolder || editingDoc) {
            formData.append('title', documentTitle);
        }

        Array.from(uploadFiles).forEach(file => {
            formData.append('file', file); // Backend expects 'file' for single upload/update
        });

        // Backend expects 'files' array for bulk upload in POST /documents
        // But PUT /documents/:id expects single 'file'
        // And POST /documents also supports array 'files'

        if (!editingDoc) {
            // Re-append for bulk upload if new
            // Clear previous append to avoid duplication if handled differently?
            // Actually, let's stick to current logic: POST uses 'files'
            formData.delete('file');
            Array.from(uploadFiles).forEach(file => {
                formData.append('files', file);
            });
        }

        try {
            const token = localStorage.getItem('token');

            let url = `${import.meta.env.VITE_API_BASE_URL}/documents`;
            let method = 'POST';

            if (editingDoc) {
                url = `${import.meta.env.VITE_API_BASE_URL}/documents/${editingDoc.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'We couldn\'t save your document.');
            }

            const data = await response.json();

            if (editingDoc) {
                setDocuments(documents.map(d => d.id === editingDoc.id ? data.document : d));
            } else {
                setDocuments([...data.documents, ...documents]);
            }

            setShowUploadModal(false);
            setUploadFiles([]);
            setDocumentTitle('');
            setEditingDoc(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/documents/${id}`, {
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
                            onClick={handleSelectAll}
                            className="px-4 py-2 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            {selectedDocs.size > 0 && selectedDocs.size === documents.filter(doc => selectedFolder ? doc.folder_id === selectedFolder.id : !doc.folder_id).length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                            onClick={openUploadModal}
                            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                        >
                            <DocumentTextIcon className="h-5 w-5" /> Upload Document
                        </button>
                        {selectedDocs.size > 0 && (
                            <button
                                onClick={handleBatchDelete}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 animate-fade-in"
                            >
                                <TrashIcon className="h-5 w-5" /> Delete ({selectedDocs.size})
                            </button>
                        )}
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
                                <div className="flex-1 flex items-center justify-center bg-gray-100 relative">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.has(doc.id)}
                                        onChange={(e) => { e.stopPropagation(); toggleDocSelection(doc.id); }}
                                        className="absolute top-3 left-3 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer z-10"
                                    />
                                    <DocumentTextIcon className="h-16 w-16 text-gray-400" />
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                                    <div className="flex justify-end gap-2 pointer-events-auto">
                                        <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors shadow-sm">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setPreviewDoc(doc)}
                                            className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-orange-600 transition-colors shadow-sm"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex justify-end gap-2 pointer-events-auto">
                                        <button onClick={() => handleDownload(doc)} className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors shadow-sm">
                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleEditClick(doc)} className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-green-600 transition-colors shadow-sm">
                                            <PencilIcon className="h-4 w-4" />
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
                                <button onClick={openUploadModal} className="mt-2 text-orange-600 hover:underline font-bold">
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
                                {editingDoc ? 'Edit Document' : (selectedFolder ? `Add to ${selectedFolder.name}` : 'Upload Document')}
                            </h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            {(!selectedFolder || editingDoc) && (
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
                                    {editingDoc ? 'Replace File (Optional)' : (selectedFolder ? 'Select Files (Multiple allowed)' : 'Select File (Single)')}
                                </label>
                                <input
                                    type="file"
                                    multiple={!!selectedFolder && !editingDoc}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    onChange={e => {
                                        const files = e.target.files;
                                        setUploadFiles(files);
                                        if (files.length > 0 && !selectedFolder && !editingDoc) {
                                            const name = files[0].name;
                                            const nameWithoutExt = name.substring(0, name.lastIndexOf('.')) || name;
                                            setDocumentTitle(nameWithoutExt);
                                        }
                                    }}
                                    required={!editingDoc}
                                />
                            </div>
                            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all">
                                {editingDoc ? 'Update Document' : 'Upload Document'}
                            </button>
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
    );
}
