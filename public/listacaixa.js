let dadosCaixa = [];
let paginaAtualCaixa = 1;
const itensPorPaginaCaixa = 13;

let totalEntrada = 0;
let totalSaida = 0;
let totalEntradaHoje = 0;
let totalSaidaHoje = 0;
function trocarFiltro(tipo) {
  const checkDia = document.getElementById('checkDia');
  const checkTotal = document.getElementById('checkTotal');

  if (tipo === 'dia') {
    checkDia.checked = true;
    checkTotal.checked = false;
  } else if (tipo === 'total') {
    checkDia.checked = false;
    checkTotal.checked = true;
  }

  vercaixa(); // Atualiza os dados conforme o filtro
}

function vercaixa() {
  limparNome();
  document.getElementById('formPresenta').style.display = 'none';
  document.getElementById('formPainel').style.display = 'none';      
  document.getElementById('formListaCaixa').style.display = 'block';

  const somenteDia = document.getElementById('checkDia').checked;
  const somenteTotal = document.getElementById('checkTotal').checked;

  const agora = new Date();
  const hoje = agora.toLocaleDateString('pt-BR').split('/').reverse().join('-');

  fetch('/caixa')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar movimentações');
      return res.json();
    })
    .then(movimentacoes => {
      dadosCaixa = movimentacoes.filter(mov => {
        const dataMov = new Date(mov.datacadastro).toISOString().split('T')[0];
        const isHoje = dataMov === hoje;
        return (somenteDia && isHoje) || somenteTotal;
      });

      paginaAtualCaixa = 1;
      renderizarPaginaCaixa();
    })
    .catch(err => {
      alert('Erro ao listar caixa: ' + err.message);
    });
}


function criarLinhaTotal(titulo, valor, destacar = false) {
  const linha = document.createElement('tr');
  linha.innerHTML = `
    <td colspan="9" style="text-align: right; font-weight: bold; ${destacar ? `color: ${valor >= 0 ? 'green' : 'red'};` : ''}">
      ${titulo}: ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
    </td>
    <td></td>
  `;
  return linha;
}


function criarLinhaTotal1(titulo, valor, destacar = false) {
  const linha = document.createElement('tr');
  linha.innerHTML = `
    <td colspan="9" style="text-align: right; font-weight: bold; ${destacar ? `color: ${valor >= 0 ? 'green' : 'red'};` : ''}">
      ${titulo}: ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
    </td>
    <td></td>
  `;
  return linha;
}

