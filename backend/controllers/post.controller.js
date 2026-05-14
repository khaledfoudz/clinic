import { pool } from '../db.js';

// POST: Create a new owner with their first pet + first visit
export const createOwnerWithPet = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            owner_name, mobile_number, address,
            pet_name, birth_date, age, type, gender,
            disease_history, vaccination_history,
            // visit fields
            visit_date, spayed_neutered, weight_kg,
            what_was_done_today, diagnosis, treatment, follow_up_date,
        } = req.body;

        const diagnosticsFile  = req.files?.diagnostics?.[0];
        const todayVisitFile   = req.files?.today_visit?.[0];
        const diagnostics_url  = diagnosticsFile ? diagnosticsFile.path : null;
        const today_visit_url  = todayVisitFile  ? todayVisitFile.path  : null;

        // 1. Insert owner
        const ownerResult = await client.query(
            `INSERT INTO owners (owner_name, mobile_number, address)
             VALUES ($1, $2, $3) RETURNING *;`,
            [owner_name || null, mobile_number || null, address || null]
        );
        const owner = ownerResult.rows[0];

        // 2. Insert pet (profile only — no visit fields)
        const petResult = await client.query(
            `INSERT INTO pets (owner_id, pet_name, birth_date, age, type, gender, disease_history, vaccination_history)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *;`,
            [
                owner.id,
                pet_name            || null,
                birth_date          || null,
                age                 || null,
                type                || null,
                gender              || null,
                disease_history     || null,
                vaccination_history || null,
            ]
        );
        const pet = petResult.rows[0];

        // 3. Insert first visit
        const visitResult = await client.query(
            `INSERT INTO visits (pet_id, visit_date, spayed_neutered, weight_kg, diagnostics_url, what_was_done_today, diagnosis, treatment, today_visit_url, follow_up_date)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;`,
            [
                pet.id,
                visit_date          || new Date().toISOString().split('T')[0],
                spayed_neutered     || null,
                weight_kg           || null,
                diagnostics_url,
                what_was_done_today || null,
                diagnosis           || null,
                treatment           || null,
                today_visit_url,
                follow_up_date      || null,
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Record created successfully',
            data: { ...owner, pets: [{ ...pet, visits: [visitResult.rows[0]] }] },
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

        const ownerCheck = await pool.query('SELECT id FROM owners WHERE id = $1', [ownerId]);
        if (ownerCheck.rows.length === 0)
            return res.status(404).json({ error: 'Owner not found' });

        const { pet_name, birth_date, age, type, gender, disease_history, vaccination_history } = req.body;

        const petResult = await pool.query(
            `INSERT INTO pets (owner_id, pet_name, birth_date, age, type, gender, disease_history, vaccination_history)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *;`,
            [ownerId, pet_name || null, birth_date || null, age || null,
             type || null, gender || null, disease_history || null, vaccination_history || null]
        );

        res.status(201).json({ message: 'Pet added successfully', data: petResult.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST: Add a new visit to an existing pet
export const addVisitToPet = async (req, res) => {
    try {
        const { petId } = req.params;

        const petCheck = await pool.query('SELECT id FROM pets WHERE id = $1', [petId]);
        if (petCheck.rows.length === 0)
            return res.status(404).json({ error: 'Pet not found' });

        const {
            visit_date, spayed_neutered, weight_kg,
            what_was_done_today, diagnosis, treatment, follow_up_date,
        } = req.body;

        const diagnosticsFile = req.files?.diagnostics?.[0];
        const todayVisitFile  = req.files?.today_visit?.[0];
        const diagnostics_url = diagnosticsFile ? diagnosticsFile.path : null;
        const today_visit_url = todayVisitFile  ? todayVisitFile.path  : null;

        const visitResult = await pool.query(
            `INSERT INTO visits (pet_id, visit_date, spayed_neutered, weight_kg, diagnostics_url, what_was_done_today, diagnosis, treatment, today_visit_url, follow_up_date)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;`,
            [
                petId,
                visit_date          || new Date().toISOString().split('T')[0],
                spayed_neutered     || null,
                weight_kg           || null,
                diagnostics_url,
                what_was_done_today || null,
                diagnosis           || null,
                treatment           || null,
                today_visit_url,
                follow_up_date      || null,
            ]
        );

        res.status(201).json({ message: 'Visit added successfully', data: visitResult.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};