
document.addEventListener("DOMContentLoaded", () => {
  const servico = localStorage.getItem("servico");
  const barbeiro = localStorage.getItem("barbeiro");
  const data = localStorage.getItem("data");
  const horario = localStorage.getItem("horario");
  const valor = localStorage.getItem("valor");

  document.getElementById("servico").innerText = servico || "-";
  document.getElementById("barbeiro").innerText = barbeiro || "-";
  document.getElementById("data").innerText = data || "-";
  document.getElementById("horario").innerText = horario || "-";
  document.getElementById("valor").innerText = valor || "-";
  document.getElementById("total").innerText = valor || "-";

  const btnConfirmar = document.querySelector(".confirm-btn");

  if (!btnConfirmar) return;

  btnConfirmar.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = localStorage.getItem("emailUsuario");

    if (!email) {
      alert("Faça seu cadastro ou entre na sua conta antes de agendar.");
      return;
    }

    if (!servico || !barbeiro || !data || !horario) {
      alert("Faltam informações. Volte às etapas anteriores e confira o agendamento.");
      return;
    }

    if (btnConfirmar.dataset.enviando === "true") return;

    btnConfirmar.dataset.enviando = "true";
    btnConfirmar.style.pointerEvents = "none";
    btnConfirmar.style.opacity = "0.6";

    try {
      const resposta = await fetch("http://localhost:3000/api/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          servico,
          barbeiro,
          data,
          horario
        })
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível confirmar o agendamento."
        );
      }

      localStorage.setItem("agendamentoConcluido", "true");
      localStorage.setItem("agendamentoId", resultado.id);

      alert("Agendamento confirmado com sucesso!");

      window.location.href = "../fila_de_espera/index-fila.html";
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      alert(error.message || "Erro ao conectar com o servidor.");
    } finally {
      btnConfirmar.dataset.enviando = "false";
      btnConfirmar.style.pointerEvents = "";
      btnConfirmar.style.opacity = "";
    }
  });
});
