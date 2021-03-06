import express from "express";

import {getPedestrians} from "../controllers/pedestrians.js";

const router = express.Router();

//All routes will be prefixed with /pedestrians
router.get('/', getPedestrians);

export default router;