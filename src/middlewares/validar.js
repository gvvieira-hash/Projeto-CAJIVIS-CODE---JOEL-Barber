function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        erros: resultado.error.issues.map((erro) => ({
          campo: erro.path.join('.'),
          mensagem: erro.message
        }))
      });
    }

    req.body = resultado.data;
    next();
  };
}

module.exports = validar;
