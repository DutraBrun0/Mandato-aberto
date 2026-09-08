const formBusca = document.getElementById("formBusca");
const inputNome = document.getElementById("inputNome");
const mensagem = document.getElementById("mensagem");

formBusca.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nomePesquisado = inputNome.value.trim();

  if (nomePesquisado.length < 3) {
    mensagem.textContent = "Digite pelo menos três caracteres.";
    limparDados();
    return;
  }

  mensagem.textContent = "Buscando deputado...";
  limparDados();

  const url =
    `https://dadosabertos.camara.leg.br/api/v2/deputados` +
    `?nome=${encodeURIComponent(nomePesquisado)}` +
    `&ordem=ASC&ordenarPor=nome`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na consulta: ${response.status}`);
    }

    const data = await response.json();

    if (!data.dados || data.dados.length === 0) {
      mensagem.textContent = "Deputado não encontrado.";
      return;
    }

    const deputado = data.dados[0];

    const urlDetalhes =
      `https://dadosabertos.camara.leg.br/api/v2/deputados/${deputado.id}`;

    const detalhesResponse = await fetch(urlDetalhes);

    if (!detalhesResponse.ok) {
      throw new Error(
        `Erro ao buscar detalhes: ${detalhesResponse.status}`
      );
    }

    const detalhesData = await detalhesResponse.json();
    const detalhes = detalhesData.dados;
    const ultimoStatus = detalhes.ultimoStatus;

    document.getElementById("nome").value =
      detalhes.nomeCivil || "Não informado";

    document.getElementById("partido").value =
      ultimoStatus.siglaPartido || "Não informado";

    document.getElementById("uf").value =
      ultimoStatus.siglaUf || "Não informado";

    const email =
      ultimoStatus.gabinete?.email ||
      ultimoStatus.email ||
      deputado.email ||
      "Não informado";

    document.getElementById("email").value = email;

    const foto = ultimoStatus.urlFoto;

    if (foto) {
      document.getElementById("fotoDeputado").innerHTML = `
        <img
          src="${foto}"
          alt="Foto de ${detalhes.nomeCivil}"
          class="img-thumbnail"
          width="150"
        >
      `;
    }

    if (data.dados.length > 1) {
      mensagem.textContent =
        `${data.dados.length} resultados encontrados. Exibindo o primeiro.`;
    } else {
      mensagem.textContent = "Deputado encontrado.";
    }

  } catch (error) {
    console.error("Erro ao buscar deputado:", error);

    mensagem.textContent =
      "Não foi possível realizar a consulta. Tente novamente.";
  }
});

function limparDados() {
  document.getElementById("nome").value = "";
  document.getElementById("partido").value = "";
  document.getElementById("uf").value = "";
  document.getElementById("email").value = "";
  document.getElementById("fotoDeputado").innerHTML = "";
}