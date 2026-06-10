// INPUTS
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const botaoEntrar = document.getElementById("btnEntrar");

// OLHO
const olho = document.querySelector(".fa-eye-slash");

// MOSTRAR / ESCONDER SENHA
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

// VALIDAR CAMPOS
function validarCampos() {
    if (
        emailInput.value.trim() !== "" &&
        senhaInput.value.trim() !== ""
    ) {
        botaoEntrar.classList.remove("disabled");
    } else {
        botaoEntrar.classList.add("disabled");
    }
}

// EVENTOS
emailInput.addEventListener("input", validarCampos);
senhaInput.addEventListener("input", validarCampos);

// COMEÇA DESABILITADO
validarCampos();

// --- NOVA LÓGICA DE LOGIN (SALVAR E REDIRECIONAR) ---
botaoEntrar.addEventListener("click", function(event) {
    // 1. Se o botão estiver desabilitado (campos vazios), impede de clicar
    if (botaoEntrar.classList.contains("disabled")) {
        event.preventDefault();
        return; 
    }

    // 2. Impede o link <a> de redirecionar imediatamente
    event.preventDefault(); 

    // 3. Salva no navegador que o usuário está LOGADO
    localStorage.setItem("logado", "true");

    // 4. Agora sim, redireciona para a página principal (Home)
    // Usamos o mesmo caminho que estava no href do seu HTML
    window.location.href = "home/home.html";
});

/*
// --- DENTRO DO script2.js (Página de Criar Conta) ---
form.addEventListener("submit", function(event) {
    event.preventDefault(); 

    if (senhaInput.value !== confirmarSenhaInput.value) {
        alert("As senhas não coincidem. Tente novamente!");
        return; 
    }

    if (!checkboxTermos.checked) {
        alert("Você precisa concordar com os termos de uso!");
        return; 
    }

    const emailInputReg = document.querySelector("input[type='email']");

    localStorage.setItem("logado", "true");
    localStorage.setItem("emailUsuario", emailInputReg.value);

    window.location.href = "../home/home.html";
});
*/

