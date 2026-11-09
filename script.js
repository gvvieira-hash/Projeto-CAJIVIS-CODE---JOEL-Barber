const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const botaoEntrar = document.getElementById("btnEntrar");
const olho = document.querySelector(".fa-eye-slash");

const API_URL = "http://localhost:3000";

// Mensagem de retorno do login
const mensagem = document.createElement("p");
mensagem.id = "mensagemLogin";
mensagem.style.marginTop = "12px";
mensagem.style.fontSize = "14px";
mensagem.style.textAlign = "center";

botaoEntrar.parentNode.insertBefore(
    mensagem,
    botaoEntrar.nextSibling
);

// Mostrar ou esconder senha
if (olho) {
    olho.addEventListener("click", () => {
        if (senhaInput.type === "password") {
            senhaInput.type = "text";
            olho.classList.remove("fa-eye-slash");
            olho.classList.add("fa-eye");
        } else {
            senhaInput.type = "password";
            olho.classList.remove("fa-eye");
            olho.classList.add("fa-eye-slash");
        }
    });
}

// Ativar botão quando os campos estiverem preenchidos
function validarCampos() {
    const preenchidos =
        emailInput.value.trim() !== "" &&
        senhaInput.value !== "";

    botaoEntrar.classList.toggle("disabled", !preenchidos);
}

emailInput.addEventListener("input", validarCampos);
senhaInput.addEventListener("input", validarCampos);

validarCampos();

// LOGIN DE CLIENTE E ADMINISTRADOR
botaoEntrar.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    if (!email || !senha) {
        mensagem.textContent = "Preencha seu e-mail e sua senha.";
        mensagem.style.color = "#ff6b6b";
        return;
    }

    botaoEntrar.textContent = "Entrando...";
    botaoEntrar.style.pointerEvents = "none";
    mensagem.textContent = "";

    try {
        // 1. Tentar entrar como cliente
        const respostaCliente = await fetch(
            `${API_URL}/api/clientes/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            }
        );

        const dadosCliente = await respostaCliente.json();

        // Se for cliente, entrar na página inicial
        if (respostaCliente.ok) {
            localStorage.removeItem("tokenAdmin");
            localStorage.removeItem("emailAdmin");

            localStorage.setItem("logado", "true");
            localStorage.setItem(
                "emailUsuario",
                dadosCliente.cliente.email
            );
            localStorage.setItem(
                "nomeUsuario",
                dadosCliente.cliente.nome
            );
            localStorage.setItem(
                "telefoneUsuario",
                dadosCliente.cliente.telefone
            );

            window.location.href =
                "https://gvvieira-hash.github.io/Projeto-CAJIVIS-CODE---JOEL-Barber/home/home.html";

            return;
        }

        // 2. Se não for cliente, tentar entrar como administrador
        const respostaAdmin = await fetch(
            `${API_URL}/api/admin/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            }
        );

        const dadosAdmin = await respostaAdmin.json();

        // Se for administrador, entrar no painel administrativo
        if (respostaAdmin.ok) {
            localStorage.removeItem("logado");
            localStorage.removeItem("emailUsuario");
            localStorage.removeItem("nomeUsuario");
            localStorage.removeItem("telefoneUsuario");

            localStorage.setItem(
                "tokenAdmin",
                dadosAdmin.token
            );
            localStorage.setItem(
                "emailAdmin",
                dadosAdmin.administrador.email
            );

            window.location.href = "admin.html";

            return;
        }

        // Se nenhum login funcionar, mostrar mensagem
        mensagem.textContent = "E-mail ou senha incorretos.";
        mensagem.style.color = "#ff6b6b";

    } catch (erro) {
        console.error("ERRO REAL DO LOGIN:", erro);

        mensagem.textContent =
            "Não foi possível conectar ao servidor. Verifique a conexão.";

        mensagem.style.color = "#ff6b6b";

    } finally {
        botaoEntrar.textContent = "Entrar";
        botaoEntrar.style.pointerEvents = "";
    }
});