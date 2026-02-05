import supabase from '../db.js';
import { uploadFile, deleteFile, getSignedUrl, getPublicUrl } from '../utils/storage.js';

export const addDocuments = async (req, res) => {
    const { title, folder_id } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!folder_id) {
        if (req.files.length > 1) {
            return res.status(400).json({ error: 'You can only upload one document at a time outside a folder' });
        }
        if (!title) {
            return res.status(400).json({ error: 'Document title is required for uploads outside a folder' });
        }
    }

    try {
        const insertionPromises = req.files.map(async (file) => {
            const path = await uploadFile(file, 'documents');
            const docTitle = title || file.originalname;

            return supabase
                .from('documents')
                .insert([{
                    user_id: req.user.userId,
                    title: docTitle,
                    file_path: path,
                    folder_id: folder_id ? parseInt(folder_id) : null
                }])
                .select()
                .single();
        });

        const results = await Promise.all(insertionPromises);

        const documents = [];
        for (const result of results) {
            if (result.error) throw result.error;
            documents.push(result.data); // Return relative path
        }

        res.status(201).json({ message: 'Documents added successfully', documents });
    } catch (error) {
        res.status(500).json({ error: 'We encountered an issue adding your documents. Please try again.' });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const { folder_id } = req.query;
        let query = supabase
            .from('documents')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (folder_id) {
            query = query.eq('folder_id', folder_id);
        }

        const { data: docs, error } = await query;

        if (error) throw error;

        // For documents, we might not need to expose the full URL in the list 
        // if we are using a specific download endpoint.
        // But for 'View' (Eye icon), we need a URL.
        // Let's attach a public URL for viewing.
        const docsWithUrls = docs.map(doc => ({
            ...doc,
            file_path: getPublicUrl(doc.file_path) // For View button
        }));

        res.json(docsWithUrls);
    } catch (error) {
        res.status(500).json({ error: 'We couldn\'t load your documents right now.' });
    }
};

export const batchDeleteDocuments = async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty IDs list' });
    }

    try {
        const { data: docsToDelete, error: fetchError } = await supabase
            .from('documents')
            .select('file_path')
            .in('id', ids)
            .eq('user_id', req.user.userId);

        if (fetchError) throw fetchError;

        // Delete from Storage
        for (const doc of docsToDelete) {
            if (doc.file_path) await deleteFile(doc.file_path).catch(e => console.error('Delete file error:', e));;
        }

        // Delete from DB
        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .in('id', ids)
            .eq('user_id', req.user.userId);

        if (deleteError) throw deleteError;

        res.json({ message: 'Documents deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'We couldn\'t delete the selected documents.' });
    }
};

export const downloadDocument = async (req, res) => {
    try {
        const { data: doc, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId)
            .single();

        if (error || !doc) return res.status(404).json({ error: 'Document not found' });

        // Generate Signed URL for download (triggers download behavior if possible, or we rely on browser)
        const url = await getSignedUrl(doc.file_path);

        // Redirect to the signed URL
        res.redirect(url);
    } catch (error) {
        res.status(500).json({ error: 'We couldn\'t download your document.' });
    }
};

export const updateDocument = async (req, res) => {
    const { title } = req.body;
    const documentId = req.params.id;

    try {
        const updateData = {};
        if (title) updateData.title = title;

        if (req.file) {
            // Upload new file
            const path = await uploadFile(req.file, 'documents');
            updateData.file_path = path;

            // Optional: Delete old file? 
            // We'd need to fetch old path first. 
            // For now, let's just upload new one. Old one becomes orphan unless we clean up.
            // Let's try to clean up.
            const { data: oldDoc } = await supabase
                .from('documents')
                .select('file_path')
                .eq('id', documentId)
                .single();

            if (oldDoc && oldDoc.file_path) {
                await deleteFile(oldDoc.file_path).catch(e => console.log('Old file delete fail', e));
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No data to update' });
        }

        const { data: doc, error } = await supabase
            .from('documents')
            .update(updateData)
            .eq('id', documentId)
            .eq('user_id', req.user.userId)
            .select()
            .single();

        if (error) throw error;

        // Return with public URL
        res.json({
            message: 'Document updated successfully',
            document: { ...doc, file_path: getPublicUrl(doc.file_path) }
        });
    } catch (error) {
        res.status(500).json({ error: 'We couldn\'t update your document.' });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        // Fetch path
        const { data: doc, error: fetchError } = await supabase
            .from('documents')
            .select('file_path')
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId)
            .single();

        if (fetchError) throw fetchError;

        if (doc && doc.file_path) {
            await deleteFile(doc.file_path);
        }

        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId);

        if (error) throw error;

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'We couldn\'t delete your document.' });
    }
};