function renderizarPaginaCaixa() {
  const tabela = document.getElementById('tabelaCaixa');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';

  const inicio = (paginaAtualCaixa - 1) * itensPorPaginaCaixa;
  const fim = inicio + itensPorPaginaCaixa;
  const paginaDados = dadosCaixa.slice(inicio, fim);

  let totalEntrada = 0;
  let totalSaida = 0;

  if (paginaDados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10">Nenhuma movimentação cadastrada.</td></tr>';
  } else {
    paginaDados.forEach(mov => {
      const entrada = parseFloat(mov.valorentrada) || 0;
      const saida = parseFloat(mov.valorsaida) || 0;

      totalEntrada += entrada;
      totalSaida += saida;

      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td style="text-align: center;">${mov.controle}</td>
        <td>${mov.funcionario}</td>
        <td>${mov.cliente.toUpperCase()}</td>
        <td>${mov.fornecedor.toUpperCase()}</td>
        <td>${mov.descricao.toUpperCase()}</td>
        <td>${mov.especies.toUpperCase()}</td>
        <td style="text-align: right;">${entrada.toFixed(2)}</td>
        <td style="text-align: right;">${saida.toFixed(2)}</td>
        <td style="text-align: center;">${formatarDataBRL(mov.datacadastro)}</td>
        <td class="coluna-botoes">
          <button class="btnExcluirx" data-controle="${mov.controle}">🗑️</button>
        </td>
      `;
      tbody.appendChild(linha);
    });

    tbody.appendChild(criarLinhaTotal('TOTAL DE ENTRADAS', totalEntrada));
    tbody.appendChild(criarLinhaTotal1('TOTAL DE SAÍDAS', totalSaida));
    tbody.appendChild(criarLinhaTotal1('SALDO FINAL', totalEntrada - totalSaida, true));
    configurarBotoesExcluirCaixa();
  }

  tabela.style.display = 'table';
  renderizarPaginacaoCaixa();
}

function configurarBotoesExcluirCaixa() {
  document.querySelectorAll('.btnExcluirx').forEach(botao => {
    const controle = botao.getAttribute('data-controle');
    if (!controle) return;
    Object.assign(botao.style, {
      backgroundColor: '#f1ab13',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '8px',
      cursor: 'pointer'
    });    
    botao.disabled = false;    
    const pai = botao.parentElement;
    if (pai && !pai.classList.contains('coluna-botoes')) {
      pai.classList.add('coluna-botoes');
    }   
    botao.removeEventListener('click', botao._handlerExcluir);
    const handler = () => removerCaixa(controle);
    botao.addEventListener('click', handler);
    botao._handlerExcluir = handler;
  });
}

function criarBotaoExcluirCaixa(controle) {
  const botao = document.createElement('button');
  botao.className = 'btnExcluirx';
  botao.setAttribute('data-controle', controle);
  botao.innerText = '🗑️';
  Object.assign(botao.style, {
    backgroundColor: '#f1ab13',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer'
  });
  botao.addEventListener('click', () => {
    removerCaixa(controle);
  });
  return botao;
}


function renderizarPaginacaoCaixa() {
  const totalPaginas = Math.ceil(dadosCaixa.length / itensPorPaginaCaixa);
  const paginacao = document.getElementById('paginacaoCaixa');
  if (!paginacao) return;

  paginacao.innerHTML = '';

  if (totalPaginas <= 1) return;

  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = 'Anterior';
  btnAnterior.disabled = paginaAtualCaixa === 1;
  Object.assign(btnAnterior.style, {
    backgroundColor: '#f1ab13',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderTopLeftRadius: '20px',
    borderBottomLeftRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  });
  btnAnterior.onclick = () => {
    paginaAtualCaixa--;
    renderizarPaginaCaixa();
  };
  paginacao.appendChild(btnAnterior);

  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtualCaixa} de ${totalPaginas} `;
  span.style.margin = '0 10px';
  paginacao.appendChild(span);

  const btnProximo = document.createElement('button');
  btnProximo.textContent = 'Próxima';
  btnProximo.disabled = paginaAtualCaixa === totalPaginas;
  Object.assign(btnProximo.style, {
    backgroundColor: '#f1ab13',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderTopRightRadius: '20px',
    borderBottomRightRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  });
  btnProximo.onclick = () => {
    paginaAtualCaixa++;
    renderizarPaginaCaixa();
  };
  paginacao.appendChild(btnProximo);
}



  function removerCaixa(controle) {          
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
        height: 6px; background-color: #f1ab13; width: 100%;
        margin: -20px -20px 10px -20px; border-top-left-radius: 10px; border-top-right-radius: 10px;
      `;
    
      const imagem = document.createElement('img');
      imagem.src = 'https://cdn-icons-png.flaticon.com/512/564/564619.png';
      imagem.alt = 'Advertência';
      imagem.style.cssText = 'width: 50px; margin-bottom: 10px;';
    
      const texto = document.createElement('p');
      texto.textContent = 'Deseja realmente excluir essa Movimentação?';
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
    
        fetch(`/caixa/${controle}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error();
            result = "Movimentação excluída com sucesso!";  
            showToast(result, 2500);                                                             
            resultado.style.color = "green";                
            resultado.style.display = "block";  
            esperar();         
            limparNome();
            document.getElementById('formPresenta').style.display = 'none'; 
            document.getElementById('formListaCaixa').style.display = 'block';
            document.getElementById('btnRecaixa').click();
          })
          .catch()  ;
      };        
      
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
  }
