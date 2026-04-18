    import {pool} from '../db.js';

    export const createClinicRecord = async (req, res) => {
    try {
        const {
        owner_name,
        mobile_number,
        address,
        pet_name,
        birth_date,
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

        const query = `
        INSERT INTO clinic_records (
            owner_name,
            mobile_number,
            address,
            pet_name,
            birth_date,
            type,
            gender,
            spayed_neutered,
            weight_kg,
            disease_history,
            vaccination_history,
            what_was_done_today,
            diagnosis,
            treatment,
            follow_up_date
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *;
        `;

        const values = [
        owner_name,
        mobile_number,
        address,
        pet_name,
        birth_date,
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