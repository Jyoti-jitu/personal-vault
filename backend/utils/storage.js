import supabase from '../db.js';
import path from 'path';

const BUCKET_NAME = 'vault';

export const uploadFile = async (file, folder) => {
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname);
    const fileName = `${timestamp}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`; // Sanitize filename
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        throw error;
    }

    return data.path; // Returns 'folder/filename.ext'
}; 

export const deleteFile = async (filePath) => {
    // filePath stored in DB might be absolute URL or relative path. 
    // We expect relative path like 'images/foo.jpg' for this function.
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
 
    if (error) {
        console.error('Error deleting file from storage:', error);
        throw error; 
    }
};

export const getPublicUrl = (filePath) => {
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
    return data.publicUrl;
};

export const getSignedUrl = async (filePath, expiresIn = 60) => {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
};
