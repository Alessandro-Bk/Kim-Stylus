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

  carregarLista();
  document
    .getElementById("btnSalvar")
    .addEventListener("click", salvarAlteracoes);
});

function carregarLista() {
  let servicos = JSON.parse(localStorage.getItem("servicos"));
  if (!servicos || servicos.length === 0) {
    servicos = [
      { nome: "Máquina", valor: 20 },
      { nome: "Disfarçado", valor: 25 },
      { nome: "Máq + Tesoura", valor: 30 },
      { nome: "Tesoura", valor: 35 },
      { nome: "Navalhado Total", valor: 25 },
      { nome: "Navalhado Disf.", valor: 30 },
      { nome: "Pezinho", valor: 10 },
      { nome: "Sobrancelha", valor: 10 },
      { nome: "Alisante", valor: 15 },
      { nome: "Barba", valor: 20 },
      { nome: "Toalha Quente", valor: 10 },
      { nome: "Barboterapia", valor: 15 },
      { nome: "Pigmentação", valor: 15 },
    ];
    localStorage.setItem("servicos", JSON.stringify(servicos));
  }

  const container = document.getElementById("listaServicos");
  container.innerHTML = "";

  servicos.forEach((s, index) => {
    const div = document.createElement("div");
    div.className = "item-servico";
    div.innerHTML = `
      <span class="nome">${s.nome}</span>
      <input type="text" data-index="${index}" value="${Number(s.valor).toFixed(2).replace(".", ",")}" inputmode="decimal">
    `;
    container.appendChild(div);
  });
}

function salvarAlteracoes() {
  const inputs = document.querySelectorAll("#listaServicos input");
  let servicos = JSON.parse(localStorage.getItem("servicos")) || [];

  inputs.forEach((input) => {
    const index = Number(input.dataset.index);
    const valor = parseFloat(input.value.replace(",", "."));
    if (!isNaN(valor) && valor >= 0) {
      servicos[index].valor = valor;
    }
  });

  localStorage.setItem("servicos", JSON.stringify(servicos));
  mostrarToast("Preços atualizados!");
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.classList.add("mostrar");
  setTimeout(() => toast.classList.remove("mostrar"), 2200);
}
