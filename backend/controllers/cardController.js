import supabase from '../db.js';
import { encrypt, decrypt } from '../utils/encryption.js';

export const addCard = async (req, res) => {
    const { cardHolderName, cardNumber, expiryDate, cvv, cardType, bankName, cardColor } = req.body;

    if (!cardHolderName || !cardNumber || !expiryDate || !cvv || !cardType) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const encryptedCardNumber = encrypt(cardNumber);
        const encryptedCvv = encrypt(cvv);

        const { data: card, error } = await supabase
            .from('cards')
            .insert([{
                user_id: req.user.userId,
                card_holder_name: cardHolderName,
                card_number: encryptedCardNumber,
                expiry_date: expiryDate,
                cvv: encryptedCvv,
                card_type: cardType,
                bank_name: bankName || null,
                card_color: cardColor || 'from-gray-900 to-gray-800'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Card added successfully', card: { ...card, card_number: cardNumber.slice(-4) } });
    } catch (error) {
        console.error('Add card error:', error);
        res.status(500).json({ error: 'Failed to add card' });
    }
};

export const getCards = async (req, res) => {
    try {
        const { data: cards, error } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const decryptedCards = cards.map(card => {
            try {
                const decryptedNumber = decrypt(card.card_number);
                return {
                    ...card,
                    card_number_masked: `**** **** **** ${decryptedNumber.slice(-4)}`,
                    card_number_plain: decryptedNumber,
                    cvv_plain: decrypt(card.cvv)
                };
            } catch (e) {
                console.error('Error decrypting card:', card.id, e);
                return { ...card, error: 'Decryption failed' };
            }
        });

        res.json(decryptedCards);
    } catch (error) {
        console.error('Fetch cards error:', error);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
};

export const updateCard = async (req, res) => {
    const { cardHolderName, cardNumber, expiryDate, cvv, cardType, bankName, cardColor } = req.body;
    const cardId = req.params.id;

    if (!cardHolderName || !cardNumber || !expiryDate || !cvv || !cardType) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const encryptedCardNumber = encrypt(cardNumber);
        const encryptedCvv = encrypt(cvv);

        const { data: card, error } = await supabase
            .from('cards')
            .update({
                card_holder_name: cardHolderName,
                card_number: encryptedCardNumber,
                expiry_date: expiryDate,
                cvv: encryptedCvv,
                card_type: cardType,
                bank_name: bankName || null,
                card_color: cardColor || 'from-gray-900 to-gray-800'
            })
            .eq('id', cardId)
            .eq('user_id', req.user.userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Card updated successfully', card: { ...card, card_number: cardNumber.slice(-4) } });
    } catch (error) {
        console.error('Update card error:', error);
        res.status(500).json({ error: 'Failed to update card' });
    }
};

export const deleteCard = async (req, res) => {
    try {
        const { error } = await supabase
            .from('cards')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId);

        if (error) throw error;

        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({ error: 'Failed to delete card' });
    }
};
