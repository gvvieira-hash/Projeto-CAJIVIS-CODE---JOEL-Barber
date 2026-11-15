
function login() {
    alert("Abrindo tela de login...");
}

function criarConta() {
    alert("Abrindo tela de cadastro...");
}

function agendarAgora() {
    alert("Redirecionando para agendamento...");
}

function verServicos() {
    const servicos = document.getElementById("servicos");

    if (servicos) {
        servicos.scrollIntoView({ behavior: "smooth" });
    }
}

function verHorarios() {
    const campoData = document.querySelector('input[type="date"]');
    const campoHorario = document.querySelector('input[type="time"]');

    if (!campoData || !campoHorario) {
        alert("Os campos de data e horário não foram encontrados.");
        return;
    }

    const data = campoData.value;
    const horario = campoHorario.value;

    if (!data || !horario) {
        alert("Selecione uma data e um horário.");
    } else {
        alert("Horários disponíveis para " + data + " às " + horario);
    }
}

function abrirServicos() {
    alert("Abrindo página de serviços...");
}

function conhecerBarbeiros() {
    alert("Mostrando barbeiros disponíveis...");
}

function verProdutos() {
    const produtos = document.getElementById("produtos");

    if (produtos) {
        produtos.scrollIntoView({ behavior: "smooth" });
    }
}

function irFilaEspera() {
    const fila = document.getElementById("fila");

    if (fila) {
        fila.scrollIntoView({ behavior: "smooth" });
    }
}

// EFEITO DO CABEÇALHO AO ROLAR
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");

    if (!header) return;

    if (window.scrollY > 50) {
        header.style.background = "#050505";
        header.style.boxShadow = "0 0 15px rgba(0,0,0,0.5)";
    } else {
        header.style.background = "#000";
        header.style.boxShadow = "none";
    }
});

// EFEITO DOS CARDS
const cards = document.querySelectorAll(".card");

cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
        card.style.border = "1px solid #d4a24c";
    });

    card.addEventListener("mouseleave", function () {
        card.style.border = "1px solid #242424";
    });
});

// CONTROLE DA SESSÃO DO CLIENTE
document.addEventListener("DOMContentLoaded", function () {
    const authButtons = document.getElementById("auth-buttons");
    const userProfile = document.getElementById("user-profile");
    const btnLogout = document.getElementById("btn-logout");
    const nomeUsuarioElemento = userProfile
        ? userProfile.querySelector(".user-name")
        : null;

    function atualizarCabecalho() {
        const usuarioLogado = localStorage.getItem("logado") === "true";
        const nomeSalvo = localStorage.getItem("nomeUsuario");
        const emailSalvo = localStorage.getItem("emailUsuario");

        if (authButtons) {
            authButtons.style.display = usuarioLogado ? "none" : "flex";
        }

        if (userProfile) {
            userProfile.style.display = usuarioLogado ? "flex" : "none";

            if (usuarioLogado && emailSalvo) {
                userProfile.title = emailSalvo;
            } else {
                userProfile.removeAttribute("title");
            }
        }

        if (nomeUsuarioElemento && usuarioLogado) {
            nomeUsuarioElemento.textContent = nomeSalvo || "Minha Conta";
        }
    }

    atualizarCabecalho();

    if (btnLogout) {
        btnLogout.addEventListener("click", function (event) {
            event.preventDefault();

            localStorage.removeItem("logado");
            localStorage.removeItem("emailUsuario");
            localStorage.removeItem("nomeUsuario");
            localStorage.removeItem("telefoneUsuario");

            window.location.reload();
        });
    }
});

// ========================================
// LEMBRETE DE AGENDAMENTO DO CLIENTE
// ========================================

document.addEventListener("DOMContentLoaded", async function () {
    const aviso = document.getElementById("lembrete-agendamento");
    const detalhes = document.getElementById("lembrete-detalhes");
    const botaoDispensar = document.getElementById("dispensar-lembrete");

    if (!aviso || !detalhes || !botaoDispensar) return;

    const usuarioLogado = localStorage.getItem("logado") === "true";
    const email = localStorage.getItem("emailUsuario");

    if (!usuarioLogado || !email) return;

    const API_URL = "https://projeto-cajivis-code-joel-barber-production.up.railway.app/api";

    try {
        const resposta = await fetch(
            `${API_URL}/clientes/meus-agendamentos?email=${encodeURIComponent(email)}`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar os agendamentos.");
        }

        const agendamentos = await resposta.json();

        if (!Array.isArray(agendamentos)) return;

        const agora = Date.now();

        const proximos = agendamentos
            .filter((agendamento) => {
                if (!["agendado", "confirmado"].includes(agendamento.status)) {
                    return false;
                }

                const dataHora = new Date(
                    `${String(agendamento.data).slice(0, 10)}T${agendamento.horario}:00-03:00`
                );

                const diferenca = dataHora.getTime() - agora;

                return diferenca > 0 && diferenca <= 6 * 60 * 60 * 1000;
            })
            .sort((a, b) => {
                const dataA = new Date(`${a.data}T${a.horario}:00-03:00`);
                const dataB = new Date(`${b.data}T${b.horario}:00-03:00`);

                return dataA - dataB;
            });

        const agendamento = proximos.find((item) => {
            return localStorage.getItem(`lembreteDispensado_${item.id}`) !== "true";
        });

        if (!agendamento) return;

        const [ano, mes, dia] = String(agendamento.data).slice(0, 10).split("-");

        detalhes.textContent =
            `Serviço: ${agendamento.servico} | ` +
            `Barbeiro: ${agendamento.barbeiro || "Não informado"} | ` +
            `Data: ${dia}/${mes}/${ano} | ` +
            `Horário: ${agendamento.horario}`;

        aviso.hidden = false;

        botaoDispensar.addEventListener("click", function () {
            localStorage.setItem(`lembreteDispensado_${agendamento.id}`, "true");
            aviso.hidden = true;
        });

    } catch (erro) {
        console.error("Erro ao carregar lembrete:", erro);
    }
});
