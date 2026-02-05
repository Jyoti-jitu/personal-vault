import React, { useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const FilePreviewModal = ({ isOpen, onClose, fileUrl, title }) => {
    if (!isOpen || !fileUrl) return null;

    // Helper to determine file type
    const getFileType = (url) => {
        try {
            // Remove query params if any for extension check
            const cleanUrl = url.split('?')[0].toLowerCase();
            if (cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/)) return 'image';
            if (cleanUrl.endsWith('.pdf')) return 'pdf';
            return 'other';
        } catch (e) {
            return 'other';
        }
    };

    const fileType = getFileType(fileUrl);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-scale-in relative">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 truncate px-2">{title || 'Preview'}</h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-full transition-all"
                            title="Download / Open Original"
                        >
                            <ArrowDownTrayIcon className="h-6 w-6" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-white rounded-full transition-all"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-4 relative">
                    {fileType === 'image' && (
                        <img
                            src={fileUrl}
                            alt={title}
                            className="max-w-full max-h-full object-contain shadow-lg"
                        />
                    )}

                    {fileType === 'pdf' && (
                        <iframe
                            src={`${fileUrl}#toolbar=0`}
                            title={title}
                            className="w-full h-full rounded-lg shadow-sm bg-white"
                        />
                    )}

                    {fileType === 'other' && (
                        <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-sm">
                            <p className="text-gray-500 mb-4">This file type cannot be previewed directly.</p>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 transition-colors"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
