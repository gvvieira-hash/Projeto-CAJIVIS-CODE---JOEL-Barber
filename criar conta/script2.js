
const API = "https://projeto-cajivis-code-joel-barber-production.up.railway.app/api";

const form = document.getElementById("formCadastro");

const nomeInput = document.getElementById("nome");
const telefoneInput = document.getElementById("telefone");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");
const checkboxTermos = document.getElementById("termos");

const areaCodigo = document.getElementById("areaCodigo");
const codigoInput = document.getElementById("codigoEmail");

const botaoCadastro = document.getElementById("botaoCadastro");
const botaoConfirmar = document.getElementById("botaoConfirmar");

const opcoesTermos = document.getElementById("opcoesTermos");

console.log("SCRIPT2.JS CARREGADO!");

let dadosCadastro = null;

// MOSTRAR E ESCONDER SENHAS
const olhos = document.querySelectorAll(".fa-eye-slash, .fa-eye");

olhos.forEach((olho) => {
    olho.addEventListener("click", (evento) => {
        const icone = evento.currentTarget;
        const inputRelacionado = icone.previousElementSibling;

        if (!inputRelacionado || inputRelacionado.tagName !== "INPUT") {
            return;
        }

        if (inputRelacionado.type === "password") {
            inputRelacionado.type = "text";
            icone.classList.remove("fa-eye-slash");
            icone.classList.add("fa-eye");
        } else {
            inputRelacionado.type = "password";
            icone.classList.remove("fa-eye");
            icone.classList.add("fa-eye-slash");
        }
    });
});

// PRIMEIRA ETAPA: SOLICITAR CÓDIGO
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = nomeInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    if (!nome || !telefone || !email || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    if (senha !== confirmarSenhaInput.value) {
        alert("As senhas não coincidem. Tente novamente!");
        return;
    }

    if (!checkboxTermos.checked) {
        alert("Você precisa concordar com os termos de uso!");
        return;
    }

    dadosCadastro = {
        nome,
        telefone,
        email,
        senha
    };

    botaoCadastro.disabled = true;
    botaoCadastro.textContent = "ENVIANDO...";

    try {
        const resposta = await fetch(`${API}/clientes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosCadastro)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || "Não foi possível enviar o código."
            );
        }

        // ESCONDE OS CAMPOS DO CADASTRO
        document.querySelectorAll("#formCadastro > .input-box").forEach((campo) => {
            campo.hidden = true;
        });

        opcoesTermos.hidden = true;
        botaoCadastro.hidden = true;

        // MOSTRA A CONFIRMAÇÃO
        areaCodigo.hidden = false;

        codigoInput.required = true;
        codigoInput.focus();

        alert(
            resultado.mensagem ||
            "Código enviado! Confira sua caixa de entrada e a pasta de spam."
        );

    } catch (error) {
        console.error("Erro ao solicitar código:", error);
        alert(error.message || "Erro ao enviar o código por e-mail.");

        dadosCadastro = null;

    } finally {
        botaoCadastro.disabled = false;
        botaoCadastro.textContent = "CRIAR CONTA";
    }
});

// ACEITA SOMENTE NÚMEROS NO CÓDIGO
codigoInput.addEventListener("input", () => {
    codigoInput.value = codigoInput.value.replace(/\D/g, "").slice(0, 6);
});

// SEGUNDA ETAPA: CONFIRMAR CÓDIGO
botaoConfirmar.addEventListener("click", async () => {
    const codigo = codigoInput.value.trim();

    if (!dadosCadastro) {
        alert("Solicite novamente o código de confirmação.");
        return;
    }

    if (!/^\d{6}$/.test(codigo)) {
        alert("Digite o código de 6 números enviado para seu e-mail.");
        codigoInput.focus();
        return;
    }

    botaoConfirmar.disabled = true;
    botaoConfirmar.textContent = "CONFIRMANDO...";

    try {
        const resposta = await fetch(`${API}/clientes/confirmar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: dadosCadastro.email,
                codigo
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || "Não foi possível confirmar seu e-mail."
            );
        }

        // LOGIN APENAS DEPOIS DA CONFIRMAÇÃO
        localStorage.setItem("logado", "true");
        localStorage.setItem("emailUsuario", dadosCadastro.email);
        localStorage.setItem("nomeUsuario", dadosCadastro.nome);
        localStorage.setItem("telefoneUsuario", dadosCadastro.telefone);

        alert(
            resultado.mensagem ||
            "E-mail confirmado e cadastro realizado com sucesso!"
        );

        window.location.href = "../home/home.html";

    } catch (error) {
        console.error("Erro ao confirmar código:", error);
        alert(error.message || "Erro ao confirmar o código.");

    } finally {
        botaoConfirmar.disabled = false;
        botaoConfirmar.textContent = "CONFIRMAR E-MAIL";
    }
});
