import { pool } from '../db.js';

export const getAllClinicRecords = async (req, res) => {
    try {
        const query = `SELECT * FROM clinic_records ORDER BY id DESC;`;
        const result = await pool.query(query);
        
        res.status(200).json({
        message: "Records fetched successfully",
        data: result.rows,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getClinicRecordById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `SELECT * FROM clinic_records WHERE id = $1;`;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
        return res.status(404).json({ error: "Record not found" });
        }      
        res.status(200).json({
        message: "Record fetched successfully",
        data: result.rows[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }   
};