
const API_URL = "https://projeto-cajivis-code-joel-barber-production.up.railway.app";

const listaServicos = document.getElementById("listaServicos");

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function selecionarServico(card, servico) {
    document.querySelectorAll(".card").forEach(c => {
        c.classList.remove("active-card");
    });

    card.classList.add("active-card");

    localStorage.setItem("servico", servico.nome);
    localStorage.setItem("valor", formatarPreco(servico.preco));
}

async function carregarServicos() {
    try {
        const resposta = await fetch(`${API_URL}/api/servicos`);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar os serviços.");
        }

        const servicos = await resposta.json();

        listaServicos.innerHTML = "";

        if (!servicos.length) {
            listaServicos.innerHTML =
                "<p>Nenhum serviço disponível no momento.</p>";
            return;
        }

        servicos.forEach((servico, index) => {
            const card = document.createElement("div");

            card.className = "card";

            if (index === 0) {
                card.classList.add("active-card");
            }

            const icone = document.createElement("i");

            // Usa o ícone cadastrado no painel administrativo
            icone.className = servico.icone || "fa-solid fa-scissors";

            const titulo = document.createElement("h3");
            titulo.textContent = servico.nome;

            const preco = document.createElement("p");
            preco.textContent = formatarPreco(servico.preco);

            card.appendChild(icone);
            card.appendChild(titulo);
            card.appendChild(preco);

            card.addEventListener("click", () => {
                selecionarServico(card, servico);
            });

            listaServicos.appendChild(card);

            if (index === 0) {
                localStorage.setItem("servico", servico.nome);
                localStorage.setItem("valor", formatarPreco(servico.preco));
            }
        });

    } catch (error) {
        console.error("Erro ao carregar serviços:", error);

        listaServicos.innerHTML =
            "<p>Não foi possível carregar os serviços. Atualize a página.</p>";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const usuarioLogado = localStorage.getItem("logado") === "true";
    const emailSalvo = localStorage.getItem("emailUsuario");

    const authButtons = document.getElementById("auth-buttons");
    const userProfile = document.getElementById("user-profile");

    if (authButtons && userProfile) {
        if (usuarioLogado) {
            authButtons.style.display = "none";
            userProfile.style.display = "flex";

            if (emailSalvo) {
                userProfile.title = emailSalvo;
            }
        } else {
            authButtons.style.display = "flex";
            userProfile.style.display = "none";
        }
    }

    const btnLogout = document.getElementById("btn-logout");

    if (btnLogout) {
        btnLogout.addEventListener("click", function(event) {
            event.preventDefault();

            localStorage.setItem("logado", "false");
            localStorage.removeItem("emailUsuario");

            window.location.href = "../home/home.html";
        });
    }

    carregarServicos();
});
