
const API_URL = "https://projeto-cajivis-code-joel-barber-production.up.railway.app";

const tokenAdmin = localStorage.getItem("tokenAdmin");

const authHeaders = {
    "Authorization": `Bearer ${tokenAdmin}`
};

const $ = id => document.getElementById(id);

const escaparHTML = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[c]));

const dinheiro = v => Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
});

const dataBR = v => v
    ? new Date(String(v).slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR")
    : "—";

if (!tokenAdmin) {
    location.href = "login-admin.html";
}

// ========================================
// API
// ========================================

async function api(url, options = {}) {
    const response = await fetch(API_URL + url, {
        ...options,
        headers: {
            ...authHeaders,
            ...(options.headers || {}),
            ...(options.body ? { "Content-Type": "application/json" } : {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("tokenAdmin");
        localStorage.removeItem("emailAdmin");

        location.href = "login-admin.html";

        throw new Error("Sessão administrativa expirada.");
    }

    if (!response.ok) {
        throw new Error(
            data.erro || data.mensagem || "Não foi possível concluir a operação."
        );
    }

    return data;
}

function mensagem(id, texto, erro = false) {
    const el = $(id);

    if (el) {
        el.textContent = texto;
        el.style.color = erro ? "#ff7777" : "#65d68a";
    }
}

// ========================================
// NAVEGAÇÃO
// ========================================

const paginas = {
    agendamentos: [
        "Agendamentos",
        "Acompanhe os horários de todos os barbeiros."
    ],

    barbeiros: [
        "Barbeiros",
        "Consulte a equipe cadastrada na barbearia."
    ],

    clientes: [
        "Clientes",
        "Consulte os clientes cadastrados no site."
    ],

    produtos: [
        "Produtos",
        "Gerencie os produtos exibidos na loja dos clientes."
    ],

    relatorios: [
        "Relatórios",
        "Analise o movimento e o desempenho da barbearia."
    ]
};

function abrirPagina(nome) {
    if (!paginas[nome]) nome = "agendamentos";

    document.querySelectorAll(".admin-page").forEach(p => {
        p.classList.toggle("active", p.id === `pagina-${nome}`);
    });

    document.querySelectorAll(".admin-nav a").forEach(a => {
        a.classList.toggle("active", a.dataset.page === nome);
    });

    $("tituloPagina").textContent = paginas[nome][0];
    $("subtituloPagina").textContent = paginas[nome][1];

    if (nome === "agendamentos") carregarAgendamentos();
    if (nome === "clientes") carregarClientes();
    if (nome === "barbeiros") carregarBarbeiros();
    if (nome === "produtos") carregarProdutos();
    if (nome === "relatorios") carregarRelatorios();
}

document.querySelectorAll(".admin-nav a").forEach(a => {
    a.addEventListener("click", e => {
        e.preventDefault();

        abrirPagina(a.dataset.page);

        history.replaceState(null, "", `#${a.dataset.page}`);
    });
});

const paginaInicial = location.hash.replace("#", "");

abrirPagina(paginas[paginaInicial] ? paginaInicial : "agendamentos");

$("btnSair").addEventListener("click", () => {
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("emailAdmin");

    location.href = "login-admin.html";
});

// ========================================
// AGENDAMENTOS
// ========================================

let agendamentos = [];

function statusNormal(s) {
    s = String(s || "").toLowerCase();

    return ["confirmado", "agendado"].includes(s)
        ? "agendado"
        : s === "concluído"
            ? "concluido"
            : s;
}

function filtrarAgendamentos() {
    const termo = $("pesquisa").value.toLowerCase().trim();
    const barbeiro = $("filtroBarbeiro").value;
    const data = $("filtroData").value;
    const status = $("filtroStatus").value;

    return agendamentos.filter(a =>
        [a.cliente, a.servico, a.barbeiro, a.telefone, a.email]
            .join(" ")
            .toLowerCase()
            .includes(termo) &&
        (!barbeiro || a.barbeiro === barbeiro) &&
        (!data || String(a.data_agendamento).slice(0, 10) === data) &&
        (!status || statusNormal(a.status) === status)
    );
}

function renderAgendamentos() {
    const rows = filtrarAgendamentos();

    $("totalAgendamentos").textContent = agendamentos.length;

    $("totalAgendados").textContent = agendamentos.filter(
        a => statusNormal(a.status) === "agendado"
    ).length;

    $("totalConcluidos").textContent = agendamentos.filter(
        a => statusNormal(a.status) === "concluido"
    ).length;

    $("totalCancelados").textContent = agendamentos.filter(
        a => statusNormal(a.status) === "cancelado"
    ).length;

    $("contador").textContent =
        `${rows.length} de ${agendamentos.length} agendamento(s)`;

    $("listaAgendamentos").innerHTML = rows.length
        ? rows.map(a => {
            const st = statusNormal(a.status);

            const nome = {
                agendado: "Agendado",
                concluido: "Concluído",
                cancelado: "Cancelado"
            }[st] || st;

            const actions = st === "agendado"
                ? `<div class="acoes-agendamento">
                    <button class="btn-concluir" data-id="${Number(a.id)}">✓ Concluir</button>
                    <button class="btn-cancelar" data-id="${Number(a.id)}">× Cancelar</button>
                  </div>`
                : "";

            return `<tr>
                <td>
                    <strong>${escaparHTML(a.cliente)}</strong>
                    <small>${escaparHTML(a.telefone)}</small>
                </td>
                <td>${escaparHTML(a.servico)}</td>
                <td>${escaparHTML(a.barbeiro)}</td>
                <td>${dataBR(a.data_agendamento)}</td>
                <td>${escaparHTML(String(a.hora_agendamento || "").slice(0, 5))}</td>
                <td>
                    <span class="status status-${st}">${nome}</span>
                    ${actions}
                </td>
            </tr>`;
        }).join("")
        : `<tr><td colspan="6" class="empty">Nenhum agendamento encontrado.</td></tr>`;
}

async function carregarAgendamentos() {
    if (!$("listaAgendamentos")) return;

    $("btnAtualizar").disabled = true;
    mensagem("mensagem", "Carregando agendamentos...");

    try {
        agendamentos = await api("/api/admin/agendamentos");

        const nomes = [...new Set(
            agendamentos.map(a => a.barbeiro).filter(Boolean)
        )].sort();

        const atual = $("filtroBarbeiro").value;

        $("filtroBarbeiro").innerHTML =
            '<option value="">Todos os barbeiros</option>' +
            nomes.map(n => `<option>${escaparHTML(n)}</option>`).join("");

        $("filtroBarbeiro").value = nomes.includes(atual) ? atual : "";

        renderAgendamentos();

        mensagem(
            "mensagem",
            `${agendamentos.length} agendamento(s) carregado(s).`
        );

    } catch (e) {
        mensagem("mensagem", e.message, true);

    } finally {
        $("btnAtualizar").disabled = false;
    }
}

["pesquisa", "filtroBarbeiro", "filtroData", "filtroStatus"].forEach(id => {
    $(id).addEventListener(
        id === "pesquisa" ? "input" : "change",
        renderAgendamentos
    );
});

$("btnAtualizar").addEventListener("click", carregarAgendamentos);

$("listaAgendamentos").addEventListener("click", async e => {
    const b = e.target.closest(".btn-concluir,.btn-cancelar");

    if (!b) return;

    const acao = b.classList.contains("btn-concluir")
        ? "concluir"
        : "cancelar";

    if (!confirm(
        acao === "concluir"
            ? "Marcar este agendamento como concluído?"
            : "Cancelar este agendamento?"
    )) return;

    b.disabled = true;

    try {
        const d = await api(
            `/api/admin/agendamentos/${Number(b.dataset.id)}/${acao}`,
            { method: "PATCH" }
        );

        mensagem("mensagem", d.mensagem || "Agendamento atualizado.");

        await carregarAgendamentos();

    } catch (err) {
        mensagem("mensagem", err.message, true);
        b.disabled = false;
    }
});

// ========================================
// CLIENTES
// ========================================

let clientes = [];

function renderClientes() {
    const termo = $("pesquisaClientes").value.toLowerCase().trim();

    const filtrados = clientes.filter(c =>
        [c.nome, c.telefone, c.email]
            .join(" ")
            .toLowerCase()
            .includes(termo)
    );

    $("listaClientes").innerHTML = filtrados.length
        ? filtrados.map(c => `<tr>
            <td><strong>${escaparHTML(c.nome)}</strong></td>
            <td>${escaparHTML(c.telefone)}</td>
            <td>${escaparHTML(c.email)}</td>
            <td>${dataBR(c.criado_em)}</td>
          </tr>`).join("")
        : '<tr><td colspan="4" class="empty">Nenhum cliente encontrado.</td></tr>';

    $("contadorClientes").textContent =
        `${filtrados.length} de ${clientes.length} cliente(s)`;
}

async function carregarClientes() {
    try {
        mensagem("mensagemClientes", "Carregando clientes...");

        clientes = await api("/api/admin/clientes");

        renderClientes();

        mensagem(
            "mensagemClientes",
            `${clientes.length} cliente(s) carregado(s).`
        );

    } catch (e) {
        mensagem("mensagemClientes", e.message, true);
    }
}

$("pesquisaClientes").addEventListener("input", renderClientes);

$("btnAtualizarClientes").addEventListener("click", carregarClientes);

// ========================================
// BARBEIROS
// ========================================


async function carregarBarbeiros() {
    try {
        mensagem("mensagemBarbeiros", "Carregando barbeiros...");

        const lista = await api("/api/admin/barbeiros");

        $("listaBarbeiros").innerHTML = lista.length
            ? lista.map(b => `
                <article class="person-card">
                    <div class="person-avatar">
                        ${escaparHTML((b.nome || "B").trim().slice(0, 1).toUpperCase())}
                    </div>

                    <div>
                        <h3>${escaparHTML(b.nome)}</h3>
                        <p>
                            ${Number(b.ativo) === 1
                                ? "Disponível para agendamentos"
                                : "Indisponível para agendamentos"}
                        </p>

                        <button
                            type="button"
                            class="btn-primary"
                            data-alterar-status="${b.id}"
                            data-ativo="${Number(b.ativo)}"
                            style="margin-top:10px;">
                            ${Number(b.ativo) === 1
                                ? "Desativar barbeiro"
                                : "Ativar barbeiro"}
                        </button>
                    </div>
                </article>
            `).join("")
            : '<p class="empty">Nenhum barbeiro cadastrado.</p>';

        mensagem(
            "mensagemBarbeiros",
            `${lista.length} barbeiro(s) encontrado(s).`
        );

    } catch (e) {
        mensagem("mensagemBarbeiros", e.message, true);
    }
}

$("btnAtualizarBarbeiros").addEventListener("click", carregarBarbeiros);
$("listaBarbeiros").addEventListener("click", async (e) => {
    const botao = e.target.closest("[data-alterar-status]");

    if (!botao) return;

    const id = botao.dataset.alterarStatus;

    botao.disabled = true;

    try {
        const resposta = await api(
            `/api/admin/barbeiros/${id}/status`,
            { method: "PATCH" }
        );

        mensagem("mensagemBarbeiros", resposta.mensagem);

        await carregarBarbeiros();

    } catch (erro) {
        mensagem("mensagemBarbeiros", erro.message, true);
        botao.disabled = false;
    }
});


// ========================================
// CADASTRAR BARBEIRO
// ========================================


const formularioBarbeiro = $("formNovoBarbeiro");

const fotoInput = $("fotoBarbeiro");
const previewFoto = $("previewFotoBarbeiro");

// Prévia da foto selecionada
fotoInput.addEventListener("change", () => {
    const arquivo = fotoInput.files[0];

    if (!arquivo) {
        previewFoto.style.display = "none";
        return;
    }

    if (arquivo.size > 7 * 1024 * 1024) {
        $("erroBarbeiro").textContent =
            "A imagem deve ter no máximo 7 MB.";

        fotoInput.value = "";
        previewFoto.style.display = "none";
        return;
    }

    previewFoto.src = URL.createObjectURL(arquivo);
    previewFoto.style.display = "block";

    $("erroBarbeiro").textContent = "";
});

$("btnNovoBarbeiro").addEventListener("click", () => {
    formularioBarbeiro.style.display = "block";
    $("nomeBarbeiro").focus();
});

$("cancelarBarbeiro").addEventListener("click", () => {
    formularioBarbeiro.style.display = "none";
    $("cadastroBarbeiro").reset();
    $("erroBarbeiro").textContent = "";
    previewFoto.style.display = "none";
});

$("cadastroBarbeiro").addEventListener("submit", async e => {
    e.preventDefault();

    const nome = $("nomeBarbeiro").value.trim();
    const arquivo = fotoInput.files[0];
    const botao = $("salvarBarbeiro");

    if (!nome) {
        $("erroBarbeiro").textContent = "Informe o nome do barbeiro.";
        return;
    }

    if (!arquivo) {
        $("erroBarbeiro").textContent = "Selecione uma foto.";
        return;
    }

    if (arquivo.size > 7 * 1024 * 1024) {
        $("erroBarbeiro").textContent =
            "A imagem deve ter no máximo 7 MB.";
        return;
    }

    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {
        const foto = await new Promise((resolve, reject) => {
            const leitor = new FileReader();

            leitor.onload = () => resolve(leitor.result);
            leitor.onerror = () => reject(
                new Error("Não foi possível ler a imagem.")
            );

            leitor.readAsDataURL(arquivo);
        });

        const resposta = await api("/api/admin/barbeiros", {
            method: "POST",
            body: JSON.stringify({ nome, foto })
        });

        $("cadastroBarbeiro").reset();
        formularioBarbeiro.style.display = "none";
        previewFoto.style.display = "none";

        mensagem("mensagemBarbeiros", resposta.mensagem);

        await carregarBarbeiros();

    } catch (erro) {
        $("erroBarbeiro").textContent = erro.message;

    } finally {
        botao.disabled = false;
        botao.textContent = "Salvar barbeiro";
    }
});

// ========================================
// PRODUTOS
// ========================================

let produtos = [];

const modal = $("modalProduto");

function abrirModal(p = null) {
    $("formProduto").reset();

    $("produtoId").value = p?.id || "";

    $("tituloModalProduto").textContent = p
        ? "Editar produto"
        : "Novo produto";

    $("produtoNome").value = p?.nome || "";
    $("produtoDescricao").value = p?.descricao || "";
    $("produtoPreco").value = p?.preco ?? "";

    $("produtoCategoria").value = p?.categoria || "cabelo";
    $("produtoImagem").value = p?.imagem_url || "";
    $("produtoAtivo").checked = p
        ? Number(p.ativo) === 1
        : true;

    $("erroProduto").textContent = "";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}

function fecharModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

$("btnNovoProduto").addEventListener("click", () => abrirModal());

$("fecharModalProduto").addEventListener("click", fecharModal);
$("cancelarModalProduto").addEventListener("click", fecharModal);

modal.addEventListener("click", e => {
    if (e.target === modal) fecharModal();
});

function renderProdutos() {
    const termo = $("pesquisaProdutos").value.toLowerCase().trim();

    const lista = produtos.filter(p =>
        [p.nome, p.descricao, p.categoria]
            .join(" ")
            .toLowerCase()
            .includes(termo)
    );

    $("listaProdutosAdmin").innerHTML = lista.length
        ? lista.map(p => `
            <article class="product-admin-card">
                <img
                    src="${escaparHTML(p.imagem_url || "")}"
                    alt=""
                    onerror="this.style.display='none'"
                >

                <div class="product-admin-info">
                    <h3>${escaparHTML(p.nome)}</h3>

                    <p>
                        ${escaparHTML(p.descricao || "Sem descrição")}
                        · ${escaparHTML(p.categoria)}
                    </p>

                    <strong>${dinheiro(p.preco)}</strong>

                    <small class="${Number(p.ativo) === 1 ? "product-on" : "product-off"}">
                        ${Number(p.ativo) === 1
                            ? "Visível na loja"
                            : "Oculto na loja"}
                    </small>

                    <div class="product-actions">
                        <button class="btn-secondary" data-edit="${p.id}">
                            Editar
                        </button>

                        <button class="btn-danger" data-delete="${p.id}">
                            Excluir
                        </button>
                    </div>
                </div>
            </article>
        `).join("")
        : '<p class="empty">Nenhum produto cadastrado.</p>';
}

async function carregarProdutos() {
    try {
        mensagem("mensagemProdutos", "Carregando produtos...");

        produtos = await api("/api/admin/produtos");

        renderProdutos();

        mensagem(
            "mensagemProdutos",
            `${produtos.length} produto(s) cadastrado(s).`
        );

    } catch (e) {
        mensagem("mensagemProdutos", e.message, true);
    }
}

$("pesquisaProdutos").addEventListener("input", renderProdutos);

$("listaProdutosAdmin").addEventListener("click", async e => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-delete]");

    if (edit) {
        const p = produtos.find(x => x.id === Number(edit.dataset.edit));

        if (p) abrirModal(p);
    }

    if (del) {
        const p = produtos.find(x => x.id === Number(del.dataset.delete));

        if (!p || !confirm(`Excluir "${p.nome}"?`)) return;

        try {
            await api(`/api/admin/produtos/${p.id}`, {
                method: "DELETE"
            });

            mensagem("mensagemProdutos", "Produto excluído.");

            await carregarProdutos();

        } catch (err) {
            mensagem("mensagemProdutos", err.message, true);
        }
    }
});

$("formProduto").addEventListener("submit", async e => {
    e.preventDefault();

    const id = $("produtoId").value;

    const payload = {
        nome: $("produtoNome").value.trim(),
        descricao: $("produtoDescricao").value.trim(),
        preco: Number($("produtoPreco").value),
        categoria: $("produtoCategoria").value,
        imagem_url: $("produtoImagem").value.trim(),
        ativo: $("produtoAtivo").checked ? 1 : 0
    };

    const btn = $("salvarProduto");

    btn.disabled = true;
    btn.textContent = "Salvando...";

    try {
        await api(
            id ? `/api/admin/produtos/${id}` : "/api/admin/produtos",
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(payload)
            }
        );

        fecharModal();

        mensagem(
            "mensagemProdutos",
            id
                ? "Produto atualizado com sucesso."
                : "Produto cadastrado com sucesso."
        );

        await carregarProdutos();

    } catch (err) {
        $("erroProduto").textContent = err.message;

    } finally {
        btn.disabled = false;
        btn.textContent = "Salvar produto";
    }
});
// ========================================
// RELATÓRIOS
// ========================================

function obterDataLocal(valor) {
    if (!valor) return null;

    const partes = String(valor).slice(0, 10).split("-");

    if (partes.length !== 3) return null;

    const [ano, mes, dia] = partes.map(Number);

    const data = new Date(ano, mes - 1, dia);

    return Number.isNaN(data.getTime()) ? null : data;
}

function renderRelatorios() {
    const periodo = $("filtroPeriodoRelatorios").value;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let lista = [...agendamentos];

    if (periodo !== "todos") {
        const dias = Number(periodo);
        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - (dias - 1));

        lista = lista.filter(a => {
            const data = obterDataLocal(a.data_agendamento);

            return data && data >= inicio && data <= hoje;
        });
    }

    const concluidos = lista.filter(
        a => statusNormal(a.status) === "concluido"
    );

    const cancelados = lista.filter(
        a => statusNormal(a.status) === "cancelado"
    );

    const pendentes = lista.filter(
        a => statusNormal(a.status) === "agendado"
    );

    $("relTotal").textContent = lista.length;
    $("relConcluidos").textContent = concluidos.length;
    $("relCancelados").textContent = cancelados.length;
    $("relPendentes").textContent = pendentes.length;

    // Dias da semana
    const diasSemana = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado"
    ];

    const contagemDias = Array(7).fill(0);

    lista.forEach(a => {
        const data = obterDataLocal(a.data_agendamento);

        if (data) {
            contagemDias[data.getDay()]++;
        }
    });

    const maiorDia = Math.max(...contagemDias, 1);

    $("relDias").innerHTML = diasSemana.map((dia, i) => `
        <div class="report-row">
            <span>${dia}</span>
            <div class="report-track">
                <div class="report-fill"
                    style="width:${contagemDias[i] / maiorDia * 100}%">
                </div>
            </div>
            <strong>${contagemDias[i]}</strong>
        </div>
    `).join("");

    // Horários de pico
    const contagemHorarios = {};

    lista.forEach(a => {
        const hora = String(a.hora_agendamento || "").slice(0, 5);

        if (hora) {
            contagemHorarios[hora] =
                (contagemHorarios[hora] || 0) + 1;
        }
    });

    const horarios = Object.entries(contagemHorarios)
        .sort((a, b) => b[1] - a[1]);

    const maiorHorario = Math.max(
        ...horarios.map(h => h[1]),
        1
    );

    $("relHorarios").innerHTML = horarios.length
        ? horarios.map(([hora, total]) => `
            <div class="report-row">
                <span>${hora}</span>
                <div class="report-track">
                    <div class="report-fill"
                        style="width:${total / maiorHorario * 100}%">
                    </div>
                </div>
                <strong>${total}</strong>
            </div>
        `).join("")
        : '<p class="empty">Nenhum horário encontrado.</p>';

    // Desempenho dos barbeiros
    const contagemBarbeiros = {};

    lista.forEach(a => {
        const nome = a.barbeiro || "Não informado";

        contagemBarbeiros[nome] =
            (contagemBarbeiros[nome] || 0) + 1;
    });

    const barbeiros = Object.entries(contagemBarbeiros)
        .sort((a, b) => b[1] - a[1]);

    const maiorBarbeiro = Math.max(
        ...barbeiros.map(b => b[1]),
        1
    );

    $("relBarbeiros").innerHTML = barbeiros.length
        ? barbeiros.map(([nome, total], i) => `
            <div class="report-row">
                <span>${i + 1}. ${escaparHTML(nome)}</span>
                <div class="report-track">
                    <div class="report-fill"
                        style="width:${total / maiorBarbeiro * 100}%">
                    </div>
                </div>
                <strong>${total}</strong>
            </div>
        `).join("")
        : '<p class="empty">Nenhum barbeiro encontrado.</p>';
}

async function carregarRelatorios() {
    mensagem("mensagemRelatorios", "Carregando relatórios...");

    try {
        agendamentos = await api("/api/admin/agendamentos");

        renderRelatorios();

        mensagem(
            "mensagemRelatorios",
            "Relatórios atualizados com sucesso."
        );

    } catch (erro) {
        mensagem("mensagemRelatorios", erro.message, true);
    }
}

$("filtroPeriodoRelatorios").addEventListener(
    "change",
    renderRelatorios
);