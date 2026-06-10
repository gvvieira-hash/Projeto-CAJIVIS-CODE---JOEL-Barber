const barbeiros =
document.querySelectorAll(".barber-card");

barbeiros.forEach(barber => {

    barber.addEventListener("click", () => {

        /* REMOVE ANTIGO */

        barbeiros.forEach(b => {
            b.classList.remove("selected");
        });

        /* ATIVA */

        barber.classList.add("selected");

        /* PEGA O NOME */

        const nome =
        barber.querySelector("h3").innerText;

        /* SALVA */

        localStorage.setItem(
            "barbeiro",
            nome
        );

    });

});
const barbeiroInicial =
document.querySelector(".barber-card.selected");

if(barbeiroInicial){

    localStorage.setItem(
        "barbeiro",
        barbeiroInicial.querySelector("h3").innerText
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