const USUARIOS = [
  { usuario: "maycon", senha: "123456", nome: "Maycon Rangel", role: "pastor" },
  { usuario: "mayk", senha: "123", nome: "Mayk", role: "barbeiro" },
  { usuario: "mateus", senha: "123", nome: "Mateus", role: "barbeiro" },
];

function salvarSessao(usuarioObj) {
  localStorage.setItem(
    "sessao",
    JSON.stringify({
      usuario: usuarioObj.usuario,
      nome: usuarioObj.nome,
      role: usuarioObj.role,
      logadoEm: new Date().toISOString(),
    }),
  );
}

function obterSessao() {
  const dados = localStorage.getItem("sessao");
  return dados ? JSON.parse(dados) : null;
}

function limparSessao() {
  localStorage.removeItem("sessao");
}

function protegerPagina(rolesPermitidas = []) {
  const sessao = obterSessao();
  if (!sessao) {
    window.location.href = "../index.html";
    return null;
  }
  if (rolesPermitidas.length > 0 && !rolesPermitidas.includes(sessao.role)) {
    window.location.href =
      sessao.role === "pastor" ? "painel-pastor.html" : "registro.html";
    return null;
  }
  return sessao;
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
