let dadosOs = [];
let paginaAtualOs = 1;
const itensPorPaginaOs = 13;
function listaros() {    
  limparNome();   
  document.getElementById('formPresenta').style.display = 'none';   
  document.getElementById('formPainel').style.display = 'none';         
  document.getElementById('formListaOS').style.display = 'block';    
  fetch('/api/ordens-servico')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar produtos');
      return res.json();
    })
    .then(os => {
      dadosOs = os;
      paginaAtualOs = 1;
      renderizarPaginaOs();
    })
    .catch(err => {
      alert('Erro ao listar Servicos: ' + err.message);
    });
}

function converterDecimalParaHora(valor) {
  const decimal = parseFloat(valor);
  if (isNaN(decimal)) return ''; 

  const horas = Math.floor(decimal);
  const minutos = Math.round((decimal - horas) * 60);
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}


function renderizarPaginaOs() {
  const tabela = document.getElementById('tabelaOrdensServico');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';

  const inicio = (paginaAtualOs - 1) * itensPorPaginaOs;
  const fim = inicio + itensPorPaginaOs;
  const pagina = dadosOs.slice(inicio, fim);

  if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;">Nenhuma ordem de serviço encontrada.</td></tr>';
  } else {
    pagina.forEach(os => {
const linha = document.createElement('tr');
if (os.status) {
  const status = os.status.toUpperCase();

  if (status === 'FATURADA') {
    linha.style.backgroundColor = '#c6efce'; 
  } else if (status === 'CANCELADA') {
    linha.style.backgroundColor = '#f198a2ff'; 
  } else if (status === 'FINALIZADA') {
    linha.style.backgroundColor = '#c8e0f7ff'; 
  } else if (status === 'PRONTA') {
    linha.style.backgroundColor = '#f1f1bdff'; 
  } else if (status === 'ORÇAMENTO') {
    linha.style.backgroundColor = '#787979ff'; 
  } else if (status === 'LIBERADA') {
    linha.style.backgroundColor = '#10ececff';   
  } else if (status === 'EM ANDAMENTO') {
    linha.style.backgroundColor = '#e66c1cff';   
  } else if (status === 'PENDENTE') {
    linha.style.backgroundColor = '#4d8eeeff'; 
  }  
}

linha.innerHTML = `
  <td style="font-family: Arial; font-size: 10pt; text-align: center;">${os.idOS}</td>
  <td style="font-family: Arial; font-size: 9pt;">${os.nomeCliente || '-'}</td>
  <td style="font-family: Arial; font-size: 9pt;">${os.nomeFuncionario || 'FUNCIONÁRIO PADRÃO'}</td>
  <td style="font-family: Arial; font-size: 9pt;">${os.objetoConsertado || '-'}</td>
  <td style="font-family: Arial; font-size: 9pt; text-align: center;">${os.status || '-'}</td>
  <td style="font-family: Arial; font-size: 9pt; text-align: right;">${(os.valorProdutos || 0).toFixed(2)}</td>
  <td style="font-family: Arial; font-size: 9pt; text-align: right;">${(os.valorServicos || 0).toFixed(2)}</td>
  <td style="font-family: Arial; font-size: 9pt; text-align: right;">${(os.Desconto || 0).toFixed(2)}</td>
  <td style="font-family: Arial; font-size: 9pt; text-align: right;">${(os.Acrescimo || 0).toFixed(2)}</td>
  <td style="font-family: Arial; font-size: 9pt; text-align: right; font-weight: bold;">${(os.totalOS || 0).toFixed(2)}</td>
  <td style="text-align: center;">
    <button class="btnEditar" data-id="${os.idOS}">✏️</button>
    <button class="btnExcluir" data-id="${os.idOS}">🗑️</button>
    <button class="btnVer" data-id="${os.idOS}">👁️</button>
    <button class="btnImprimir" data-id="${os.idOS}">🖨️</button>
  </td>
`;


      tbody.appendChild(linha);
    });
    configurarBotoesOs();
  }

  tabela.style.display = 'table';
  renderizarPaginacaoOs();
}

