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
        <td style="font-size: 10px;text-align:center; border:1px solid #ccc; background:#f9f9f9;font-size:12px">
        ${mov.controle}
        <td style="border:1px solid #ccc;font-size:12px; padding:6px 6px;"> ${mov.funcionario} </td>
        <td style="border:1px solid #ccc;font-size:12px; padding:6px 6px;"> ${mov.cliente.toUpperCase()} </td>
        <td style="border:1px solid #ccc;font-size:12px; padding:6px 6px;"> ${mov.fornecedor.toUpperCase()}</td>
        <td style="border:1px solid #ccc;font-size:12px; padding:6px 6px;"> ${mov.descricao.toUpperCase()}</td>
        <td style="border:1px solid #ccc;font-size:12px; padding:6px 6px;"> ${mov.especies.toUpperCase()}</td>
        <td style="text-align:right; border:1px solid #ccc;font-size:12px; padding:6px 6px;"> ${entrada.toFixed(2)}</td>
        <td style="text-align:right; border:1px solid #ccc;font-size:12px; padding:6px 6px;"> ${saida.toFixed(2)}</td>
        <td style="text-align:center; border:1px solid #ccc;font-size:12px; padding:6px 6px;"> ${formatarDataBRL(mov.datacadastro)}</td>
      `;
      tbody.appendChild(linha);
    });

    tbody.appendChild(criarLinhaTotal('TOTAL DE ENTRADAS', totalEntrada));
    tbody.appendChild(criarLinhaTotal1('TOTAL DE SAÍDAS', totalSaida));
    tbody.appendChild(criarLinhaTotal1('SALDO FINAL', totalEntrada - totalSaida, true));    
  }

  tabela.style.display = 'table';
  renderizarPaginacaoCaixa();
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
    backgroundColor: 'rgb(8, 8, 233)',
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
    backgroundColor: 'rgb(8, 8, 233)',
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