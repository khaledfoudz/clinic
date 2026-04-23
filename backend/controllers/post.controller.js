import { pool } from '../db.js';

    export const createClinicRecord = async (req, res) => {
    try {
        const {
        owner_name,
        mobile_number,
        address,
        pet_name,
        birth_date,
        age,
        type,
        gender,
        spayed_neutered,
        weight_kg,
        disease_history,
        vaccination_history,
        what_was_done_today,
        diagnosis,
        treatment,
        follow_up_date,
        } = req.body;

        // Get uploaded file paths
        const diagnosticsFile = req.files?.diagnostics?.[0];
        const todayVisitFile = req.files?.today_visit?.[0];
        
        const diagnostics_url = diagnosticsFile ? diagnosticsFile.path : null;
        const today_visit_url = todayVisitFile ? todayVisitFile.path : null;

        const query = `
        INSERT INTO clinic_records (
            owner_name, mobile_number, address,
            pet_name, birth_date, age, type, gender, spayed_neutered, weight_kg,
            disease_history, vaccination_history, diagnostics_url,
            what_was_done_today, diagnosis, treatment, today_visit_url,
            follow_up_date
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        RETURNING *;
        `;

        const values = [
        owner_name || null,
        mobile_number || null,
        address || null,
        pet_name || null,
        birth_date || null,
        age || null,
        type || null,
        gender || null,
        spayed_neutered || null,
        weight_kg || null,
        disease_history || null,
        vaccination_history || null,
        diagnostics_url,
        what_was_done_today || null,
        diagnosis || null,
        treatment || null,
        today_visit_url,
        follow_up_date || null,
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
        message: "Record created successfully",
        data: result.rows[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
    };