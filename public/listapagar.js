let dadosPagar = [];
let paginaAtualPagar = 1;
const itensPorPaginaPagar = 14;

document.querySelectorAll('input[name="filtroStatusPagar"]').forEach(radio => {
  radio.addEventListener('change', verpagar);
});

function verpagar() {
  limparNome();
  document.getElementById('formPresenta').style.display = 'none';
  document.getElementById('formPainel').style.display = 'none';      
  document.getElementById('formListaPagar').style.display = 'block';

  fetch('/pagar')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar contas a pagar');
      return res.json();
    })
    .then(pagar => {
      const status = getStatusFiltroSelecionado();
      dadosPagar = filtrarPorStatus(pagar, status);
      paginaAtualPagar = 1;
      renderizarPaginaPagar();
    })
    .catch(err => {
      alert('Erro ao listar contas a pagar: ' + err.message);
    });
}

function getStatusFiltroSelecionado() {
  return document.querySelector('input[name="filtroStatusPagar"]:checked')?.value || 'todos';
}

function filtrarPorStatus(dados, status) {
  if (status === 'aberto' || status === 'pago') {
    return dados.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }
  return dados;
}

function renderizarPaginaPagar() {
  const tabela = document.getElementById('tabelaPagar');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';

  const inicio = (paginaAtualPagar - 1) * itensPorPaginaPagar;
  const fim = inicio + itensPorPaginaPagar;
  const paginaDados = dadosPagar.slice(inicio, fim);

  let totalOriginal = 0;
  let totalPago = 0;

  if (paginaDados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;">Nenhuma conta encontrada.</td></tr>';
  } else {
    paginaDados.forEach(p => {
      totalOriginal += parseFloat(p.valororiginal);
      totalPago += parseFloat(p.valorpago);

      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td style="text-align: center;">${p.controle}</td>
        <td>${p.funcionario}</td>
        <td>${p.nomefornecedor}</td>
        <td style="text-align: right;">R$ ${parseFloat(p.valororiginal).toFixed(2)}</td>
        <td style="text-align: right;">R$ ${parseFloat(p.valorpago).toFixed(2)}</td>
        <td style="text-align: center;">${p.numeroparcela}</td>
        <td style="text-align: center;">${p.totalparcelas}</td>
        <td style="text-align: center;">${formatarDataBRL(p.datacadastro)}</td>
        <td style="text-align: center;">${formatarDataBRL(p.datavencimento)}</td>
        <td style="text-align: center;">${p.datapagamento ? formatarDataBRL(p.datapagamento) : 'PENDIENTE'}</td>
        <td style="text-align: right;">${parseFloat(p.multa).toFixed(2)}</td>
        <td style="text-align: right;">${parseFloat(p.juros).toFixed(2)}</td>
        <td style="text-align: center;">${p.status}</td>
        <td><button class="btnExcluirpa" data-controle="${p.controle}">🗑️</button></td>
      `;
      tbody.appendChild(linha);
    });

    const linhaTotal = document.createElement('tr');
    linhaTotal.style.fontWeight = 'bold';
    linhaTotal.innerHTML = `
      <td colspan="3" style="text-align: right;">Totais:</td>
      <td>R$ ${totalOriginal.toFixed(2)}</td>
      <td>R$ ${totalPago.toFixed(2)}</td>
      <td colspan="8"></td>
    `;
    tbody.appendChild(linhaTotal);

    configurarBotoesExcluirPagar()
  }

  tabela.style.display = 'table';
  renderizarPaginacaoPagar(); // Se estiver usando paginação
}

function configurarBotoesExcluirPagar() {
  document.querySelectorAll('.btnExcluirpa').forEach(botao => {
    const controle = botao.getAttribute('data-controle');
    if (!controle) return;

    Object.assign(botao.style, {
      backgroundColor: '#1476dfff',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'inline-block'
    });

    botao.disabled = false;

    // Garante centralização no td
    const pai = botao.parentElement;
    if (pai) {
      pai.style.textAlign = 'center';
    }

    botao.removeEventListener('click', botao._handlerExcluir);
    const handler = () => removerPagar(controle);
    botao.addEventListener('click', handler);
    botao._handlerExcluir = handler;
  });
}

function renderizarPaginacaoPagar() {
  const totalPaginas = Math.ceil(dadosPagar.length / itensPorPaginaPagar);
  const paginacao = document.getElementById('paginacaoPagar');
  if (!paginacao) return;

  paginacao.innerHTML = '';

  if (totalPaginas <= 1) return;

  // Botão Anterior
  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = 'Anterior';
  btnAnterior.disabled = paginaAtualPagar === 1;
  Object.assign(btnAnterior.style, {
    backgroundColor: '#0867c7ff',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderTopLeftRadius: '20px',
    borderBottomLeftRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  });
  btnAnterior.onclick = () => {
    paginaAtualPagar--;
    renderizarPaginaPagar();
  };
  paginacao.appendChild(btnAnterior);

  // Indicador de página
  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtualPagar} de ${totalPaginas} `;
  span.style.margin = '0 10px';
  paginacao.appendChild(span);

  // Botão Próxima
  const btnProximo = document.createElement('button');
  btnProximo.textContent = 'Próxima';
  btnProximo.disabled = paginaAtualPagar === totalPaginas;
  Object.assign(btnProximo.style, {
    backgroundColor: '#0867c7ff',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderTopRightRadius: '20px',
    borderBottomRightRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  });
  btnProximo.onclick = () => {
    paginaAtualPagar++;
    renderizarPaginaPagar();
  };
  paginacao.appendChild(btnProximo);
}


  function removerPagar(controle) {    
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
        box-shadow: 0 4px 10px rgba(0,0,0,0.2); overflow: hidden;
        font-family: sans-serif;
      `;
    
      const franja = document.createElement('div');
      franja.style.cssText = `
        height: 6px; background-color: #007BFF; width: 100%;
        margin: -20px -20px 10px -20px; border-top-left-radius: 10px; border-top-right-radius: 10px;
      `;
    
      const imagem = document.createElement('img');
      imagem.src = 'https://cdn-icons-png.flaticon.com/512/564/564619.png';
      imagem.alt = 'Advertência';
      imagem.style.cssText = 'width: 50px; margin-bottom: 10px;';
    
      const texto = document.createElement('p');
      texto.textContent = 'Deseja realmente excluir essa Parcela?';
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
        color: white; border: none; border-radius: 5px;
        cursor: pointer;
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
    
        fetch(`/pagar/${controle}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error();
            result = "Parcela removida com sucesso!";  
            showToast(result, 2500);                                                             
            resultado.style.color = "green";                
            resultado.style.display = "block";  
            esperar();         
            limparNome();
            document.getElementById('formPresenta').style.display = 'none'; 
            document.getElementById('formListaPagar').style.display = 'block';
            document.getElementById('btnPag').click();
          })
          .catch()  ;
      };        
      
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
  }