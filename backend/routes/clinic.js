import express from 'express';
import { createClinicRecord } from '../controllers/post.controller.js';
import { getAllClinicRecords, getClinicRecordById } from '../controllers/get.controller.js';
import { updateClinicRecord } from '../controllers/put.controller.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post(
        '/clinic-records',
    upload.fields([
        { name: 'diagnostics', maxCount: 1 },
        { name: 'today_visit', maxCount: 1 }
    ]),
    createClinicRecord
);

router.get('/clinic-records', getAllClinicRecords);
router.get('/clinic-records/:id', getClinicRecordById);

router.put(
    '/clinic-records/:id',
    upload.fields([
        { name: 'diagnostics', maxCount: 1 },
        { name: 'today_visit', maxCount: 1 }
    ]),
    updateClinicRecord
);

export default router;