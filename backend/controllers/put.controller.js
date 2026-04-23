import { pool } from '../db.js';

export const updateClinicRecord = async (req, res) => {
  try {
    const { id } = req.params;
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

    let query = `
      UPDATE clinic_records 
      SET 
        owner_name = $1, mobile_number = $2, address = $3,
        pet_name = $4, birth_date = $5, age = $6, type = $7, gender = $8,
        spayed_neutered = $9, weight_kg = $10,
        disease_history = $11, vaccination_history = $12,
        what_was_done_today = $13, diagnosis = $14, treatment = $15,
        follow_up_date = $16
    `;
    
    const values = [
      owner_name || null, mobile_number || null, address || null,
      pet_name || null, birth_date || null, age || null, type || null, gender || null,
      spayed_neutered || null, weight_kg || null,
      disease_history || null, vaccination_history || null,
      what_was_done_today || null, diagnosis || null, treatment || null,
      follow_up_date || null
    ];
    
    // Only update file paths if new files are uploaded
    if (diagnostics_url) {
      values.push(diagnostics_url);
      query += `, diagnostics_url = $${values.length}`;
    }
    if (today_visit_url) {
      values.push(today_visit_url);
      query += `, today_visit_url = $${values.length}`;
    }
    
    values.push(id);
    query += ` WHERE id = $${values.length} RETURNING *;`;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    
    res.status(200).json({
      message: "Record updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};