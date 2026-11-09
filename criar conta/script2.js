
const form = document.querySelector("form");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");
const checkboxTermos = document.querySelector("input[type='checkbox']");

console.log("SCRIPT2.JS FOI CARREGADO!");

if (!form) {
  console.error("Formulário de cadastro não encontrado.");
} else {
  // Mostrar e esconder as senhas
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nomeInput = form.querySelector('input[placeholder="Usuário"]');
    const telefoneInput = form.querySelector('input[placeholder="Telefone"]');
    const emailInput = form.querySelector('input[placeholder="E-mail"]');

    if (
      !nomeInput ||
      !telefoneInput ||
      !emailInput ||
      !senhaInput ||
      !confirmarSenhaInput ||
      !checkboxTermos
    ) {
      alert("Não foi possível localizar todos os campos do cadastro.");
      console.error("Confira os IDs e placeholders dos campos no HTML.");
      return;
    }

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

    const botaoEnviar = form.querySelector(
      'button[type="submit"], input[type="submit"], button:not([type])'
    );

    if (botaoEnviar) {
      botaoEnviar.disabled = true;
    }

    try {
      console.log("Enviando cadastro para o servidor...");

      const resposta = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome,
          telefone,
          email,
          senha
        })
      });

      const resultado = await resposta.json();

      console.log("Resposta do cadastro:", resposta.status, resultado);

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível realizar o cadastro."
        );
      }

      localStorage.setItem("logado", "true");
      localStorage.setItem("emailUsuario", email);
      localStorage.setItem("nomeUsuario", nome);
      localStorage.setItem("telefoneUsuario", telefone);

      alert("Cadastro realizado com sucesso!");

      window.location.href = "../home/home.html";
    } catch (error) {
      console.error("Erro no cadastro:", error);

      alert(
        error.message ||
        "Não foi possível conectar ao servidor. Confira se o Node.js está rodando."
      );
    } finally {
      if (botaoEnviar) {
        botaoEnviar.disabled = false;
      }
    }
  });
}
console.log("TESTE NOVO SCRIPT2 - CADASTRO");