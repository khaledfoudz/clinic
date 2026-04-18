import express from 'express';
import {createClinicRecord} from '../controllers/clinic.controller.js';

const router = express.Router();
router.post('/clinic-records', createClinicRecord);
export default router;