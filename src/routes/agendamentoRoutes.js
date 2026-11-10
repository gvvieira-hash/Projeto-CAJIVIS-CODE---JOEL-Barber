
import express from "express";

import {
    criarAgendamento
} from "../controllers/agendamentoController.js";

const router = express.Router();

router.post("/agendamentos", criarAgendamento);

export default router;
