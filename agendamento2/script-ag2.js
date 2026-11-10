
const API_URL = "https://projeto-cajivis-code-joel-barber-production.up.railway.app";

// Fotos e informações dos barbeiros atuais
const dadosBarbeiros = {
    "Carlos Pablo": {
        imagem: "carlosmuitolindo.jpeg",
        cargo: "Especialista",
        nota: "5.0"
    },
    "Guilherme Vieira": {
        imagem: "gvmuitolindo.webp",
        cargo: "o Melhor",
        nota: "4.8"
    },
    "Deivisson Rocha": {
        imagem: "deivissonmuitolindo.jpeg",
        cargo: "Profissional",
        nota: "4.7"
    },
    "Saulo Farias": {
        imagem: "saulomuitolindo.jpeg",
        cargo: "Profissional",
        nota: "4.9"
    }
};

// Carrega os barbeiros ativos do banco
async function carregarBarbeiros() {
    const lista = document.getElementById("listaBarbeiros");

    if (!lista) return;

    try {
        const resposta = await fetch(`${API_URL}/api/barbeiros`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os barbeiros.");
        }

        const barbeiros = await resposta.json();

        if (!barbeiros.length) {
            lista.innerHTML = "<p>Nenhum barbeiro disponível no momento.</p>";
            localStorage.removeItem("barbeiro");
            return;
        }

        const barbeiroSalvo = localStorage.getItem("barbeiro");

        const existeSalvo = barbeiros.some(
            b => b.nome === barbeiroSalvo
        );

        const nomeSelecionado = existeSalvo
            ? barbeiroSalvo
            : barbeiros[0].nome;

        lista.innerHTML = barbeiros.map(barbeiro => {
            const dados = dadosBarbeiros[barbeiro.nome];

          const imagem = barbeiro.foto || (
    dados ? dados.imagem : "images.jpg"
);

            const cargo = dados
                ? dados.cargo
                : "Profissional";

            const nota = dados
                ? dados.nota
                : "Novo";

            const selecionado = barbeiro.nome === nomeSelecionado
                ? "selected"
                : "";

            return `
                <div class="barber-card ${selecionado}">
                    <img src="${imagem}" alt="${barbeiro.nome}">
                    <h3>${barbeiro.nome}</h3>
                    <span class="cargo">${cargo}</span>
                    <div class="rating">
                        <i class="fa-solid fa-star"></i>${nota}
                    </div>
                </div>
            `;
        }).join("");

        localStorage.setItem("barbeiro", nomeSelecionado);

        lista.querySelectorAll(".barber-card").forEach(card => {
            card.addEventListener("click", () => {
                lista.querySelectorAll(".barber-card").forEach(b => {
                    b.classList.remove("selected");
                });

                card.classList.add("selected");

                const nome = card.querySelector("h3").innerText;

                localStorage.setItem("barbeiro", nome);
            });
        });

    } catch (erro) {
        console.error("Erro ao carregar barbeiros:", erro);

        lista.innerHTML = `
            <p>Não foi possível carregar os barbeiros. Tente novamente.</p>
        `;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    carregarBarbeiros();

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
});
