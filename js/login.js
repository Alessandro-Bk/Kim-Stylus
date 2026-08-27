document.addEventListener("DOMContentLoaded", () => {
  const sessao = obterSessao();
  if (sessao) {
    redirecionarPorRole(sessao.role);
    return;
  }

  document.getElementById("formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    const usuario = document
      .getElementById("usuario")
      .value.trim()
      .toLowerCase();
    const senha = document.getElementById("senha").value;
    const msgErro = document.getElementById("msgErro");

    msgErro.classList.add("hidden");

    const encontrado = USUARIOS.find(
      (u) => u.usuario === usuario && u.senha === senha,
    );
    if (!encontrado) {
      msgErro.textContent = "Usuário ou senha incorretos.";
      msgErro.classList.remove("hidden");
      return;
    }

    salvarSessao(encontrado);
    redirecionarPorRole(encontrado.role);
  });
});

function redirecionarPorRole(role) {
  window.location.href =
    role === "pastor" ? "pages/painel-pastor.html" : "pages/registro.html";
}
