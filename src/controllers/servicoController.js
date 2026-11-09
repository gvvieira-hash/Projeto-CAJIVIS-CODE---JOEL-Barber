function listarServicos(req, res) {
  const servicos = [
    {
      id: 1,
      nome: 'Corte degradê',
      preco: 35
    },
    {
      id: 2,
      nome: 'Barba',
      preco: 20
    },
    {
      id: 3,
      nome: 'Corte + Barba',
      preco: 50
    }
  ];

  return res.status(200).json(servicos);
}

module.exports = { listarServicos };
