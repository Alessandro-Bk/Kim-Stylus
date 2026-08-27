const BARBEIROS = ["Mayk", "Mateus"];
let periodoAtual = "dia";

document.addEventListener("DOMContentLoaded", () => {
  const sessao = protegerPagina(["pastor"]);
  if (!sessao) return;

  document.getElementById("nomeUsuario").textContent = sessao.nome;

  document.getElementById("btnSair").addEventListener("click", () => {
    limparSessao();
    window.location.href = "../index.html";
  });

  document.querySelectorAll(".filtro-pastor").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filtro-pastor")
        .forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      periodoAtual = btn.dataset.periodo;
      carregarPainel();
    });
  });

  carregarPainel();
});

function filtrarPorPeriodo(registros) {
  const agora = new Date();
  return registros.filter((r) => {
    const dataReg = new Date(r.data);
    if (periodoAtual === "dia") {
      return (
        dataReg.toLocaleDateString("pt-BR") ===
        agora.toLocaleDateString("pt-BR")
      );
    }
    if (periodoAtual === "semana") {
      const inicio = new Date(agora);
      inicio.setDate(agora.getDate() - agora.getDay());
      inicio.setHours(0, 0, 0, 0);
      return dataReg >= inicio;
    }
    if (periodoAtual === "mes") {
      return (
        dataReg.getMonth() === agora.getMonth() &&
        dataReg.getFullYear() === agora.getFullYear()
      );
    }
    return true;
  });
}

function carregarPainel() {
  const todos = JSON.parse(localStorage.getItem("registros")) || [];
  const filtrados = filtrarPorPeriodo(todos);

  let totalGeral = 0,
    totalPix = 0,
    totalDinheiro = 0,
    totalDebito = 0,
    totalCredito = 0;

  filtrados.forEach((r) => {
    const v = Number(r.valor) || 0;
    totalGeral += v;
    const pag = (r.pagamento || "").toLowerCase();
    if (pag === "pix") totalPix += v;
    else if (pag === "dinheiro") totalDinheiro += v;
    else if (pag === "débito" || pag === "debito") totalDebito += v;
    else if (pag === "crédito" || pag === "credito") totalCredito += v;
  });

  document.getElementById("faturamentoTotal").textContent =
    formatarMoeda(totalGeral);
  document.getElementById("resPix").textContent = formatarMoeda(totalPix);
  document.getElementById("resDinheiro").textContent =
    formatarMoeda(totalDinheiro);
  document.getElementById("resDebito").textContent = formatarMoeda(totalDebito);
  document.getElementById("resCredito").textContent =
    formatarMoeda(totalCredito);

  const container = document.getElementById("listaBarbeiros");
  container.innerHTML = "";

  let temDados = false;

  BARBEIROS.forEach((nome) => {
    const doBarbeiro = filtrados.filter((r) => r.barbeiro === nome);

    let total = 0,
      pix = 0,
      dinheiro = 0,
      debito = 0,
      credito = 0;

    doBarbeiro.forEach((r) => {
      const v = Number(r.valor) || 0;
      total += v;
      const pag = (r.pagamento || "").toLowerCase();
      if (pag === "pix") pix += v;
      else if (pag === "dinheiro") dinheiro += v;
      else if (pag === "débito" || pag === "debito") debito += v;
      else if (pag === "crédito" || pag === "credito") credito += v;
    });

    if (total > 0) temDados = true;

    const inicial = nome.charAt(0).toUpperCase();
    const qtd = doBarbeiro.length;

    const card = document.createElement("div");
    card.className = "barbeiro-card";
    card.innerHTML = `
      <div class="barbeiro-header">
        <div class="barbeiro-info">
          <div class="barbeiro-avatar">${inicial}</div>
          <div>
            <div class="barbeiro-nome">${nome}</div>
            <div class="barbeiro-sub">${qtd} atendimento${qtd !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div class="barbeiro-direita">
          <div class="barbeiro-total">${formatarMoeda(total)}</div>
          <div class="seta">▼</div>
        </div>
      </div>
      <div class="barbeiro-detalhe">
        <div class="detalhe-conteudo">
          <div class="detalhe-linha pix"><span>Pix</span><strong>${formatarMoeda(pix)}</strong></div>
          <div class="detalhe-linha dinheiro"><span>Dinheiro</span><strong>${formatarMoeda(dinheiro)}</strong></div>
          <div class="detalhe-linha debito"><span>Débito</span><strong>${formatarMoeda(debito)}</strong></div>
          <div class="detalhe-linha pag-credito"><span>Crédito</span><strong>${formatarMoeda(credito)}</strong></div>
        </div>
      </div>
    `;

    card.querySelector(".barbeiro-header").addEventListener("click", () => {
      card.classList.toggle("aberto");
    });

    container.appendChild(card);
  });

  if (!temDados && filtrados.length === 0) {
    container.innerHTML = `<div class="lista-vazia-pastor">Nenhum atendimento neste período</div>`;
  }
}
