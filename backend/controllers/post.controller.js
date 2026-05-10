import { pool } from '../db.js';

// POST: Create a new owner with their first pet
export const createOwnerWithPet = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

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

        const diagnosticsFile = req.files?.diagnostics?.[0];
        const todayVisitFile  = req.files?.today_visit?.[0];
        const diagnostics_url = diagnosticsFile ? diagnosticsFile.path : null;
        const today_visit_url = todayVisitFile  ? todayVisitFile.path  : null;

        // 1. Insert owner
        const ownerResult = await client.query(
            `INSERT INTO owners (owner_name, mobile_number, address)
             VALUES ($1, $2, $3)
             RETURNING *;`,
            [owner_name || null, mobile_number || null, address || null]
        );
        const owner = ownerResult.rows[0];

        // 2. Insert first pet linked to that owner
        const petResult = await client.query(
            `INSERT INTO pets (
                owner_id, pet_name, birth_date, age, type, gender,
                spayed_neutered, weight_kg, disease_history, vaccination_history,
                diagnostics_url, what_was_done_today, diagnosis, treatment,
                today_visit_url, follow_up_date
             )
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
             RETURNING *;`,
            [
                owner.id,
                pet_name             || null,
                birth_date           || null,
                age                  || null,
                type                 || null,
                gender               || null,
                spayed_neutered !== undefined ? spayed_neutered : null,
                weight_kg            || null,
                disease_history      || null,
                vaccination_history  || null,
                diagnostics_url,
                what_was_done_today  || null,
                diagnosis            || null,
                treatment            || null,
                today_visit_url,
                follow_up_date       || null,
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Record created successfully',
            data: {
                ...owner,
                pets: [petResult.rows[0]],
            },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
};

// POST: Add a new pet to an existing owner
export const addPetToOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;

        // Make sure the owner exists
        const ownerCheck = await pool.query(
            'SELECT id FROM owners WHERE id = $1',
            [ownerId]
        );
        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Owner not found' });
        }

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
        const diagnostics_url = diagnosticsFile ? diagnosticsFile.path : null;
        const today_visit_url = todayVisitFile  ? todayVisitFile.path  : null;

        const petResult = await pool.query(
            `INSERT INTO pets (
                owner_id, pet_name, birth_date, age, type, gender,
                spayed_neutered, weight_kg, disease_history, vaccination_history,
                diagnostics_url, what_was_done_today, diagnosis, treatment,
                today_visit_url, follow_up_date
             )
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
             RETURNING *;`,
            [
                ownerId,
                pet_name             || null,
                birth_date           || null,
                age                  || null,
                type                 || null,
                gender               || null,
                spayed_neutered !== undefined ? spayed_neutered : null,
                weight_kg            || null,
                disease_history      || null,
                vaccination_history  || null,
                diagnostics_url,
                what_was_done_today  || null,
                diagnosis            || null,
                treatment            || null,
                today_visit_url,
                follow_up_date       || null,
            ]
        );

        res.status(201).json({
            message: 'Record created successfully',
            data: petResult.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};