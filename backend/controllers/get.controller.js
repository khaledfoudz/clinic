import { pool } from '../db.js';

// GET all owners, each with a nested array of their pets
export const getAllOwners = async (req, res) => {
    try {
        const query = `
            SELECT
                o.id            AS owner_id,
                o.owner_name,
                o.mobile_number,
                o.address,
                o.created_at    AS owner_created_at,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'pet_id',              p.id,
                        'pet_name',            p.pet_name,
                        'birth_date',          p.birth_date,
                        'age',                 p.age,
                        'type',                p.type,
                        'gender',              p.gender,
                        'spayed_neutered',     p.spayed_neutered,
                        'weight_kg',           p.weight_kg,
                        'disease_history',     p.disease_history,
                        'vaccination_history', p.vaccination_history,
                        'diagnostics_url',     p.diagnostics_url,
                        'what_was_done_today', p.what_was_done_today,
                        'diagnosis',           p.diagnosis,
                        'treatment',           p.treatment,
                        'today_visit_url',     p.today_visit_url,
                        'follow_up_date',      p.follow_up_date,
                        'created_at',          p.created_at
                    ) ORDER BY p.created_at ASC
                ) AS pets
            FROM owners o
            LEFT JOIN pets p ON p.owner_id = o.id
            GROUP BY o.id
            ORDER BY o.created_at DESC;
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: 'Records fetched successfully',
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET a single owner by ID with all their pets
export const getOwnerById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT
                o.id            AS owner_id,
                o.owner_name,
                o.mobile_number,
                o.address,
                o.created_at    AS owner_created_at,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'pet_id',              p.id,
                        'pet_name',            p.pet_name,
                        'birth_date',          p.birth_date,
                        'age',                 p.age,
                        'type',                p.type,
                        'gender',              p.gender,
                        'spayed_neutered',     p.spayed_neutered,
                        'weight_kg',           p.weight_kg,
                        'disease_history',     p.disease_history,
                        'vaccination_history', p.vaccination_history,
                        'diagnostics_url',     p.diagnostics_url,
                        'what_was_done_today', p.what_was_done_today,
                        'diagnosis',           p.diagnosis,
                        'treatment',           p.treatment,
                        'today_visit_url',     p.today_visit_url,
                        'follow_up_date',      p.follow_up_date,
                        'created_at',          p.created_at
                    ) ORDER BY p.created_at ASC
                ) AS pets
            FROM owners o
            LEFT JOIN pets p ON p.owner_id = o.id
            WHERE o.id = $1
            GROUP BY o.id;
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.status(200).json({
            message: 'Record fetched successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET a single pet by its own ID
export const getPetById = async (req, res) => {
    try {
        const { petId } = req.params;

        const result = await pool.query(
            `SELECT * FROM pets WHERE id = $1;`,
            [petId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.status(200).json({
            message: 'Record fetched successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};