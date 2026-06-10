
/* =========================================
   SELEÇÃO DE DATA
========================================= */

const dias =
document.querySelectorAll(".calendar-grid .day");

dias.forEach((dia) => {

    dia.addEventListener("click", () => {

        /* NÃO SELECIONA DIAS APAGADOS */

        if(
            dia.classList.contains("next-prev-month")
        ) return;

        /* REMOVE ANTIGO */

        document
        .querySelector(".active-day")
        ?.classList.remove("active-day");

        /* ATIVA NOVO */

        dia.classList.add("active-day");

        /* PEGAR DIA */

        const numeroDia =
        dia.innerText;

        /* DATA COMPLETA */

        const dataCompleta =
        `${numeroDia}/05/2026`;

        /* SALVAR */

        localStorage.setItem(
            "data",
            dataCompleta
        );

    });

});

/* =========================================
   SELEÇÃO DE HORÁRIO
========================================= */

const horarios =
document.querySelectorAll(".time-slot");

horarios.forEach((horario) => {

    horario.addEventListener("click", () => {

        /* REMOVE ANTIGO */

        document
        .querySelector(".active-time")
        ?.classList.remove("active-time");

        /* ATIVA NOVO */

        horario.classList.add("active-time");

        /* PEGAR HORA */

        const horaSelecionada =
        horario.innerText;

        /* SALVAR */

        localStorage.setItem(
            "horario",
            horaSelecionada
        );

    });

});

/* =========================================
   SALVAR DATA PADRÃO
========================================= */

const dataInicial =
document.querySelector(".active-day");

if(dataInicial){

    const dataPadrao =
    `${dataInicial.innerText}/05/2026`;

    localStorage.setItem(
        "data",
        dataPadrao
    );

}

/* =========================================
   SALVAR HORÁRIO PADRÃO
========================================= */

const horarioInicial =
document.querySelector(".active-time");

if(horarioInicial){

    localStorage.setItem(
        "horario",
        horarioInicial.innerText
    );

}

// NO FINAL
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