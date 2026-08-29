let servicosSelecionados = [];
let formaPagamento = null;

function carregarServicos() {
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
  return servicos;
}

document.addEventListener("DOMContentLoaded", () => {
  const sessao = protegerPagina(["barbeiro"]);
  if (!sessao) return;

  document.getElementById("nomeUsuario").textContent = sessao.nome;

  document.getElementById("btnSair").addEventListener("click", () => {
    limparSessao();
    window.location.href = "../index.html";
  });

  montarServicos();

  document.querySelectorAll(".pag-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".pag-btn")
        .forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      formaPagamento = btn.dataset.pag;
    });
  });

  document.getElementById("btnRegistrar").addEventListener("click", () => {
    registrarAtendimento(sessao);
  });

  atualizarTotalDoDia(sessao.nome);
  limparRegistrosAntigos();
});

function montarServicos() {
  const container = document.getElementById("servicosGrid");
  container.innerHTML = "";
  const servicos = carregarServicos();

  servicos.forEach((servico) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = servico.nome;

    chip.addEventListener("click", () => {
      chip.classList.toggle("ativo");
      if (chip.classList.contains("ativo")) {
        servicosSelecionados.push({
          nome: servico.nome,
          valor: Number(servico.valor),
        });
      } else {
        servicosSelecionados = servicosSelecionados.filter(
          (s) => s.nome !== servico.nome,
        );
      }
      calcularTotal();
    });

    container.appendChild(chip);
  });
}

function calcularTotal() {
  const total = servicosSelecionados.reduce((soma, s) => soma + s.valor, 0);
  const input = document.getElementById("valor");
  input.value = total > 0 ? total.toFixed(2).replace(".", ",") : "";
}

function registrarAtendimento(sessao) {
  const valorInput = document.getElementById("valor").value.trim();
  const valor = parseFloat(valorInput.replace(",", "."));

  if (servicosSelecionados.length === 0) {
    mostrarToast("Selecione pelo menos um serviço");
    return;
  }
  if (!valorInput || isNaN(valor) || valor <= 0) {
    mostrarToast("Digite um valor válido");
    return;
  }
  if (!formaPagamento) {
    mostrarToast("Selecione a forma de pagamento");
    return;
  }

  const agora = new Date();
  const registro = {
    barbeiro: sessao.nome,
    usuario: sessao.usuario,
    servicos: servicosSelecionados.map((s) => s.nome),
    valor: valor,
    pagamento: formaPagamento,
    data: agora.toISOString(),
    dataBR: agora.toLocaleDateString("pt-BR"),
    hora: agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  db.collection("registros")
    .add(registro)
    .then(() => {
      limparFormulario();
      atualizarTotalDoDia(sessao.nome);
      mostrarToast("Registrado com sucesso!");
    })
    .catch((erro) => {
      console.error(erro);
      mostrarToast("Erro ao salvar. Tente de novo.");
    });
}

function limparFormulario() {
  servicosSelecionados = [];
  formaPagamento = null;
  document
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("ativo"));
  document
    .querySelectorAll(".pag-btn")
    .forEach((b) => b.classList.remove("ativo"));
  document.getElementById("valor").value = "";
}

function atualizarTotalDoDia(nomeBarbeiro) {
  const hoje = new Date().toLocaleDateString("pt-BR");

  db.collection("registros")
    .get()
    .then((snapshot) => {
      let total = 0;
      snapshot.forEach((doc) => {
        const r = doc.data();
        if (r.barbeiro === nomeBarbeiro && r.dataBR === hoje) {
          total += Number(r.valor) || 0;
        }
      });
      document.getElementById("totalDia").textContent = formatarMoeda(total);
    })
    .catch((erro) => {
      console.error(erro);
      document.getElementById("totalDia").textContent = "R$ 0,00";
    });
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.classList.add("mostrar");
  setTimeout(() => toast.classList.remove("mostrar"), 2200);
}
