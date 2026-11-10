const express = require('express');
const router = express.Router();

const validar = require('./middlewares/validar');
const agendamentoSchema = require('./schemas/agendamentoSchema');

const {
  listarServicos
} = require('./controllers/servicoController');

const {
  listarBarbeiros
} = require('./controllers/barbeiroController');

const {
  criarAgendamento
} = require('./controllers/agendamentoController');

router.get('/servicos', listarServicos);
router.get('/barbeiros', listarBarbeiros);

router.post(
  '/agendamentos',
  validar(agendamentoSchema),
  criarAgendamento
);

module.exports = router;
