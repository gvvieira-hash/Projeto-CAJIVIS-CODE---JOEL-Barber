
const API_URL = "http://localhost:3000/api";

let agendamentos = [];
let filtroAtual = "todos";

const formatarData = (data) => {
    const [ano, mes, dia] = String(data).slice(0, 10).split("-").map(Number);
    return new Date(ano, mes - 1, dia);
};

const formatarMoeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

const formatarDataCompleta = (data) =>
    formatarData(data).toLocaleDateString("pt-BR");

const nomesMeses = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

const nomesDias = [
    "Domingo", "Segunda-feira", "Terça-feira",
    "Quarta-feira", "Quinta-feira", "Sexta-feira",
    "Sábado"
];

function obterInicio(item) {
    const data = formatarData(item.data);
    const [hora, minuto] = item.horario.split(":").map(Number);
    data.setHours(hora, minuto, 0, 0);
    return data;
}

function obterFim(item) {
    const inicio = obterInicio(item);
    inicio.setMinutes(inicio.getMinutes() + Number(item.duracao_minutos || 30));
    return inicio;
}

function formatarHorario(data) {
    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

function statusNormalizado(status) {
    return String(status || "").toLowerCase();
}

function statusAtivo(status) {
    return ["agendado", "confirmado"].includes(statusNormalizado(status));
}

function statusTexto(status) {
    const nomes = {
        agendado: "Agendado",
        confirmado: "Confirmado",
        concluido: "Concluído",
        cancelado: "Cancelado"
    };

    return nomes[statusNormalizado(status)] || status || "Indefinido";
}

function obterProximoAgendamento() {
    const agora = new Date();

    return agendamentos
        .filter(item => statusAtivo(item.status))
        .filter(item => obterInicio(item) >= agora)
        .sort((a, b) => obterInicio(a) - obterInicio(b))[0];
}

function atualizarAgendamento() {
    const item = obterProximoAgendamento();

    const botaoCancelar = document.getElementById("btnCancelar");
    const aviso = document.getElementById("avisoHorario");
    const status = document.getElementById("statusDetalhe");

    if (!item) {
        document.getElementById("proximoHorario").textContent = "--:--";
        document.getElementById("proximaData").textContent = "Nenhum horário futuro";
        document.getElementById("proximoServico").textContent = "Nenhum";
        document.getElementById("statusResumo").textContent = "Sem agendamento";

        status.className = "status";
        status.textContent = "Sem agendamento";

        document.getElementById("servicoDetalhe").textContent =
            "Você não possui horários marcados";
        document.getElementById("horarioDetalhe").textContent = "--";
        document.getElementById("valorDetalhe").textContent = "--";
        document.getElementById("diaAgendamento").textContent = "--";
        document.getElementById("mesAgendamento").textContent = "---";
        document.getElementById("diaSemana").textContent = "";

        const dados = document.querySelector(".dados-agendamento");
        const paragrafos = dados ? dados.querySelectorAll("p") : [];

        if (paragrafos[1]) {
            paragrafos[1].innerHTML =
                '<i class="fa-solid fa-user"></i> Barbeiro: --';
        }

        botaoCancelar.disabled = true;
        aviso.innerHTML = `
            <i class="fa-solid fa-calendar-plus"></i>
            <div>
                <strong>Que tal marcar seu próximo corte?</strong>
                <p>Escolha um serviço e reserve seu horário.</p>
            </div>
        `;
        return;
    }

    const inicio = obterInicio(item);
    const fim = obterFim(item);
    const agora = new Date();
    const comecou = agora >= inicio && agora < fim;

    document.getElementById("proximoHorario").textContent = item.horario;
    document.getElementById("proximaData").textContent =
        formatarDataCompleta(item.data);
    document.getElementById("proximoServico").textContent = item.servico;
    document.getElementById("statusResumo").textContent =
        comecou ? "Em atendimento" : statusTexto(item.status);

    document.getElementById("mesAgendamento").textContent =
        nomesMeses[inicio.getMonth()];
    document.getElementById("diaAgendamento").textContent =
        String(inicio.getDate()).padStart(2, "0");
    document.getElementById("diaSemana").textContent =
        nomesDias[inicio.getDay()];

    document.getElementById("servicoDetalhe").textContent = item.servico;
    document.getElementById("horarioDetalhe").textContent =
        `${item.horario} - ${formatarHorario(fim)}`;
    document.getElementById("valorDetalhe").textContent =
        formatarMoeda(item.valor);

    const dados = document.querySelector(".dados-agendamento");
    const paragrafos = dados ? dados.querySelectorAll("p") : [];

    if (paragrafos[1]) {
        paragrafos[1].innerHTML = "";
        const icone = document.createElement("i");
        icone.className = "fa-solid fa-user";
        paragrafos[1].append(icone, ` Barbeiro: ${item.barbeiro || "Não informado"}`);
    }

    status.className = `status ${statusNormalizado(item.status)}`;
    status.textContent = comecou ? "Em atendimento" : statusTexto(item.status);

    aviso.innerHTML = `
        <i class="fa-solid fa-bell"></i>
        <div>
            <strong>Não se esqueça do seu horário!</strong>
            <p>Chegue alguns minutos antes para evitar atrasos.</p>
        </div>
    `;

    botaoCancelar.disabled = true;
    botaoCancelar.title =
        "O cancelamento pela página ainda precisa ser conectado à API.";
}

function renderizarHistorico(filtro = filtroAtual) {
    filtroAtual = filtro;

    const lista = document.getElementById("listaHistorico");

    const itens = agendamentos
        .filter(item => {
            if (filtro === "todos") {
                return ["concluido", "cancelado"].includes(
                    statusNormalizado(item.status)
                );
            }

            return statusNormalizado(item.status) === filtro;
        })
        .sort((a, b) => obterInicio(b) - obterInicio(a));

    if (itens.length === 0) {
        lista.innerHTML = `
            <div class="vazio">
                <i class="fa-regular fa-calendar"></i>
                <p>Nenhum atendimento encontrado.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = "";

    itens.forEach(item => {
        const artigo = document.createElement("article");
        artigo.className = "historico-item";

        const iconeDiv = document.createElement("div");
        iconeDiv.className = "historico-icone";

        const icone = document.createElement("i");
        icone.className =
            statusNormalizado(item.status) === "concluido"
                ? "fa-solid fa-check"
                : "fa-solid fa-xmark";

        iconeDiv.appendChild(icone);

        const dados = document.createElement("div");
        dados.className = "historico-dados";

        const titulo = document.createElement("h3");
        titulo.textContent = item.servico;

        const data = document.createElement("p");
        data.textContent = ` ${formatarDataCompleta(item.data)}`;

        const iconeData = document.createElement("i");
        iconeData.className = "fa-regular fa-calendar";
        data.prepend(iconeData);

        const horario = document.createElement("p");
        horario.textContent = ` ${item.horario}`;

        const iconeHora = document.createElement("i");
        iconeHora.className = "fa-regular fa-clock";
        horario.prepend(iconeHora);

        dados.append(titulo, data, horario);

        const final = document.createElement("div");
        final.className = "historico-final";

        const valor = document.createElement("strong");
        valor.textContent = formatarMoeda(item.valor);

        const status = document.createElement("span");
        status.className = `status ${statusNormalizado(item.status)}`;
        status.textContent = statusTexto(item.status);

        final.append(valor, status);
        artigo.append(iconeDiv, dados, final);
        lista.appendChild(artigo);
    });
}

async function carregarAgendamentos() {
    const email = localStorage.getItem("emailUsuario");
    const logado = localStorage.getItem("logado") === "true";

    if (!logado || !email) {
        document.getElementById("listaHistorico").textContent =
            "Entre na sua conta para consultar seus agendamentos.";
        atualizarAgendamento();
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/clientes/meus-agendamentos?email=${encodeURIComponent(email)}`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao carregar agendamentos.");
        }

        agendamentos = dados.map(item => ({
            ...item,
            data: String(item.data).slice(0, 10),
            horario: String(item.horario).slice(0, 5),
            valor: Number(item.valor || 0)
        }));

        atualizarAgendamento();
        renderizarHistorico();
    } catch (erro) {
        console.error("Erro ao carregar agendamentos:", erro);

        document.getElementById("listaHistorico").textContent =
            "Não foi possível carregar seus agendamentos. Verifique se o servidor está funcionando.";
        atualizarAgendamento();
    }
}

document.querySelectorAll(".filtro").forEach(botao => {
    botao.addEventListener("click", () => {
        document.querySelectorAll(".filtro").forEach(item =>
            item.classList.remove("ativo")
        );

        botao.classList.add("ativo");
        renderizarHistorico(botao.dataset.filtro);
    });
});

document.getElementById("btnCancelar").addEventListener("click", () => {
    alert("O cancelamento pelo banco de dados ainda será implementado.");
});

document.addEventListener("DOMContentLoaded", carregarAgendamentos);
