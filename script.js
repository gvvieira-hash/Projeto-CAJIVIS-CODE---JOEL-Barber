
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const botaoEntrar = document.getElementById("btnEntrar");
const olho = document.querySelector(".fa-eye-slash");

// Mensagem de retorno
const mensagem = document.createElement("p");
mensagem.id = "mensagemLogin";
mensagem.style.marginTop = "12px";
mensagem.style.fontSize = "14px";
mensagem.style.textAlign = "center";
botaoEntrar.parentNode.insertBefore(mensagem, botaoEntrar.nextSibling);

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

// Login conectado ao backend
botaoEntrar.addEventListener("click", async (event) => {
    event.preventDefault();

    if (
        emailInput.value.trim() === "" ||
        senhaInput.value === ""
    ) {
        mensagem.textContent = "Preencha seu e-mail e sua senha.";
        mensagem.style.color = "#ff6b6b";
        return;
    }

    botaoEntrar.textContent = "Entrando...";
    botaoEntrar.style.pointerEvents = "none";
    mensagem.textContent = "";

    try {
        const resposta = await fetch(
            "http://localhost:3000/api/clientes/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    senha: senhaInput.value
                })
            }
        );

        const dados = await resposta.json();

        // Se o servidor rejeitar, não entrar na página inicial
        if (!resposta.ok) {
            localStorage.removeItem("logado");

            mensagem.textContent =
                dados.erro || "E-mail ou senha incorretos.";
            mensagem.style.color = "#ff6b6b";
            return;
        }

        // Só salvar o login após o servidor confirmar a senha
        localStorage.setItem("logado", "true");
        localStorage.setItem("emailUsuario", dados.cliente.email);
        localStorage.setItem("nomeUsuario", dados.cliente.nome);
        localStorage.setItem("telefoneUsuario", dados.cliente.telefone);

        window.location.href =
            "https://gvvieira-hash.github.io/Projeto-CAJIVIS-CODE---JOEL-Barber/home/home.html";

    } catch (erro) {
        console.error("Erro ao realizar login:", erro);

        mensagem.textContent =
            "Não foi possível conectar ao servidor. Verifique se ele está ligado.";
        mensagem.style.color = "#ff6b6b";
    } finally {
        botaoEntrar.textContent = "Entrar";
        botaoEntrar.style.pointerEvents = "";
    }
});