function renderizarPaginacaoOs() {
  const totalPaginas = Math.ceil(dadosOs.length / itensPorPaginaOs);
  const paginacao = document.getElementById('paginacaoOS');
  if (!paginacao) return;

  paginacao.innerHTML = '';

  if (totalPaginas <= 1) return;

  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = 'Anterior';
  btnAnterior.disabled = paginaAtualOs === 1; 
  btnAnterior.style.backgroundColor = '#0867c7ff';
  btnAnterior.style.color = '#fff';
  btnAnterior.style.border = 'none';
  btnAnterior.style.padding = '10px 16px';
  btnAnterior.style.borderTopLeftRadius = '20px';
  btnAnterior.style.borderBottomLeftRadius = '20px';
  btnAnterior.style.cursor = 'pointer';
  btnAnterior.style.fontWeight = 'bold';
  btnAnterior.onclick = () => {
    paginaAtualOs--;
    renderizarPaginaOs();
  };

  const btnProximo = document.createElement('button');
  btnProximo.textContent = 'Próxima';
  btnProximo.disabled = paginaAtualOs === totalPaginas;
  btnProximo.style.backgroundColor = '#0867c7ff';  
  btnProximo.style.border = 'none';
  btnProximo.style.padding = '10px 16px';
  btnProximo.style.borderTopRightRadius = '20px';
  btnProximo.style.borderBottomRightRadius = '20px';
  btnProximo.style.cursor = 'pointer';
  btnProximo.style.fontWeight = 'bold';
  btnProximo.style.color = '#fff';
  btnProximo.onclick = () => {
    paginaAtualOs++;
    renderizarPaginaOs();
  };

  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtualOs} de ${totalPaginas} `;
  span.style.margin = '0 10px';

  [btnAnterior, span, btnProximo].forEach(el => paginacao.appendChild(el));
}

function configurarBotoesOs() {
  const acoes = [
    {
  classe: '.btnEditar',
  handler: async id => {
    try {      
      const os = await fetchJson(`/ordemServico/os/${id}`);      
      if (os.dataFinalizacao !== null && os.dataFinalizacao !== undefined && os.dataFinalizacao !== "") {
        showToastl("⚠️Esta Ordem de Serviço tem movimentação financeira e não pode ser alterada!", 2500);
        const modulo = document.getElementById("formOs");
        if (modulo) modulo.style.display = "none";
        document.getElementById('formPresenta').style.display = 'none';
        document.getElementById('formPainel').style.display = 'none';
        document.getElementById('formListaOS').style.display = 'block';
        return;
      }
      if (os.status && os.status.toUpperCase() === "CANCELADA") {
  showToastl("⚠️Esta Ordem de Serviço está CANCELADA e não pode ser reaberta!", 2500);

  const modulo = document.getElementById("formOs");
  if (modulo) modulo.style.display = "none";

  document.getElementById("formPresenta").style.display = "none";
  document.getElementById("formPainel").style.display = "none";
  document.getElementById("formListaOS").style.display = "block";

  return;
}
      editordemos(id);

    } catch (err) {
      console.error("Erro ao verificar OS:", err);
      showToast("❌ Erro ao verificar status da OS!", 2500);
    }
  }
},
{ classe: '.btnExcluir', handler: async id => {
    try {      
      const os = await fetchJson(`/ordemServico/os/${id}`);      
      if (os.dataFinalizacao !== null && os.dataFinalizacao !== undefined && os.dataFinalizacao !== "") {
        showToastl("⚠️Esta Ordem de Serviço tem movimentação financeira e não pode ser excluida!", 2500);
        const modulo = document.getElementById("formOs");
        if (modulo) modulo.style.display = "none";
        document.getElementById('formPresenta').style.display = 'none';
        document.getElementById('formPainel').style.display = 'none';
        document.getElementById('formListaOS').style.display = 'block';
        return;
      }
      if (os.status && os.status.toUpperCase() === "CANCELADA") {
  showToastl("⚠️Esta Ordem de Serviço está CANCELADA e não pode ser excluida!", 2500);

  const modulo = document.getElementById("formOs");
  if (modulo) modulo.style.display = "none";

  document.getElementById("formPresenta").style.display = "none";
  document.getElementById("formPainel").style.display = "none";
  document.getElementById("formListaOS").style.display = "block";

  return;
}
      removerOs(id);

    } catch (err) {
      console.error("Erro ao verificar OS:", err);
      showToast("❌ Erro ao verificar status da OS!", 2500);
    }
  }
},
{ classe: '.btnVer', handler: id => verordemos(id) },
{ classe: '.btnImprimir', handler: async id => await imprimirOSPorId(id) }
  ];

  acoes.forEach(({ classe, handler }) => {
    document.querySelectorAll(classe).forEach(btn => {      
      btn.onclick = () => handler(btn.getAttribute('data-id'));
      btn.style.backgroundColor = '#1476dfff';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.padding = '6px 10px';
      btn.style.borderRadius = '6px';
      btn.style.margin = '2px';
      btn.style.cursor = 'pointer';
    });
  });
}

  function removerOs(osId) {      
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.5); display: flex;
    align-items: center; justify-content: center; z-index: 1000;
  `;  
  const caixa = document.createElement('div');
  caixa.style.cssText = `
    background: white; padding: 20px; border-radius: 10px;
    text-align: center; max-width: 320px; width: 90%;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    overflow: hidden; font-family: sans-serif;
  `;  
  const franja = document.createElement('div');
  franja.style.cssText = `
    height: 6px; background-color: #007BFF; width: 100%;
    margin: -20px -20px 10px -20px;
    border-top-left-radius: 10px; border-top-right-radius: 10px;
  `;  
  const imagem = document.createElement('img');
  imagem.src = 'https://cdn-icons-png.flaticon.com/512/564/564619.png';
  imagem.alt = 'Advertência';
  imagem.style.cssText = 'width: 50px; margin-bottom: 10px;';  
  const texto = document.createElement('p');
  texto.textContent = 'Deseja realmente excluir esta Ordem de Serviço?';
  texto.style.marginBottom = '15px';  
  const btnSim = document.createElement('button');
  btnSim.textContent = 'Sim';
  btnSim.style.cssText = `
    margin-right: 10px; padding: 8px 16px;
    background-color: #dc3545; color: white;
    border: none; border-radius: 5px; cursor: pointer;
  `;  
  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.style.cssText = `
    padding: 8px 16px; background-color: #6c757d;
    color: white; border: none; border-radius: 5px; cursor: pointer;
  `;          
  caixa.appendChild(franja);
  caixa.appendChild(imagem);
  caixa.appendChild(texto);
  caixa.appendChild(btnSim);
  caixa.appendChild(btnCancelar);
  modal.appendChild(caixa);
  document.body.appendChild(modal);                    
  btnSim.onclick = () => {
    document.body.removeChild(modal);   

    fetch(`/ordemServico/${osId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error();
        showToast("🗑️ Ordem de Serviço removida com sucesso!", 2500);
        reverterEstoqueOsOs()
        document.getElementById('btnLisos').click();
      })
      .catch(() => alert("Erro ao remover Ordem de Serviço."));
  };
  btnCancelar.onclick = () => {
    document.body.removeChild(modal);
  };  
}