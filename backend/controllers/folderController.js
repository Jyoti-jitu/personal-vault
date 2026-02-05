import supabase from '../db.js';

export const getFolders = async (req, res) => {
    try {
        const { data: folders, error } = await supabase
            .from('document_folders')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(folders);
    } catch (error) {
        console.error('Fetch doc folders error:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
};

export const createFolder = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    try {
        const { data: folder, error } = await supabase
            .from('document_folders')
            .insert([{ user_id: req.user.userId, name }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Folder created', folder });
    } catch (error) {
        console.error('Create doc folder error:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
};

export const deleteFolder = async (req, res) => {
    try {
        const { error } = await supabase
            .from('document_folders')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId);

        if (error) throw error;
        res.json({ message: 'Folder deleted' });
    } catch (error) {
        console.error('Delete doc folder error:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
};
