import { pool } from '../db.js';

export const deleteOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`DELETE FROM owners WHERE id=$1 RETURNING *;`, [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Record not found' });
        res.status(200).json({ message: 'Owner and all their pets deleted successfully', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deletePet = async (req, res) => {
    try {
        const { petId } = req.params;
        const result = await pool.query(`DELETE FROM pets WHERE id=$1 RETURNING *;`, [petId]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Record not found' });
        res.status(200).json({ message: 'Pet deleted successfully', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteVisit = async (req, res) => {
    try {
        const { visitId } = req.params;
        const result = await pool.query(`DELETE FROM visits WHERE id=$1 RETURNING *;`, [visitId]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Record not found' });
        res.status(200).json({ message: 'Visit deleted successfully', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};