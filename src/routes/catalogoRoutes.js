import express from "express";

import { listarServicos } from "../controllers/servicoController.js";
import { listarBarbeiros } from "../controllers/barbeiroController.js";

const router = express.Router();

router.get("/servicos", listarServicos);
router.get("/barbeiros", listarBarbeiros);

export default router;
