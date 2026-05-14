import { pool } from '../db.js';

export const getAllOwners = async (req, res) => {
    try {
        const result = await pool.query(`
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
                        'disease_history',     p.disease_history,
                        'vaccination_history', p.vaccination_history,
                        'created_at',          p.created_at,
                        'visits',              COALESCE((
                            SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'visit_id',            v.id,
                                    'visit_date',          v.visit_date,
                                    'spayed_neutered',     v.spayed_neutered,
                                    'weight_kg',           v.weight_kg,
                                    'diagnostics_url',     v.diagnostics_url,
                                    'what_was_done_today', v.what_was_done_today,
                                    'diagnosis',           v.diagnosis,
                                    'treatment',           v.treatment,
                                    'today_visit_url',     v.today_visit_url,
                                    'follow_up_date',      v.follow_up_date,
                                    'created_at',          v.created_at
                                ) ORDER BY v.visit_date DESC
                            ) FROM visits v WHERE v.pet_id = p.id
                        ), '[]'::json)
                    ) ORDER BY p.created_at ASC
                ) AS pets
            FROM owners o
            LEFT JOIN pets p ON p.owner_id = o.id
            GROUP BY o.id
            ORDER BY o.created_at DESC;
        `);

        const data = result.rows.map((o) => ({
            ...o,
            pets: (o.pets ?? []).filter((p) => p !== null && p.pet_id !== null),
        }));

        res.status(200).json({ message: 'Records fetched successfully', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getOwnerById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
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
                        'disease_history',     p.disease_history,
                        'vaccination_history', p.vaccination_history,
                        'created_at',          p.created_at,
                        'visits',              COALESCE((
                            SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'visit_id',            v.id,
                                    'visit_date',          v.visit_date,
                                    'spayed_neutered',     v.spayed_neutered,
                                    'weight_kg',           v.weight_kg,
                                    'diagnostics_url',     v.diagnostics_url,
                                    'what_was_done_today', v.what_was_done_today,
                                    'diagnosis',           v.diagnosis,
                                    'treatment',           v.treatment,
                                    'today_visit_url',     v.today_visit_url,
                                    'follow_up_date',      v.follow_up_date,
                                    'created_at',          v.created_at
                                ) ORDER BY v.visit_date DESC
                            ) FROM visits v WHERE v.pet_id = p.id
                        ), '[]'::json)
                    ) ORDER BY p.created_at ASC
                ) AS pets
            FROM owners o
            LEFT JOIN pets p ON p.owner_id = o.id
            WHERE o.id = $1
            GROUP BY o.id;
        `, [id]);

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Record not found' });

        res.status(200).json({ message: 'Record fetched successfully', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getPetById = async (req, res) => {
    try {
        const { petId } = req.params;

        const petResult = await pool.query(`SELECT * FROM pets WHERE id = $1;`, [petId]);
        if (petResult.rows.length === 0)
            return res.status(404).json({ error: 'Record not found' });

        const visitsResult = await pool.query(
            `SELECT * FROM visits WHERE pet_id = $1 ORDER BY visit_date DESC;`, [petId]
        );

        res.status(200).json({
            message: 'Record fetched successfully',
            data: { ...petResult.rows[0], visits: visitsResult.rows },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};