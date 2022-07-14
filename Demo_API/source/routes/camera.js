import express from "express";

import {getDevices, getDevice, getEventsFromDevice} from "../controllers/camera.js";

const router = express.Router();

router.get('/devices', getDevices)
router.get('/devices/:id', getDevice)
router.get('/events/:id', getEventsFromDevice)

export default router;