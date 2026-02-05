import supabase from '../db.js';
import { uploadFile, deleteFile, getPublicUrl } from '../utils/storage.js';

export const addImages = async (req, res) => {
    const { title, album_id } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!album_id) {
        if (req.files.length > 1) {
            return res.status(400).json({ error: 'You can only upload one image at a time outside an album' });
        }
        if (!title) {
            return res.status(400).json({ error: 'Image title is required for uploads outside an album' });
        }
    }

    try {
        const insertionPromises = req.files.map(async (file) => {
            const path = await uploadFile(file, 'images');
            const imageTitle = title || file.originalname;

            return supabase
                .from('images')
                .insert([{
                    user_id: req.user.userId,
                    title: imageTitle,
                    file_path: path, // Store relative path 'images/filename.ext'
                    album_id: album_id ? parseInt(album_id) : null
                }])
                .select()
                .single();
        });

        const results = await Promise.all(insertionPromises);

        const images = [];
        for (const result of results) {
            if (result.error) throw result.error;
            // Append public URL for immediate frontend use if needed
            images.push({
                ...result.data,
                file_path: getPublicUrl(result.data.file_path) // Send back full URL
            });
        }

        res.status(201).json({ message: 'Images added successfully', images: images });
    } catch (error) {
        console.error('Add images error:', error);
        res.status(500).json({ error: 'Failed to add images' });
    }
};

export const getImages = async (req, res) => {
    try {
        const { album_id } = req.query;
        let query = supabase
            .from('images')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (album_id) {
            query = query.eq('album_id', album_id);
        }

        const { data: imgs, error } = await query;

        if (error) throw error;

        // Transform paths to full public URLs
        const imagesWithUrls = imgs.map(img => ({
            ...img,
            file_path: getPublicUrl(img.file_path)
        }));

        res.json(imagesWithUrls);
    } catch (error) {
        console.error('Fetch images error:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
};

export const deleteImage = async (req, res) => {
    try {
        // First get the file path
        const { data: img, error: fetchError } = await supabase
            .from('images')
            .select('file_path')
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId)
            .single();

        if (fetchError) throw fetchError;

        // Delete from Storage
        if (img && img.file_path) {
            await deleteFile(img.file_path);
        }

        // Delete from DB
        const { error } = await supabase
            .from('images')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId);

        if (error) throw error;

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
};
