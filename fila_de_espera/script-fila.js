
const agendamentos = [
    {
        id: 1,
        servico: "Corte + Barba",
        data: "2026-10-21",
        inicio: "09:30",
        fim: "10:30",
        valor: 50,
        barbeiro: "Joel",
        status: "confirmado"
    }
];

// Dados fictícios para demonstrar o histórico.
// Em produção, carregue esses dados do banco de dados.
const historico = [
    {
        servico: "Corte de Cabelo",
        data: "2026-10-14",
        horario: "10:00",
        valor: 30,
        status: "concluido"
    },
    {
        servico: "Corte + Barba",
        data: "2026-10-07",
        horario: "14:30",
        valor: 50,
        status: "concluido"
    },
    {
        servico: "Barba",
        data: "2026-09-30",
        horario: "11:00",
        valor: 20,
        status: "cancelado"
    }
];

const formatarData = (data) => {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
};

const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", {
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

function obterProximoAgendamento() {
    const agora = new Date();

    return agendamentos
        .filter(item => item.status === "confirmado")
        .filter(item => {
            const [hora, minuto] = item.inicio.split(":").map(Number);
            const data = formatarData(item.data);
            data.setHours(hora, minuto, 0, 0);
            return data >= agora;
        })
        .sort((a, b) =>
            `${a.data} ${a.inicio}`.localeCompare(`${b.data} ${b.inicio}`)
        )[0];
}

function atualizarAgendamento() {
    const item = obterProximoAgendamento();

    const botaoCancelar = document.getElementById("btnCancelar");
    const aviso = document.getElementById("avisoHorario");

    if (!item) {
        document.getElementById("proximoHorario").textContent = "--:--";
        document.getElementById("proximaData").textContent =
            "Nenhum horário futuro";
        document.getElementById("proximoServico").textContent = "Nenhum";
        document.getElementById("statusResumo").textContent = "Sem agendamento";
        document.getElementById("statusDetalhe").textContent = "Sem agendamento";
        document.getElementById("servicoDetalhe").textContent =
            "Você não possui horários marcados";
        document.getElementById("horarioDetalhe").textContent = "--";
        document.getElementById("valorDetalhe").textContent = "--";
        document.getElementById("diaAgendamento").textContent = "--";
        document.getElementById("mesAgendamento").textContent = "---";
        document.getElementById("diaSemana").textContent = "";
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

    const data = formatarData(item.data);
    const [hora, minuto] = item.inicio.split(":").map(Number);
    const inicio = new Date(data);
    inicio.setHours(hora, minuto, 0, 0);

    const fim = `${item.fim}`;
    const agora = new Date();
    const terminou = agora >= inicio && agora >= (() => {
        const [h, m] = fim.split(":").map(Number);
        const d = new Date(data);
        d.setHours(h, m, 0, 0);
        return d;
    })();

    const comecou = agora >= inicio && !terminou;

    document.getElementById("proximoHorario").textContent = item.inicio;
    document.getElementById("proximaData").textContent =
        formatarDataCompleta(item.data);
    document.getElementById("proximoServico").textContent = item.servico;
    document.getElementById("statusResumo").textContent =
        comecou ? "Em atendimento" : "Confirmado";

    document.getElementById("mesAgendamento").textContent =
        nomesMeses[data.getMonth()];
    document.getElementById("diaAgendamento").textContent =
        String(data.getDate()).padStart(2, "0");
    document.getElementById("diaSemana").textContent =
        nomesDias[data.getDay()];

    document.getElementById("servicoDetalhe").textContent = item.servico;
    document.getElementById("horarioDetalhe").textContent =
        `${item.inicio} - ${item.fim}`;
    document.getElementById("valorDetalhe").textContent =
        formatarMoeda(item.valor);

    const status = document.getElementById("statusDetalhe");

    if (comecou) {
        status.className = "status em-andamento";
        status.innerHTML =
            '<i class="fa-solid fa-scissors"></i> Em atendimento';

        aviso.innerHTML = `
            <i class="fa-solid fa-scissors"></i>
            <div>
                <strong>Seu horário chegou!</strong>
                <p>O atendimento está previsto para este momento.</p>
            </div>
        `;
    } else {
        status.className = "status confirmado";
        status.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> Confirmado';

        aviso.innerHTML = `
            <i class="fa-solid fa-bell"></i>
            <div>
                <strong>Não se esqueça do seu horário!</strong>
                <p>Chegue alguns minutos antes para evitar atrasos.</p>
            </div>
        `;
    }

    botaoCancelar.disabled = comecou;
    botaoCancelar.title = comecou
        ? "O horário já começou"
        : "Cancelar agendamento";
}

function renderizarHistorico(filtro = "todos") {
    const lista = document.getElementById("listaHistorico");

    const itens = historico
        .filter(item => filtro === "todos" || item.status === filtro)
        .sort((a, b) =>
            `${b.data} ${b.horario}`.localeCompare(`${a.data} ${a.horario}`)
        );

    if (itens.length === 0) {
        lista.innerHTML = `
            <div class="vazio">
                <i class="fa-regular fa-calendar"></i>
                <p>Nenhum atendimento encontrado.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = itens.map(item => {
        const statusTexto = {
            concluido: "Concluído",
            cancelado: "Cancelado"
        }[item.status] || item.status;

        const icone = item.status === "concluido"
            ? "fa-check"
            : "fa-xmark";

        return `
            <article class="historico-item">
                <div class="historico-icone">
                    <i class="fa-solid ${icone}"></i>
                </div>

                <div class="historico-dados">
                    <h3>${item.servico}</h3>
                    <p>
                        <i class="fa-regular fa-calendar"></i>
                        ${formatarDataCompleta(item.data)}
                    </p>
                    <p>
                        <i class="fa-regular fa-clock"></i>
                        ${item.horario}
                    </p>
                </div>

                <div class="historico-final">
                    <strong>${formatarMoeda(item.valor)}</strong>
                    <span class="status ${item.status}">
                        ${statusTexto}
                    </span>
                </div>
            </article>
        `;
    }).join("");
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
    const item = obterProximoAgendamento();

    if (!item) {
        alert("Você não possui agendamento para cancelar.");
        return;
    }

    if (!confirm("Deseja realmente cancelar este agendamento?")) {
        return;
    }

    item.status = "cancelado";

    historico.push({
        servico: item.servico,
        data: item.data,
        horario: item.inicio,
        valor: item.valor,
        status: "cancelado"
    });

    agendamentos.splice(agendamentos.indexOf(item), 1);

    atualizarAgendamento();
    renderizarHistorico();

    alert("Agendamento cancelado com sucesso!");
});

document.addEventListener("DOMContentLoaded", () => {
    const logado = localStorage.getItem("logado") === "true";
    const authButtons = document.getElementById("auth-buttons");
    const perfil = document.getElementById("user-profile");

    if (logado) {
        authButtons.style.display = "none";
        perfil.style.display = "flex";

        const email = localStorage.getItem("emailUsuario");
        if (email) perfil.title = email;
    } else {
        authButtons.style.display = "flex";
        perfil.style.display = "none";
    }

    document.getElementById("btn-logout").addEventListener("click", event => {
        event.preventDefault();
        localStorage.setItem("logado", "false");
        localStorage.removeItem("emailUsuario");
        window.location.href = "../home/home.html";
    });

    atualizarAgendamento();
    renderizarHistorico();
});
