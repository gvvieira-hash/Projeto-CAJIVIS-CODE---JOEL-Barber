const { z } = require('zod');

const agendamentoSchema = z.object({
  cliente: z.string().min(3, 'Nome muito curto'),
  servico: z.string().min(1, 'Informe o serviço'),
  barbeiro: z.string().min(1, 'Informe o barbeiro'),
  data: z.string().min(1, 'Informe a data'),
  horario: z.string().min(1, 'Informe o horário')
});

module.exports = agendamentoSchema;
