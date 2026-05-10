import { pool } from '../db.js';

// PUT: Update owner info (name, mobile, address)
export const updateOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { owner_name, mobile_number, address } = req.body;

        const result = await pool.query(
            `UPDATE owners
             SET owner_name = $1, mobile_number = $2, address = $3
             WHERE id = $4
             RETURNING *;`,
            [owner_name || null, mobile_number || null, address || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.status(200).json({
            message: 'Record updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT: Update a specific pet
export const updatePet = async (req, res) => {
    try {
        const { petId } = req.params;

        const {
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

        const diagnosticsFile = req.files?.diagnostics?.[0];
        const todayVisitFile  = req.files?.today_visit?.[0];

        const values = [
            pet_name             || null,
            birth_date           || null,
            age                  || null,
            type                 || null,
            gender               || null,
            spayed_neutered !== undefined ? spayed_neutered : null,
            weight_kg            || null,
            disease_history      || null,
            vaccination_history  || null,
            what_was_done_today  || null,
            diagnosis            || null,
            treatment            || null,
            follow_up_date       || null,
        ];

        let query = `
            UPDATE pets
            SET
                pet_name            = $1,
                birth_date          = $2,
                age                 = $3,
                type                = $4,
                gender              = $5,
                spayed_neutered     = $6,
                weight_kg           = $7,
                disease_history     = $8,
                vaccination_history = $9,
                what_was_done_today = $10,
                diagnosis           = $11,
                treatment           = $12,
                follow_up_date      = $13
        `;

        // Only update file paths if new files were uploaded
        if (diagnosticsFile) {
            values.push(diagnosticsFile.path);
            query += `, diagnostics_url = $${values.length}`;
        }
        if (todayVisitFile) {
            values.push(todayVisitFile.path);
            query += `, today_visit_url = $${values.length}`;
        }

        values.push(petId);
        query += ` WHERE id = $${values.length} RETURNING *;`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.status(200).json({
            message: 'Record updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};