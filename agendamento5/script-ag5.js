document.addEventListener("DOMContentLoaded", function() {
    
    /* =========================================
       1. INSERIR DADOS DO AGENDAMENTO NA TELA
    ========================================= */
    const servico = localStorage.getItem("servico");
    const barbeiro = localStorage.getItem("barbeiro");
    const data = localStorage.getItem("data");
    const horario = localStorage.getItem("horario");

    // Verifica se os elementos existem antes de inserir, para evitar erros
    const servicoEl = document.getElementById("servico-escolhido");
    if(servicoEl) servicoEl.textContent = servico || "Não informado";

    const barbeiroEl = document.getElementById("barbeiro-escolhido");
    if(barbeiroEl) barbeiroEl.textContent = barbeiro || "Não informado";

    const dataEl = document.getElementById("data-escolhida");
    if(dataEl) dataEl.textContent = data || "Não informado";

    const horarioEl = document.getElementById("horario-escolhido");
    if(horarioEl) horarioEl.textContent = horario || "Não informado";


    /* =========================================
       2. LÓGICA DE AUTENTICAÇÃO (MOSTRAR/OCULTAR PERFIL)
    ========================================= */
    const usuarioLogado = localStorage.getItem("logado") === "true"; 
    const emailSalvo = localStorage.getItem("emailUsuario"); 

    const authButtons = document.getElementById("auth-buttons");
    const userProfile = document.getElementById("user-profile");

    if (authButtons && userProfile) {
        if (usuarioLogado) {
            authButtons.style.display = "none";
            userProfile.style.display = "flex"; 
            if (emailSalvo) userProfile.title = emailSalvo; 
        } else {
            authButtons.style.display = "flex"; 
            userProfile.style.display = "none";
        }
    }


    /* =========================================
       3. LÓGICA DE LOGOUT
    ========================================= */
    const btnLogout = document.getElementById("btn-logout");
    if(btnLogout) {
        btnLogout.addEventListener("click", function(event) {
            event.preventDefault();
            // Removendo os itens do localStorage de forma segura
            localStorage.removeItem("logado"); 
            localStorage.removeItem("emailUsuario"); 
            
            // Manda de volta pra home deslogado
            window.location.href = "../home/home.html"; 
        });
    }
});