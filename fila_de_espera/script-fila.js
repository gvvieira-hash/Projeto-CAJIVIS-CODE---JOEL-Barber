
function sairDaFila() {

    const confirmar = confirm("Tem certeza que deseja sair da fila?");

    if(confirmar){

        const filaContainer = document.querySelector(".fila-container");

        // ANIMAÇÃO DE SAÍDA
        filaContainer.style.transition = "0.5s ease";
        filaContainer.style.opacity = "0";
        filaContainer.style.transform = "translateY(-25px)";

        setTimeout(() => {

            // TROCA O CONTEÚDO
            filaContainer.innerHTML = `

                <div class="sem-fila">

                    <div class="icone-fila">
                        ⚠
                    </div>

                    <h2>Você não está em nenhuma fila</h2>

                    <p>
                        Entre novamente para garantir seu atendimento.
                    </p>

                    <a href="../agendamento1/index-ag1.html">
                        Entrar na fila
                    </a>

                </div>

            `;

            // ANIMAÇÃO DE ENTRADA
            filaContainer.style.opacity = "1";
            filaContainer.style.transform = "translateY(0px)";

        }, 500);

    }

}

// 4. Quando a página carregar, verifica se o usuário já havia saído anteriormente
window.onload = function() {
    if (localStorage.getItem("estaNaFila") === "false") {
        const layoutGeral = document.getElementById("layout-fila");
        if (layoutGeral) {
            // Força o layout a ficar em modo bloco centralizado limpo na recarga
            layoutGeral.style.display = "flex";
            layoutGeral.style.justifyContent = "center";
            layoutGeral.style.alignItems = "center";
            layoutGeral.style.flexDirection = "column";
            layoutGeral.style.minHeight = "450px";
            layoutGeral.style.width = "100%";

            layoutGeral.innerHTML = `
                <div style="text-align: center; max-width: 500px; width: 100%; padding: 25px 20px; background-color: #0d0d0d; border: 1px solid #1f1f1f; border-radius: 16px; margin: -60 auto; transform: translateY(-40px) translateX(180px);">
    
    <h2 style="color: #fff; font-size: 30px; line-height: 1.2; margin-bottom: 18px; font-weight: 700;">
        Você não está em nenhuma fila ativa.
    </h2>

    <p style="color: #777; margin-bottom: 15px; font-size: 16px; line-height: 1.6;">
        Para garantir a sua vaga na nossa lista de espera diária, clique abaixo.
    </p>

    <a href="../agendamento1/index-ag1.html" style="background-color: #d4a24c; color: black; width: 190px; height: 55px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s;">
        Entrar na Fila
    </a>

</div>
            `;
        }
    }
}

let notaSelecionada = 0;

function avaliar(nota){

    notaSelecionada = nota;

    const estrelas = document.querySelectorAll(".estrelas-avaliacao span");

    estrelas.forEach((estrela) => {

        estrela.classList.remove("ativa");

    });

    // ACENDE EM ORDEM CRESCENTE
    for(let i = 0; i < nota; i++){

        setTimeout(() => {

            estrelas[i].classList.add("ativa");

        }, i * 150);

    }

}

/* =========================
ENVIAR AVALIAÇÃO
========================= */

const botaoEnviar = document.querySelector(".btn-enviar-avaliacao");

botaoEnviar.addEventListener("click", () => {

    const comentario = document.querySelector(".card-avaliacao textarea").value;

    if(notaSelecionada === 0){

        alert("Escolha uma nota antes.");
        return;
    }

    alert("Avaliação enviada com sucesso ⭐");

    console.log({

        nota: notaSelecionada,
        comentario: comentario

    });

});

let posicao = 4;

const numeroFila = document.getElementById("numeroFila");
const pessoasFrente = document.getElementById("pessoasFrente");
const tempoEstimado = document.getElementById("tempoEstimado");
const barraProgresso = document.getElementById("barraProgresso");
const statusTitulo = document.getElementById("statusTitulo");
const statusDescricao = document.getElementById("statusDescricao");

/* =========================================
ATUALIZA INTERFACE
========================================= */

function atualizarFila(){

    numeroFila.innerText = "#" + posicao;

    pessoasFrente.innerText =
        (posicao - 1) + " pessoas";

    tempoEstimado.innerText =
        (posicao * 7) + " min";

    // BARRA
    const progresso = ((5 - posicao) / 4) * 100;

    barraProgresso.style.width = progresso + "%";

    // ANIMAÇÃO
    numeroFila.classList.add("atualizando");

    setTimeout(() => {

        numeroFila.classList.remove("atualizando");

    },500);

    /* CHEGOU SUA VEZ */

    if(posicao === 1){

        statusTitulo.innerText =
            "Sua vez chegou!";

        statusDescricao.innerText =
            "Dirija-se ao barbeiro.";

        tempoEstimado.innerText = "Agora";

    }

    /* FINALIZOU */

    if(posicao <= 0){

        document.querySelector(".fila-container")
        .innerHTML = `

            <div class="sem-fila">

                <div class="icone-fila">
                    ✓
                </div>

                <h2>Atendimento iniciado</h2>

                <p>
                    Seu atendimento começou.
                </p>

            </div>

        `;

        clearInterval(simulacao);

    }

}

/* =========================================
SIMULAÇÃO REAL
========================================= */

const simulacao = setInterval(() => {

    posicao--;

    atualizarFila();

}, 7000);

/* INICIAL */

atualizarFila();

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
