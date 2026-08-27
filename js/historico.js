let periodoAtual = "dia";
let dataEscolhida = null;
let mesEscolhido = null;
let dataInicio = null;
let dataFim = null;

document.addEventListener("DOMContentLoaded", () => {
  const sessao = obterSessao();
  if (!sessao) {
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("btnSair").addEventListener("click", () => {
    limparSessao();
    window.location.href = "../index.html";
  });

  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const dd = String(hoje.getDate()).padStart(2, "0");
  const hojeStr = `${yyyy}-${mm}-${dd}`;

  const inputData = document.getElementById("dataEscolhida");
  inputData.value = hojeStr;
  dataEscolhida = hojeStr;

  const inputMes = document.getElementById("mesEscolhido");
  inputMes.value = `${yyyy}-${mm}`;
  mesEscolhido = inputMes.value;

  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(hoje.getDate() - 6);
  const inicioStr = seteDiasAtras.toISOString().split("T")[0];

  const inputInicio = document.getElementById("dataInicio");
  const inputFim = document.getElementById("dataFim");
  inputInicio.value = inicioStr;
  inputFim.value = hojeStr;
  dataInicio = inicioStr;
  dataFim = hojeStr;

  document.getElementById("seletorData").classList.add("mostrar");

  inputData.addEventListener("change", () => {
    dataEscolhida = inputData.value;
    carregarHistorico(sessao);
  });

  inputMes.addEventListener("change", () => {
    mesEscolhido = inputMes.value;
    carregarHistorico(sessao);
  });

  inputInicio.addEventListener("change", () => {
    dataInicio = inputInicio.value;
    carregarHistorico(sessao);
  });

  inputFim.addEventListener("change", () => {
    dataFim = inputFim.value;
    carregarHistorico(sessao);
  });

  document.querySelectorAll(".filtro-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filtro-btn")
        .forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      periodoAtual = btn.dataset.periodo;

      document.getElementById("seletorData").classList.remove("mostrar");
      document.getElementById("seletorPeriodo").classList.remove("mostrar");
      document.getElementById("seletorMes").classList.remove("mostrar");

      if (periodoAtual === "dia")
        document.getElementById("seletorData").classList.add("mostrar");
      else if (periodoAtual === "semana")
        document.getElementById("seletorPeriodo").classList.add("mostrar");
      else if (periodoAtual === "mes")
        document.getElementById("seletorMes").classList.add("mostrar");

      carregarHistorico(sessao);
    });
  });

  carregarHistorico(sessao);
});

function filtrarPorPeriodo(registros) {
  return registros.filter((r) => {
    const dataReg = new Date(r.data);
    const dataRegStr = dataReg.toISOString().split("T")[0];

    if (periodoAtual === "dia") {
      if (!dataEscolhida) return false;
      return dataRegStr === dataEscolhida;
    }
    if (periodoAtual === "semana") {
      if (!dataInicio || !dataFim) return false;
      return dataRegStr >= dataInicio && dataRegStr <= dataFim;
    }
    if (periodoAtual === "mes") {
      if (!mesEscolhido) return false;
      const [ano, mes] = mesEscolhido.split("-").map(Number);
      return dataReg.getFullYear() === ano && dataReg.getMonth() + 1 === mes;
    }
    return true;
  });
}

function carregarHistorico(sessao) {
  const todos = JSON.parse(localStorage.getItem("registros")) || [];
  let filtrados = filtrarPorPeriodo(todos);

  if (sessao.role === "barbeiro") {
    filtrados = filtrados.filter((r) => r.barbeiro === sessao.nome);
  }

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

  document.getElementById("totalGeral").textContent = formatarMoeda(totalGeral);
  document.getElementById("totalPix").textContent = formatarMoeda(totalPix);
  document.getElementById("totalDinheiro").textContent =
    formatarMoeda(totalDinheiro);
  document.getElementById("totalDebito").textContent =
    formatarMoeda(totalDebito);
  document.getElementById("totalCredito").textContent =
    formatarMoeda(totalCredito);

  const lista = document.getElementById("listaHistorico");

  if (filtrados.length === 0) {
    lista.innerHTML = `<div class="lista-vazia">Nenhum registro encontrado</div>`;
    return;
  }

  if (sessao.role === "pastor") {
    const porBarbeiro = {};
    filtrados.forEach((r) => {
      if (!porBarbeiro[r.barbeiro]) porBarbeiro[r.barbeiro] = [];
      porBarbeiro[r.barbeiro].push(r);
    });

    lista.innerHTML = "";

    Object.keys(porBarbeiro)
      .sort()
      .forEach((nome) => {
        const regs = porBarbeiro[nome].sort((a, b) => b.id - a.id);
        const totalBarbeiro = regs.reduce((s, r) => s + Number(r.valor), 0);

        const itensHtml = regs
          .map(
            (r) => `
        <div class="item-registro">
          <div class="item-info">
            <div class="item-servicos">${r.servicos.join(" + ")}</div>
            <div class="item-meta">${r.dataBR} • ${r.hora} • ${r.pagamento}</div>
          </div>
          <div class="item-valor">${formatarMoeda(r.valor)}</div>
        </div>
      `,
          )
          .join("");

        const card = document.createElement("div");
        card.className = "hist-barbeiro-card";
        card.innerHTML = `
        <div class="hist-barbeiro-header">
          <div>
            <div class="hist-barbeiro-nome">${nome}</div>
            <div class="hist-barbeiro-sub">${regs.length} atendimento${regs.length !== 1 ? "s" : ""}</div>
          </div>
          <div class="hist-barbeiro-direita">
            <div class="hist-barbeiro-total">${formatarMoeda(totalBarbeiro)}</div>
            <div class="seta">▼</div>
          </div>
        </div>
        <div class="hist-barbeiro-detalhe">
          <div class="hist-detalhe-conteudo">${itensHtml}</div>
        </div>
      `;

        card
          .querySelector(".hist-barbeiro-header")
          .addEventListener("click", () => {
            card.classList.toggle("aberto");
          });

        lista.appendChild(card);
      });
    return;
  }

  filtrados.sort((a, b) => b.id - a.id);
  lista.innerHTML = filtrados
    .map(
      (r) => `
    <div class="item-registro">
      <div class="item-info">
        <div class="item-servicos">${r.servicos.join(" + ")}</div>
        <div class="item-meta">${r.dataBR} • ${r.hora} • ${r.pagamento}</div>
      </div>
      <div class="item-valor">${formatarMoeda(r.valor)}</div>
    </div>
  `,
    )
    .join("");
}
