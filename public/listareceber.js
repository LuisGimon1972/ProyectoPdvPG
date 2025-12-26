let dadosReceber = [];         
let paginaAtual = 1;
const itensPorPagina = 14;

document.querySelectorAll('input[name="filtroStatus"]').forEach(radio => {
  radio.addEventListener('change', verreceber);
});

function verreceber() {
  limparNome();
  document.getElementById('formPresenta').style.display = 'none';
  document.getElementById('formPainel').style.display = 'none';      
  document.getElementById('formListaReceber').style.display = 'block';

  fetch('/receber')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar conta a receber');
      return res.json();
    })
    .then(receber => {
      const statusSelecionado = document.querySelector('input[name="filtroStatus"]:checked').value;
      
      if (statusSelecionado === 'aberto') {
        receber = receber.filter(r => r.status.toLowerCase() === 'aberto');
      } else if (statusSelecionado === 'pago') {
        receber = receber.filter(r => r.status.toLowerCase() === 'pago');

      } else if (statusSelecionado === 'cancelado') {
        receber = receber.filter(r => r.status.toLowerCase() === 'cancelado');
      }

      dadosReceber = receber;
      paginaAtual = 1;
      renderizarPaginaReceber();
    })
    .catch(err => {
      alert('Erro ao listar receber: ' + err.message);
    });
}

function formatarDataBRL(dataISO) {
  if (!dataISO) return '';
  const dataSomente = dataISO.split('T')[0]; 
  const [ano, mes, dia] = dataSomente.split('-');
  return `${dia}/${mes}/${ano}`;
}

function renderizarPaginaReceber() {
  const tabela = document.getElementById('tabelaReceber');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const paginaDados = dadosReceber.slice(inicio, fim);

  let totalOriginal = 0;
  let totalPago = 0;

  if (paginaDados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;">Nenhuma conta encontrada.</td></tr>';
  } else {
    paginaDados.forEach(r => {
      totalOriginal += parseFloat(r.valororiginal);
      totalPago += parseFloat(r.valorpago);

      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${r.controle}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${r.funcionario}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${r.nomecliente}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: right;">R$ ${parseFloat(r.valororiginal).toFixed(2)}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: right;">R$ ${parseFloat(r.valorpago).toFixed(2)}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${r.numeroparcela}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${r.totalparcelas}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${formatarDataBRL(r.datacadastro)}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${formatarDataBRL(r.datavencimento)}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${r.datapagamento ? formatarDataBRL(r.datapagamento) : 'PENDIENTE'}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: right;">${parseFloat(r.multa).toFixed(2)}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: right;">${parseFloat(r.juros).toFixed(2)}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${r.status}</td>
        <td style="border:1px solid #ccc;text-align:center;">
          <button class="btnExcluirReceber" title="Cancelar conta" data-controle="${r.controle}">🗑️</button>
        </td>
      `;
      tbody.appendChild(linha);
    });

    const linhaTotal = document.createElement('tr');
    linhaTotal.style.fontWeight = 'bold';
    linhaTotal.innerHTML = `
      <td colspan="3" style="text-align:right;">Totais:</td>
      <td>R$ ${totalOriginal.toFixed(2)}</td>
      <td>R$ ${totalPago.toFixed(2)}</td>
      <td colspan="9"></td>
    `;
    tbody.appendChild(linhaTotal);      
    configurarBotoesExcluirReceber();
  }  

  tabela.style.display = 'table';
  renderizarPaginacao();
}

function configurarBotoesExcluirReceber() {
  document.querySelectorAll('.btnExcluirReceber').forEach(botao => {
    const controle = botao.getAttribute('data-controle');
    if (!controle) return;

    Object.assign(botao.style, {
      backgroundColor: 'rgb(8, 8, 233)',
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
    const handler = () => removerReceber(controle);
    botao.addEventListener('click', handler);
    botao._handlerExcluir = handler;
  });
}


function renderizarPaginacao() {
  const totalPaginas = Math.ceil(dadosReceber.length / itensPorPagina);
  const paginacao = document.getElementById('paginacaoReceber');
  if (!paginacao) return;

  paginacao.innerHTML = '';

  if (totalPaginas <= 1) return;

  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = 'Anterior';
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.style.backgroundColor = 'rgb(8, 8, 233)';
  btnAnterior.style.color = '#fff';
  btnAnterior.style.border = 'none';
  btnAnterior.style.padding = '10px 16px';
  btnAnterior.style.borderTopLeftRadius = '20px';
  btnAnterior.style.borderBottomLeftRadius = '20px';
  btnAnterior.style.cursor = 'pointer';
  btnAnterior.style.fontWeight = 'bold';
  btnAnterior.onclick = () => {
  paginaAtual--;
  renderizarPaginaReceber();
};

  paginacao.appendChild(btnAnterior);

  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtual} de ${totalPaginas} `;
  span.style.margin = '0 10px';
  paginacao.appendChild(span);

  const btnProximo = document.createElement('button');
  btnProximo.textContent = 'Próxima';
  btnProximo.disabled = paginaAtual === totalPaginas;
  btnProximo.style.backgroundColor = 'rgb(8, 8, 233)';
  btnProximo.style.color = '#fff';
  btnProximo.style.border = 'none';
  btnProximo.style.padding = '10px 16px';
  btnProximo.style.borderTopRightRadius = '20px';
  btnProximo.style.borderBottomRightRadius = '20px';
  btnProximo.style.cursor = 'pointer';
  btnProximo.style.fontWeight = 'bold';
  btnProximo.style.color = '#fff';
  btnProximo.onclick = () => {
    paginaAtual++;
    renderizarPaginaReceber();
  };
  paginacao.appendChild(btnProximo);
}

  function removerReceber(controle) {    
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
      texto.textContent = 'Deseja realmente cancelar essa Parcela?';
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
        fetch(`/receber/cancelar/${controle}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
        })
        .then(async res => {
        const data = await res.json();

        if (!res.ok) {
          showToast(data.erro || 'Não foi possível cancelar a parcela', 3000);
        return;
        }
        showToast(data.mensagem || 'Parcela cancelada com sucesso!', 2500);    
        limparNome();
        document.getElementById('formPresenta').style.display = 'none';
        document.getElementById('formListaReceber').style.display = 'block';
        document.getElementById('btnRec').click();
      })
      .catch(() => {
        showToast('Erro de comunicação com o servidor', 3000);
      });
      };      
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
  }