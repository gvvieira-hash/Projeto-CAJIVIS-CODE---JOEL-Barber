
const formulario = document.getElementById("formLogin");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const botaoEntrar = document.getElementById("btnEntrar");
const btnMostrarSenha = document.getElementById("btnMostrarSenha");
const mensagem = document.getElementById("mensagem");

const API_URL = "https://projeto-cajivis-code-joel-barber-production.up.railway.app";

btnMostrarSenha.addEventListener("click", () => {
    const mostrando = senhaInput.type === "text";

    senhaInput.type = mostrando ? "password" : "text";
    btnMostrarSenha.textContent = mostrando ? "Mostrar" : "Ocultar";
});

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
        mensagem.textContent = "Preencha o e-mail e a senha.";
        mensagem.style.color = "#ff6b6b";
        return;
    }

    botaoEntrar.disabled = true;
    botaoEntrar.textContent = "Entrando...";
    mensagem.textContent = "";

    try {
        const resposta = await fetch(`${API_URL}/api/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent =
                dados.erro ||
                dados.mensagem ||
                "E-mail ou senha de administrador incorretos.";

            mensagem.style.color = "#ff6b6b";
            return;
        }

        if (!dados.token) {
            mensagem.textContent =
                "O servidor não retornou o token administrativo.";

            mensagem.style.color = "#ff6b6b";
            return;
        }

        // Salva a sessão administrativa separadamente da sessão do cliente.
        localStorage.setItem("tokenAdmin", dados.token);
        localStorage.setItem(
            "emailAdmin",
            dados.administrador?.email || email
        );

        mensagem.textContent = "Login realizado! Abrindo o painel...";
        mensagem.style.color = "#65d68a";

        window.location.href = "admin.html";

    } catch (erro) {
        console.error("Erro no login administrativo:", erro);

        mensagem.textContent =
            "Não foi possível conectar ao servidor. Confira se ele está ligado.";

        mensagem.style.color = "#ff6b6b";

    } finally {
        botaoEntrar.disabled = false;
        botaoEntrar.textContent = "Entrar no painel";
    }
});
