import express from 'express';
import { createOwnerWithPet, addPetToOwner } from '../controllers/post.controller.js';
import { getAllOwners, getOwnerById, getPetById } from '../controllers/get.controller.js';
import { updateOwner, updatePet } from '../controllers/put.controller.js';
import { deleteOwner, deletePet } from '../controllers/delete.controller.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

const fileUpload = upload.fields([
    { name: 'diagnostics', maxCount: 1 },
    { name: 'today_visit',  maxCount: 1 },
]);

// ── Owners ───────────────────────────────────────────────────
// GET    /api/owners              → all owners + their pets (nested)
// GET    /api/owners/:id          → one owner + their pets
// POST   /api/owners              → create new owner + first pet
// PUT    /api/owners/:id          → update owner info only
// DELETE /api/owners/:id          → delete owner AND all their pets

router.get('/owners',        getAllOwners);
router.get('/owners/:id',    getOwnerById);
router.post('/owners',       fileUpload, createOwnerWithPet);
router.put('/owners/:id',    updateOwner);
router.delete('/owners/:id', deleteOwner);

// ── Pets ─────────────────────────────────────────────────────
// GET    /api/owners/:ownerId/pets/:petId  → get one pet
// POST   /api/owners/:ownerId/pets         → add a pet to existing owner
// PUT    /api/pets/:petId                  → update a pet
// DELETE /api/pets/:petId                  → delete one pet (owner row stays)

router.get('/owners/:ownerId/pets/:petId', getPetById);
router.post('/owners/:ownerId/pets',       fileUpload, addPetToOwner);
router.put('/pets/:petId',                 fileUpload, updatePet);
router.delete('/pets/:petId',              deletePet);

export default router;