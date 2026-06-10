function login(){
    alert("Abrindo tela de login...");
}

function criarConta(){
    alert("Abrindo tela de cadastro...");
}

function agendarAgora(){
    alert("Redirecionando para agendamento...");
}

function verServicos(){

    const servicos = document.getElementById("servicos");

    servicos.scrollIntoView({
        behavior: "smooth"
    });
}

function verHorarios(){

    const data = document.querySelector('input[type="date"]').value;
    const horario = document.querySelector('input[type="time"]').value;

    if(data === "" || horario === ""){
        alert("Selecione uma data e um horário.");
    }

    else{
        alert(
            "Horários disponíveis para " +
            data +
            " às " +
            horario
        );
    }
}

function abrirServicos(){
    alert("Abrindo página de serviços...");
}

function conhecerBarbeiros(){
    alert("Mostrando barbeiros disponíveis...");
}

function verProdutos(){

    const produtos = document.getElementById("produtos");

    produtos.scrollIntoView({
        behavior: "smooth"
    });
}

function irFilaEspera(){

    const fila = document.getElementById("fila");

    fila.scrollIntoView({
        behavior: "smooth"
    });
}

/* EFEITO HEADER AO ROLAR */

window.addEventListener("scroll", function(){

    const header = document.querySelector("header");

    if(window.scrollY > 50){

        header.style.background = "#050505";
        header.style.boxShadow = "0 0 15px rgba(0,0,0,0.5)";
    }

    else{

        header.style.background = "#000";
        header.style.boxShadow = "none";
    }
});

/* BOTÕES DOS CARDS */

const cards = document.querySelectorAll(".card");

cards.forEach(function(card){

    card.addEventListener("mouseenter", function(){

        card.style.border = "1px solid #d4a24c";
    });

    card.addEventListener("mouseleave", function(){

        card.style.border = "1px solid #242424";
    });

});

/* --- LÓGICA DE VERIFICAÇÃO DE LOGIN --- */
document.addEventListener("DOMContentLoaded", function() {
    // Verifica se o login foi feito
    const usuarioLogado = localStorage.getItem("logado") === "true"; 

    const authButtons = document.getElementById("auth-buttons");
    const userProfile = document.getElementById("user-profile");

    if (authButtons && userProfile) {
        if (usuarioLogado) {
            // Se logado: esconde os botões e mostra o perfil (usando flexbox para alinhar)
            authButtons.style.display = "none";
            userProfile.style.display = "flex"; 
        } else {
            // Se não estiver logado: mostra os botões padrão
            authButtons.style.display = "flex"; // ou "block", dependendo do seu CSS original
            userProfile.style.display = "none";
        }
    }

    // Lógica do botão de Sair (Logout)
    const btnLogout = document.getElementById("btn-logout");
    if(btnLogout) {
        btnLogout.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.setItem("logado", "false"); // Remove o login
            window.location.reload(); // Recarrega a página e volta os botões originais
        });
    }
});

/* --- LÓGICA DE VERIFICAÇÃO --- */
document.addEventListener("DOMContentLoaded", function() {
    
    const usuarioLogado = localStorage.getItem("logado") === "true"; 
    // Puxa o e-mail salvo
    const emailSalvo = localStorage.getItem("emailUsuario"); 

    const authButtons = document.getElementById("auth-buttons");
    const userProfile = document.getElementById("user-profile");

    if (authButtons && userProfile) {
        if (usuarioLogado) {
            authButtons.style.display = "none";
            userProfile.style.display = "flex"; 
            
            // Adiciona o e-mail para aparecer ao passar o mouse
            if (emailSalvo) {
                userProfile.title = emailSalvo; 
            }

        } else {
            authButtons.style.display = "flex"; 
            userProfile.style.display = "none";
        }
    }

    const btnLogout = document.getElementById("btn-logout");
    if(btnLogout) {
        btnLogout.addEventListener("click", function(event) {
            event.preventDefault();
            // Limpa os dados ao sair
            localStorage.setItem("logado", "false"); 
            localStorage.removeItem("emailUsuario"); 
            window.location.reload(); 
        });
    }
});