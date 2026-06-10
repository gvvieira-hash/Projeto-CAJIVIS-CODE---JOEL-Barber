document.addEventListener("DOMContentLoaded", () => {

    const servico =
    localStorage.getItem("servico");

    const barbeiro =
    localStorage.getItem("barbeiro");

    const data =
    localStorage.getItem("data");

    const horario =
    localStorage.getItem("horario");

    const valor =
    localStorage.getItem("valor");

    document.getElementById("servico").innerText =
    servico || "-";

    document.getElementById("barbeiro").innerText =
    barbeiro || "-";

    document.getElementById("data").innerText =
    data || "-";

    document.getElementById("horario").innerText =
    horario || "-";

    document.getElementById("valor").innerText =
    valor || "-";

    document.getElementById("total").innerText =
    valor || "-";

});

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