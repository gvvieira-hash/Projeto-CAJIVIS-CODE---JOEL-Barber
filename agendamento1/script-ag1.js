const cards =
document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("click", () => {

        /* REMOVE SELEÇÃO ANTIGA */

        cards.forEach(c => {
            c.classList.remove("active-card");
        });

        /* ATIVA O CARD */

        card.classList.add("active-card");

        /* PEGA O NOME */

        const servico =
        card.querySelector("h3").innerText;

        /* PEGA O VALOR */

        const valor =
        card.querySelector("p").innerText;

        /* SALVA */

        localStorage.setItem(
            "servico",
            servico
        );

        localStorage.setItem(
            "valor",
            valor
        );

    });

});

const servicoInicial =
document.querySelector(".active-card");

if(servicoInicial){

    localStorage.setItem(
        "servico",
        servicoInicial.querySelector("h3").innerText
    );

    localStorage.setItem(
        "valor",
        servicoInicial.querySelector("p").innerText
    );

}
document.addEventListener("DOMContentLoaded", function() {
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

    const btnLogout = document.getElementById("btn-logout");
    if(btnLogout) {
        btnLogout.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.setItem("logado", "false"); 
            localStorage.removeItem("emailUsuario"); 
            window.location.href = "../home/home.html"; // Manda de volta pra home deslogado
        });
    }
});