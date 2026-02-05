import supabase from '../db.js';
import { uploadFile, deleteFile, getPublicUrl, getSignedUrl } from '../utils/storage.js';

export const getPersonalInfo = async (req, res) => {
    try {
        const { data: info, error } = await supabase
            .from('personal_information')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Attach public URL
        const infoWithUrls = info.map(item => ({
            ...item,
            file_path: getPublicUrl(item.file_path)
        }));

        res.json(infoWithUrls);
    } catch (error) {
        console.error('Fetch information error:', error);
        res.status(500).json({ error: 'Failed to fetch information' });
    }
};

export const addPersonalInfo = async (req, res) => {
    const { title } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!req.file) return res.status(400).json({ error: 'File is required' });

    try {
        const path = await uploadFile(req.file, 'personal-info');

        const { data: info, error } = await supabase
            .from('personal_information')
            .insert([{
                user_id: req.user.userId,
                title,
                file_path: path
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({
            message: 'Information added',
            document: { ...info, file_path: getPublicUrl(path) }
        });
    } catch (error) {
        console.error('Add information error:', error);
        res.status(500).json({ error: 'Failed to add information' });
    }
};

export const updatePersonalInfo = async (req, res) => {
    const { title } = req.body;
    const documentId = req.params.id;

    try {
        const updateData = {};
        if (title) updateData.title = title;

        if (req.file) {
            const path = await uploadFile(req.file, 'personal-info');
            updateData.file_path = path;

            // Delete old file
            const { data: oldDoc } = await supabase
                .from('personal_information')
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

        const { data: info, error } = await supabase
            .from('personal_information')
            .update(updateData)
            .eq('id', documentId)
            .eq('user_id', req.user.userId)
            .select()
            .single();

        if (error) throw error;
        res.json({
            message: 'Information updated',
            document: { ...info, file_path: getPublicUrl(info.file_path) }
        });
    } catch (error) {
        console.error('Update information error:', error);
        res.status(500).json({ error: 'Failed to update information' });
    }
};

export const deletePersonalInfo = async (req, res) => {
    try {
        const { data: doc, error: fetchError } = await supabase
            .from('personal_information')
            .select('file_path')
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId)
            .single();

        if (fetchError) throw fetchError;

        if (doc && doc.file_path) {
            await deleteFile(doc.file_path);
        }

        const { error } = await supabase
            .from('personal_information')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId);

        if (error) throw error;
        res.json({ message: 'Information deleted' });
    } catch (error) {
        console.error('Delete information error:', error);
        res.status(500).json({ error: 'Failed to delete information' });
    }
};

export const downloadPersonalInfo = async (req, res) => {
    try {
        const { data: doc, error } = await supabase
            .from('personal_information')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId)
            .single();

        if (error || !doc) return res.status(404).json({ error: 'Document not found' });

        const url = await getSignedUrl(doc.file_path);
        res.redirect(url);
    } catch (error) {
        console.error('Download information error:', error);
        res.status(500).json({ error: 'Failed to download information' });
    }
};
