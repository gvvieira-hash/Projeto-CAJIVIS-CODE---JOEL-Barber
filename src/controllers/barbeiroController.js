function listarBarbeiros(req, res) {
  const barbeiros = [
    { id: 1, nome: 'Carlos' },
    { id: 2, nome: 'Deivisson' },
    { id: 3, nome: 'Guilherme'},
    { id: 4, nome: 'Saulo'}
  ];

  return res.status(200).json(barbeiros);
}

module.exports = { listarBarbeiros };
