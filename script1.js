document.getElementById('inputNome').addEventListener('input', async function () {
  const nome = this.value.trim();
 
  if (nome.length < 3) return; // evita chamadas desnecessárias
 
  const url = `https://dadosabertos.camara.leg.br/api/v2/deputados?nome=${encodeURIComponent(nome)}&ordem=ASC&ordenarPor=nome`;
 
  try {
    const response = await fetch(new Request(url));
    const data = await response.json();
 
    if (data.dados.length === 0) {
      alert("Deputado não encontrado.");
      return;
    }
 
    const deputado = data.dados[0];
 
    // Agora buscar detalhes do deputado
    const detalhesResponse = await fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${deputado.id}`);
    const detalhesData = await detalhesResponse.json();
 
    const detalhes = detalhesData.dados;
 
    // Preencher o formulário
    document.getElementById('nome').value = detalhes.nomeCivil;
    document.getElementById('partido').value = detalhes.ultimoStatus.siglaPartido;
    document.getElementById('uf').value = detalhes.ultimoStatus.siglaUf;
    document.getElementById('email').value = detalhes.ultimoStatus.email;
 
    document.getElementById('fotoDeputado').innerHTML = `
      <img src="${detalhes.ultimoStatus.urlFoto}" alt="Foto de ${detalhes.nomeCivil}" class="img-thumbnail" width="150">
    `;
  } catch (error) {
    console.error("Erro ao buscar deputado:", error);
    alert("Erro na consulta.");
  }
});
 
 