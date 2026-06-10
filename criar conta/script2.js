// SELECIONANDO OS ELEMENTOS
const form = document.querySelector("form");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");
const checkboxTermos = document.querySelector("input[type='checkbox']");

// MOSTRAR / ESCONDER SENHA (Para os dois campos)
// Como agora são dois olhinhos, usamos querySelectorAll para pegar todos
const olhos = document.querySelectorAll(".fa-eye-slash");

olhos.forEach(olho => {
    olho.addEventListener("click", (evento) => {
        // Pega o input que está exatamente antes do ícone de olho no HTML
        const inputRelacionado = evento.target.previousElementSibling;

        if (inputRelacionado.type === "password") {
            inputRelacionado.type = "text";
            evento.target.classList.remove("fa-eye-slash");
            evento.target.classList.add("fa-eye");
        } else {
            inputRelacionado.type = "password";
            evento.target.classList.remove("fa-eye");
            evento.target.classList.add("fa-eye-slash");
        }
    });
});

// LÓGICA DE CADASTRO E REDIRECIONAMENTO
form.addEventListener("submit", function(event) {
    // 1. Impede a página de recarregar (comportamento padrão do form)
    event.preventDefault(); 

    // 2. Validações de segurança
    if (senhaInput.value !== confirmarSenhaInput.value) {
        alert("As senhas não coincidem. Tente novamente!");
        return; // Para a execução do código aqui
    }

    if (!checkboxTermos.checked) {
        alert("Você precisa concordar com os termos de uso!");
        return; // Para a execução do código aqui
    }

    // 3. Se passou pelas validações, salva que está logado
    // (Na vida real, aqui você enviaria os dados para um banco de dados primeiro)
    localStorage.setItem("logado", "true");

    // 4. Redireciona para a página principal (Home)
    window.location.href = "../home/home.html";
});

// --- DENTRO DO script.js (Página de Login) ---
botaoEntrar.addEventListener("click", function(event) {
    if (botaoEntrar.classList.contains("disabled")) {
        event.preventDefault();
        return; 
    }
    event.preventDefault(); 

    // 1. Salva que está logado
    localStorage.setItem("logado", "true");
    
    // 2. SALVA O EMAIL DIGITADO
    localStorage.setItem("emailUsuario", emailInput.value);

    // 3. Redireciona
    window.location.href = "../home/home.html";
});