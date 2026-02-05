import supabase from '../db.js';

export const getAlbums = async (req, res) => {
    try {
        const { data: albums, error } = await supabase
            .from('albums')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(albums);
    } catch (error) {
        console.error('Fetch albums error:', error);
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
};

export const createAlbum = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Album name is required' });

    try {
        const { data: album, error } = await supabase
            .from('albums')
            .insert([{ user_id: req.user.userId, name }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Album created', album });
    } catch (error) {
        console.error('Create album error:', error);
        res.status(500).json({ error: 'Failed to create album' });
    }
};

export const deleteAlbum = async (req, res) => {
    try {
        const { error } = await supabase
            .from('albums')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId);

        if (error) throw error;
        res.json({ message: 'Album deleted' });
    } catch (error) {
        console.error('Delete album error:', error);
        res.status(500).json({ error: 'Failed to delete album' });
    }
};
