import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    PhotoIcon,
    FolderIcon,
    FolderPlusIcon,
    XMarkIcon,
    TrashIcon,
    EyeIcon,
    PlusIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import FilePreviewModal from '../components/FilePreviewModal';

export default function ImportantImagesPage() {
    const [images, setImages] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    // Modals
    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    // Form State
    const [newAlbumName, setNewAlbumName] = useState('');
    const [uploadFiles, setUploadFiles] = useState([]);
    const [imageTitle, setImageTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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
                fetch(`${import.meta.env.VITE_API_BASE_URL}/images`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/albums`, { headers: { 'Authorization': `Bearer ${token}` } })
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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/albums`, {
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
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/albums/${id}`, {
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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/images`, {
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
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/images/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setImages(images.filter(img => img.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
    );

    const filteredImages = images.filter(img => {
        const matchesAlbum = selectedAlbum ? img.album_id === selectedAlbum.id : !img.album_id;
        if (!searchQuery.trim()) return matchesAlbum;
        const query = searchQuery.toLowerCase();
        return matchesAlbum && img.title?.toLowerCase().includes(query);
    });

    const filteredAlbums = albums.filter(album => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return album.name?.toLowerCase().includes(query);
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Modern Header Card */}
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-xl shadow-blue-100/60 border border-blue-100 p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 md:gap-4 w-full">
                                <Link to="/dashboard" className="p-2 md:p-3 hover:bg-blue-50 rounded-xl transition-all duration-300 text-blue-600 hover:scale-110 flex-shrink-0">
                                    <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl shadow-lg shadow-blue-400/50 flex-shrink-0">
                                            <PhotoIcon className="h-5 w-5 md:h-7 md:w-7 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                                                {selectedAlbum ? selectedAlbum.name : 'Image Gallery'}
                                            </h1>
                                            <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2 truncate">
                                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse flex-shrink-0"></span>
                                                {selectedAlbum
                                                    ? `${filteredImages.length} images`
                                                    : `${albums.length} albums · ${images.filter(i => !i.album_id).length} loose`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-row md:justify-end gap-2 md:gap-3 w-full">
                        {selectedAlbum ? (
                            <button
                                onClick={() => setSelectedAlbum(null)}
                                className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 text-blue-700 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] shadow-sm text-sm md:text-base flex items-center justify-center gap-2"
                            >
                                <span>← All Albums</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowAlbumModal(true)}
                                className="flex-1 md:flex-none px-3 md:px-5 py-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 border-2 border-blue-200 hover:border-blue-300 text-blue-700 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] shadow-sm text-sm md:text-base whitespace-nowrap"
                            >
                                <FolderPlusIcon className="h-5 w-5" />
                                <span>New Album</span>
                            </button>
                        )}
                        <button
                            onClick={() => setShowImageModal(true)}
                            className="flex-1 md:flex-none px-3 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-xl shadow-blue-400/50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] text-sm md:text-base whitespace-nowrap"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Upload Image
                        </button>
                    </div>                    {/* Search Bar */}
                    {(albums.length > 0 || images.length > 0) && (
                        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-xl shadow-blue-100/60 border border-blue-100 p-4 md:p-5">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                                <input
                                    type="text"
                                    placeholder={selectedAlbum ? "Search images by title..." : "Search albums or images..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-blue-50/50 border-2 border-blue-200 text-gray-800 placeholder:text-blue-300 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-xl shadow-blue-100/60 border border-blue-100 p-6 md:p-8 min-h-[60vh]">

                        {/* Albums Section */}
                        {!selectedAlbum && filteredAlbums.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                                    <h2 className="text-xl font-bold text-gray-800">Albums</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {filteredAlbums.map(album => (
                                        <div key={`album-${album.id}`} className="group relative">
                                            <button
                                                onClick={() => setSelectedAlbum(album)}
                                                className="w-full aspect-square bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-2xl border-2 border-blue-200/50 hover:border-blue-400 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4 group-hover:scale-[1.05] group-hover:shadow-xl group-hover:shadow-blue-200/60"
                                            >
                                                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 rounded-xl transition-all duration-300">
                                                    <FolderIcon className="h-12 w-12 text-blue-500 group-hover:text-blue-600 transition-colors" />
                                                </div>
                                                <div className="text-center w-full">
                                                    <span className="font-bold text-gray-800 group-hover:text-blue-700 truncate block text-sm">{album.name}</span>
                                                    <span className="text-xs text-blue-500/70 font-medium">
                                                        {images.filter(i => i.album_id === album.id).length} photos
                                                    </span>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }}
                                                className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg"
                                                title="Delete Album"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Images Section */}
                        {filteredImages.length > 0 && (
                            <div>
                                {!selectedAlbum && albums.length > 0 && (
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="h-1 w-1 rounded-full bg-cyan-500"></div>
                                        <h2 className="text-xl font-bold text-gray-800">Loose Images</h2>
                                        <div className="h-px flex-1 bg-gradient-to-r from-cyan-200 to-transparent"></div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {filteredImages.map(img => (
                                        <div
                                            key={img.id}
                                            className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-all duration-500 hover:scale-[1.05] cursor-pointer shadow-md hover:shadow-2xl hover:shadow-blue-200/60"
                                        >
                                            <img
                                                src={img.file_path.startsWith('http') ? img.file_path : `${import.meta.env.VITE_API_BASE_URL}${img.file_path}`}
                                                alt={img.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                                                <div className="flex justify-end gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                    <button
                                                        onClick={() => setPreviewImage(img)}
                                                        className="p-2 bg-white/95 hover:bg-white rounded-xl text-blue-600 hover:text-blue-700 transition-all shadow-lg hover:scale-110"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteImage(img.id)}
                                                        className="p-2 bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-xl text-white transition-all shadow-lg hover:scale-110"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-white font-bold text-sm truncate translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75 drop-shadow-lg">
                                                    {img.title}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty States */}
                        {!selectedAlbum && albums.length === 0 && filteredImages.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center">
                                    <PhotoIcon className="h-12 w-12 text-blue-400" />
                                </div>
                                <p className="text-xl font-bold text-gray-600 mb-2">No albums or images yet</p>
                                <p className="text-gray-400 mb-6">Create an album or upload images to get started</p>
                                <button
                                    onClick={() => setShowImageModal(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-400/50"
                                >
                                    Upload your first image
                                </button>
                            </div>
                        )}

                        {selectedAlbum && filteredImages.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center">
                                    <PhotoIcon className="h-12 w-12 text-blue-400" />
                                </div>
                                <p className="text-xl font-bold text-gray-600 mb-2">This album is empty</p>
                                <p className="text-gray-400 mb-6">Start by uploading some images</p>
                                <button
                                    onClick={() => setShowImageModal(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-400/50"
                                >
                                    Upload images
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Album Modal */}
            {showAlbumModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-blue-100">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 flex justify-between items-center border-b border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                    <FolderPlusIcon className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Create Album</h3>
                            </div>
                            <button
                                onClick={() => setShowAlbumModal(false)}
                                className="p-2 hover:bg-blue-100 rounded-xl text-blue-400 hover:text-blue-600 transition-all"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAlbum} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Album Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Summer Trip, Family"
                                    className="w-full px-4 py-3.5 rounded-xl bg-blue-50/50 border-2 border-blue-200 text-gray-800 placeholder:text-blue-300 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                    value={newAlbumName}
                                    onChange={e => setNewAlbumName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3.5 rounded-xl font-bold shadow-xl shadow-blue-400/50 transition-all duration-300 hover:scale-[1.02]">
                                Create Album
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-blue-100">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 flex justify-between items-center border-b border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                    <PhotoIcon className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    {selectedAlbum ? `Add to ${selectedAlbum.name}` : 'Upload Image'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="p-2 hover:bg-blue-100 rounded-xl text-blue-400 hover:text-blue-600 transition-all"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleImageUpload} className="p-6 space-y-5">
                            {!selectedAlbum && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter image name"
                                        className="w-full px-4 py-3.5 rounded-xl bg-blue-50/50 border-2 border-blue-200 text-gray-800 placeholder:text-blue-300 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                        value={imageTitle}
                                        onChange={e => setImageTitle(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {selectedAlbum ? 'Select Files (Multiple)' : 'Select File'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        multiple={!!selectedAlbum}
                                        accept="image/*"
                                        className="w-full px-4 py-3 rounded-xl bg-blue-50/50 border-2 border-blue-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-cyan-500 file:text-white hover:file:from-blue-600 hover:file:to-cyan-600 file:cursor-pointer file:transition-all"
                                        onChange={e => setUploadFiles(e.target.files)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                                    {selectedAlbum ? 'PNG, JPG, GIF up to 10MB each' : 'PNG, JPG, GIF up to 10MB'}
                                </p>
                            </div>
                            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3.5 rounded-xl font-bold shadow-xl shadow-blue-400/50 transition-all duration-300 hover:scale-[1.02]">
                                {selectedAlbum ? 'Upload Images' : 'Upload Image'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <FilePreviewModal
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                    fileUrl={previewImage.file_path.startsWith('http') ? previewImage.file_path : `${import.meta.env.VITE_API_BASE_URL}${previewImage.file_path}`}
                    title={previewImage.title}
                />
            )}
        </div>
    );
}
