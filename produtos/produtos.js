const API_URL = "https://projeto-cajivis-code-joel-barber-production.up.railway.app";
const telefoneJoel = "5571988526369";
const listaProdutos = document.getElementById("lista-produtos");
const botoesFiltro = document.querySelectorAll(".filtro");
let produtos = [];
let categoriaAtual = "todos";

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function renderizarProdutos() {
    const encontrados = produtos.filter(p => categoriaAtual === "todos" || p.categoria === categoriaAtual);
    if (!encontrados.length) {
        listaProdutos.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#cfcfcf;padding:30px;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }
    listaProdutos.innerHTML = encontrados.map(p => `
        <article class="card" data-categoria="${escaparHTML(p.categoria)}">
            <img class="pi" src="${escaparHTML(p.imagem_url || "")}" alt="${escaparHTML(p.nome)}" onerror="this.style.display='none'">
            <h3>${escaparHTML(p.nome)}</h3>
            <p>${escaparHTML(p.descricao || "")}</p>
            <div class="card-footer">
                <span>${Number(p.preco).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</span>
                <button type="button" class="bnt-mais" data-id="${Number(p.id)}" aria-label="Comprar ${escaparHTML(p.nome)}">
                    <img src="icons8-soma-64.png" alt="">
                </button>
            </div>
        </article>`).join("");
}
botoesFiltro.forEach(botao => botao.addEventListener("click", () => {
    botoesFiltro.forEach(b => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    categoriaAtual = botao.dataset.categoria;
    renderizarProdutos();
}));
listaProdutos.addEventListener("click", event => {
    const botao = event.target.closest(".bnt-mais");
    if (!botao) return;
    const produto = produtos.find(p => p.id === Number(botao.dataset.id));
    if (!produto) return;
    const mensagem = `Olá, Joel! Vim pelo site da Joel Barber e tenho interesse em comprar o produto ${produto.nome}, no valor de ${Number(produto.preco).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}. Gostaria de mais informações sobre a disponibilidade e a compra.`;
    window.open(`https://wa.me/${telefoneJoel}?text=${encodeURIComponent(mensagem)}`, "_blank");
});
async function carregarProdutos() {
    try {
        const resposta = await fetch(`${API_URL}/api/produtos`);
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro || "Erro ao carregar produtos.");
        produtos = Array.isArray(dados) ? dados : [];
        renderizarProdutos();
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        listaProdutos.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#ff7777;padding:30px;">Não foi possível carregar os produtos. Verifique se o servidor Joel Barber está ligado.</p>';
    }
}
carregarProdutos();
