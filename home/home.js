
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
