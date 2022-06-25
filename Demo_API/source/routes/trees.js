import express from "express";

import {getTrees} from "../controllers/trees.js";

const router = express.Router();

//All routes will be prefixed with /trees
router.get('/', getTrees);

export default router;