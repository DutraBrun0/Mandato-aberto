const formBusca = document.getElementById("formBusca");
const inputNome = document.getElementById("inputNome");
const mensagem = document.getElementById("mensagem");
const botaoPesquisar = document.getElementById("botaoPesquisar");
const painelDeputado = document.getElementById("painelDeputado");

formBusca.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nomePesquisado = inputNome.value.trim();

  if (nomePesquisado.length < 3) {
    mensagem.textContent = "Digite pelo menos três caracteres.";
    limparDados();
    return;
  }

  mensagem.textContent = "Consultando dados públicos...";
  botaoPesquisar.disabled = true;
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
      mensagem.textContent = "Nenhum deputado foi encontrado.";
      return;
    }

    const nomeMinusculo = nomePesquisado.toLowerCase();

    const deputado =
      data.dados.find(function (item) {
        return item.nome.toLowerCase() === nomeMinusculo;
      }) || data.dados[0];

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

    document.getElementById("nome").textContent =
      detalhes.nomeCivil || ultimoStatus.nome || "Não informado";

    document.getElementById("partido").textContent =
      ultimoStatus.siglaPartido || "Não informado";

    document.getElementById("uf").textContent =
      ultimoStatus.siglaUf || "Não informado";

    const email =
      ultimoStatus.gabinete?.email ||
      ultimoStatus.email ||
      deputado.email ||
      "Não informado";

    const campoEmail = document.getElementById("email");

    campoEmail.textContent = email;

    if (email !== "Não informado") {
      campoEmail.href = `mailto:${email}`;
    } else {
      campoEmail.removeAttribute("href");
    }

    if (ultimoStatus.urlFoto) {
      document.getElementById("fotoDeputado").innerHTML = `
        <img
          src="${ultimoStatus.urlFoto}"
          alt="Foto de ${ultimoStatus.nome || detalhes.nomeCivil}"
        >
      `;
    }

    painelDeputado.classList.remove("oculto");

    if (data.dados.length > 1) {
      mensagem.textContent =
        `${data.dados.length} resultados encontrados. Exibindo o mais próximo.`;
    } else {
      mensagem.textContent = "Informações encontradas.";
    }

  } catch (error) {
    console.error("Erro ao buscar deputado:", error);

    mensagem.textContent =
      "Não foi possível acessar os dados neste momento.";
  } finally {
    botaoPesquisar.disabled = false;
  }
});

function limparDados() {
  painelDeputado.classList.add("oculto");

  document.getElementById("nome").textContent = "";
  document.getElementById("partido").textContent = "";
  document.getElementById("uf").textContent = "";
  document.getElementById("email").textContent = "";
  document.getElementById("fotoDeputado").innerHTML = "";
}