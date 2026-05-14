import { pool } from '../db.js';

export const updateOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { owner_name, mobile_number, address } = req.body;

        const result = await pool.query(
            `UPDATE owners SET owner_name=$1, mobile_number=$2, address=$3
             WHERE id=$4 RETURNING *;`,
            [owner_name || null, mobile_number || null, address || null, id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Record not found' });

        res.status(200).json({ message: 'Owner updated successfully', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updatePet = async (req, res) => {
    try {
        const { petId } = req.params;
        const { pet_name, birth_date, age, type, gender, disease_history, vaccination_history } = req.body;

        const result = await pool.query(
            `UPDATE pets SET
                pet_name=$1, birth_date=$2, age=$3, type=$4, gender=$5,
                disease_history=$6, vaccination_history=$7
             WHERE id=$8 RETURNING *;`,
            [
                pet_name            || null,
                birth_date          || null,
                age                 || null,
                type                || null,
                gender              || null,
                disease_history     || null,
                vaccination_history || null,
                petId,
            ]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Record not found' });

        res.status(200).json({ message: 'Pet updated successfully', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateVisit = async (req, res) => {
    try {
        const { visitId } = req.params;
        const {
            visit_date, spayed_neutered, weight_kg,
            what_was_done_today, diagnosis, treatment, follow_up_date,
        } = req.body;

        const diagnosticsFile = req.files?.diagnostics?.[0];
        const todayVisitFile  = req.files?.today_visit?.[0];

        const values = [
            visit_date          || null,
            spayed_neutered     || null,
            weight_kg           || null,
            what_was_done_today || null,
            diagnosis           || null,
            treatment           || null,
            follow_up_date      || null,
        ];

        let query = `
            UPDATE visits SET
                visit_date=$1, spayed_neutered=$2, weight_kg=$3,
                what_was_done_today=$4, diagnosis=$5, treatment=$6, follow_up_date=$7
        `;

        if (diagnosticsFile) {
            values.push(diagnosticsFile.path);
            query += `, diagnostics_url=$${values.length}`;
        }
        if (todayVisitFile) {
            values.push(todayVisitFile.path);
            query += `, today_visit_url=$${values.length}`;
        }

        values.push(visitId);
        query += ` WHERE id=$${values.length} RETURNING *;`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Record not found' });

        res.status(200).json({ message: 'Visit updated successfully', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};