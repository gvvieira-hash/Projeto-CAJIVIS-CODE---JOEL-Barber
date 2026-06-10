// Conteúdo do seu arquivo auth.js
document.addEventListener("DOMContentLoaded", function() {
    // Puxa os dados do navegador
    const usuarioLogado = localStorage.getItem("logado") === "true"; 
    const emailSalvo = localStorage.getItem("emailUsuario"); 

    // Seleciona os elementos na página atual
    const authButtons = document.getElementById("auth-buttons");
    const userProfile = document.getElementById("user-profile");

    // Só executa se os elementos existirem na página
    if (authButtons && userProfile) {
        if (usuarioLogado) {
            authButtons.style.display = "none";
            userProfile.style.display = "flex"; 
            
            // Adiciona o e-mail no hover
            if (emailSalvo) {
                userProfile.title = emailSalvo; 
            }
        } else {
            authButtons.style.display = "flex"; 
            userProfile.style.display = "none";
        }
    }

    // Configura o botão de Sair
    const btnLogout = document.getElementById("btn-logout");
    if(btnLogout) {
        btnLogout.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.setItem("logado", "false"); 
            localStorage.removeItem("emailUsuario"); 
            
            // Em vez de recarregar a página, manda o usuário deslogado direto para a Home
            window.location.href = "../home/home.html"; 
        });
    }
});