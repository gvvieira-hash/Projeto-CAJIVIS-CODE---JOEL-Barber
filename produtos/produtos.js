
// ======================================
// CONFIGURAÇÃO DO WHATSAPP
// ======================================

const telefoneJoel = "5571988526369";

// ======================================
// FILTROS DE PRODUTOS
// ======================================

const botoesFiltro = document.querySelectorAll(".filtro");
const cardsProdutos = document.querySelectorAll(".card");

botoesFiltro.forEach(botao => {

    botao.addEventListener("click", () => {

        const categoriaSelecionada = botao.dataset.categoria;

        // Remove a seleção dos outros filtros
        botoesFiltro.forEach(filtro => {
            filtro.classList.remove("ativo");
        });

        // Marca o filtro selecionado
        botao.classList.add("ativo");

        let produtosEncontrados = 0;

        cardsProdutos.forEach(card => {

            const categoriaProduto = card.dataset.categoria;

            if (
                categoriaSelecionada === "todos" ||
                categoriaProduto === categoriaSelecionada
            ) {
                card.style.display = "";
                produtosEncontrados++;
            } else {
                card.style.display = "none";
            }

        });

        // Mensagem caso não existam produtos na categoria
        let mensagemVazia = document.getElementById("mensagem-vazia");

        if (!mensagemVazia) {
            mensagemVazia = document.createElement("p");
            mensagemVazia.id = "mensagem-vazia";
            mensagemVazia.textContent = "Nenhum produto encontrado nesta categoria.";

            mensagemVazia.style.textAlign = "center";
            mensagemVazia.style.color = "#ffffff";
            mensagemVazia.style.padding = "30px";
            
            document.querySelector(".produtos").appendChild(mensagemVazia);
        }

        mensagemVazia.style.display =
            produtosEncontrados === 0 ? "block" : "none";

    });

});

// ======================================
// BOTÕES DE COMPRA - WHATSAPP
// ======================================

const botoesCompra = document.querySelectorAll(".bnt-mais");

botoesCompra.forEach(botao => {

    botao.addEventListener("click", () => {

        const nomeProduto = botao.dataset.produto;
        const precoProduto = botao.dataset.preco;

        const mensagem =
            `Olá, Joel! Vim pelo site da Joel Barber e tenho interesse em comprar o produto ${nomeProduto}, no valor de R$ ${precoProduto}. Gostaria de mais informações sobre a disponibilidade e a compra.`;

        const mensagemFormatada = encodeURIComponent(mensagem);

        const linkWhatsApp =
            `https://wa.me/${telefoneJoel}?text=${mensagemFormatada}`;

        window.open(linkWhatsApp, "_blank");

    });

});
