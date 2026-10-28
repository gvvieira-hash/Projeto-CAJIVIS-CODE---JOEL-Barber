
function criarAgendamento(req, res) {
  const { cliente, servico, barbeiro, data, horario } = req.body;

  const agendamento = {
    id: 1,
    cliente,
    servico,
    barbeiro,
    data,
    horario,
    status: 'PENDENTE'
  };

  return res.status(201).json({
    mensagem: 'Agendamento simulado com sucesso!',
    agendamento
  });
}

module.exports = { criarAgendamento };
