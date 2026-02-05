import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    PhotoIcon,
    FolderIcon,
    FolderPlusIcon,
    XMarkIcon,
    TrashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export default function ImportantImagesPage() {
    const [images, setImages] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modals
    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    // Form State
    const [newAlbumName, setNewAlbumName] = useState('');
    const [uploadFiles, setUploadFiles] = useState([]);
    const [imageTitle, setImageTitle] = useState('');

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

            const [imgsRes, albumsRes] = await Promise.all([
                fetch('http://localhost:5000/images', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/albums', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (imgsRes.ok && albumsRes.ok) {
                const imgsData = await imgsRes.json();
                const albumsData = await albumsRes.json();
                setImages(imgsData);
                setAlbums(albumsData);
            } else if (imgsRes.status === 401) {
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

    const handleCreateAlbum = async (e) => {
        e.preventDefault();
        if (!newAlbumName.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/albums', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newAlbumName })
            });

            if (!response.ok) throw new Error('Failed to create album');

            const data = await response.json();
            setAlbums([data.album, ...albums]);
            setShowAlbumModal(false);
            setNewAlbumName('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteAlbum = async (id) => {
        if (!window.confirm('Delete this album and all images inside?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/albums/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAlbums(albums.filter(a => a.id !== id));
            if (selectedAlbum && selectedAlbum.id === id) setSelectedAlbum(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (uploadFiles.length === 0) return;

        // Validation for root level uploads
        if (!selectedAlbum) {
            if (uploadFiles.length > 1) {
                return alert('You can only upload one image at a time outside an album');
            }
            if (!imageTitle.trim()) {
                return alert('Image title is required');
            }
        }

        const formData = new FormData();

        if (selectedAlbum) {
            formData.append('album_id', selectedAlbum.id);
        } else {
            formData.append('title', imageTitle);
        }

        Array.from(uploadFiles).forEach(file => {
            formData.append('files', file);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/images', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload images');
            }

            const data = await response.json();
            setImages([...data.images, ...images]);
            setShowImageModal(false);
            setUploadFiles([]);
            setImageTitle('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteImage = async (id) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/images/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setImages(images.filter(img => img.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                                <PhotoIcon className="h-8 w-8 text-purple-600" />
                                {selectedAlbum ? selectedAlbum.name : 'Important Images'}
                            </h1>
                            <p className="text-gray-500">
                                {selectedAlbum ? 'Manage images in this album' : 'Organize your photos into albums'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {selectedAlbum ? (
                            <button
                                onClick={() => setSelectedAlbum(null)}
                                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all"
                            >
                                Back to Albums
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowAlbumModal(true)}
                                className="px-4 py-2 bg-white text-purple-600 border border-purple-100 hover:bg-purple-50 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
                            >
                                <FolderPlusIcon className="h-5 w-5" /> New Album
                            </button>
                        )}
                        <button
                            onClick={() => setShowImageModal(true)}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                        >
                            <PhotoIcon className="h-5 w-5" /> Upload Image
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">

                    {/* Grid View */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">

                        {/* 1. Show Albums (Only in Root View) */}
                        {!selectedAlbum && albums.map(album => (
                            <div key={`album-${album.id}`} className="group relative">
                                <button
                                    onClick={() => setSelectedAlbum(album)}
                                    className="w-full aspect-square bg-purple-50/50 rounded-2xl border-2 border-dashed border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-3 p-4"
                                >
                                    <FolderIcon className="h-16 w-16 text-purple-300 group-hover:text-purple-500 transition-colors" />
                                    <span className="font-bold text-gray-700 group-hover:text-purple-700 truncate w-full text-center">{album.name}</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }}
                                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                    title="Delete Album"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {/* 2. Show Images (Filtered by Album or Root) */}
                        {images.filter(img => selectedAlbum ? img.album_id === selectedAlbum.id : !img.album_id).map(img => (
                            <div key={img.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all aspect-square">
                                <img src={`http://localhost:5000${img.file_path}`} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                    <div className="flex justify-end gap-2">
                                        <a href={`http://localhost:5000${img.file_path}`} target="_blank" rel="noreferrer" className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-purple-600 transition-colors shadow-sm">
                                            <EyeIcon className="h-4 w-4" />
                                        </a>
                                        <button onClick={() => handleDeleteImage(img.id)} className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors shadow-sm">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-white font-bold text-sm truncate drop-shadow-md">{img.title}</p>
                                </div>
                            </div>
                        ))}

                        {/* Empty States */}
                        {!selectedAlbum && albums.length === 0 && images.filter(i => !i.album_id).length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                <PhotoIcon className="h-20 w-20 mx-auto mb-4 opacity-10" />
                                <p className="text-xl font-medium">No albums or images yet</p>
                                <p className="text-sm">Create an album or upload an image to get started</p>
                            </div>
                        )}

                        {selectedAlbum && images.filter(i => i.album_id === selectedAlbum.id).length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                <PhotoIcon className="h-20 w-20 mx-auto mb-4 opacity-10" />
                                <p className="text-xl font-medium">This album is empty</p>
                                <button onClick={() => setShowImageModal(true)} className="mt-2 text-purple-600 hover:underline font-bold">
                                    Upload an image here
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Album Modal */}
            {showAlbumModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Create New Album</h3>
                            <button onClick={() => setShowAlbumModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAlbum} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Album Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Summer Trip, Family"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                                    value={newAlbumName}
                                    onChange={e => setNewAlbumName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all">
                                Create Album
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedAlbum ? `Add to ${selectedAlbum.name}` : 'Upload Image'}
                            </h3>
                            <button onClick={() => setShowImageModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleImageUpload} className="p-6 space-y-4">
                            {!selectedAlbum && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Title</label>
                                    <input
                                        type="text"
                                        placeholder="Image Name"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                                        value={imageTitle}
                                        onChange={e => setImageTitle(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {selectedAlbum ? 'Select Files (Multiple allowed)' : 'Select File (Single)'}
                                </label>
                                <input
                                    type="file"
                                    multiple={!!selectedAlbum}
                                    accept="image/*"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                    onChange={e => setUploadFiles(e.target.files)}
                                    required
                                />
                            </div>
                            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all">
                                {selectedAlbum ? 'Upload Images' : 'Upload Image'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
