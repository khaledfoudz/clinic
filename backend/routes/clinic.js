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

// Wraps multer so that if no files are sent (or multer fails),
// req.body is still populated and we don't get "req.body is undefined".
const handleUpload = (req, res, next) => {
    fileUpload(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: err.message });
        }
        // Multer v2 + Express v5: guarantee req.body is always an object
        req.body = req.body || {};
        next();
    });
};

// ── Owners ───────────────────────────────────────────────────
router.get('/owners',        getAllOwners);
router.get('/owners/:id',    getOwnerById);
router.post('/owners',       handleUpload, createOwnerWithPet);
router.put('/owners/:id',    updateOwner);
router.delete('/owners/:id', deleteOwner);

// ── Pets ─────────────────────────────────────────────────────
router.get('/owners/:ownerId/pets/:petId', getPetById);
router.post('/owners/:ownerId/pets',       handleUpload, addPetToOwner);
router.put('/pets/:petId',                 handleUpload, updatePet);
router.delete('/pets/:petId',              deletePet);

export default router;