let dadosServicos = [];
let paginaAtualServicos = 1;
const itensPorPaginaServicos = 13;

function listaservico() {    
  limparNome();   
  document.getElementById('formPresenta').style.display = 'none';   
  document.getElementById('formPainel').style.display = 'none';         
  document.getElementById('formListaServicos').style.display = 'block';    
  fetch('/produtos/servicos')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar produtos');
      return res.json();
    })
    .then(produtos => {
      dadosServicos = produtos;
      paginaAtualServicos = 1;
      renderizarPaginaServicos();
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

function renderizarPaginaServicos() {
  const tabela = document.getElementById('tabelaServicos');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';
  const inicio = (paginaAtualServicos - 1) * itensPorPaginaServicos;
  const fim = inicio + itensPorPaginaServicos;
  const pagina = dadosServicos.slice(inicio, fim);

  if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhum produto cadastrado.</td></tr>';
  } else {
    pagina.forEach(produto => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td style="text-align: center;">${produto.controle}</td>
        <td>${produto.produto}</td>        
        <td style="text-align: right;">${produto.precovenda.toFixed(2)}</td>
        <td style="text-align: right;">${produto.duracao ? `Hs ${converterDecimalParaHora(produto.duracao)}` : ''}</td>
        </td>

        <td style="text-align: center;">${produto.ativop}</td>
        <td>
          <button class="btnEditar"  data-controle="${produto.controle}">✏️</button>
          <button class="btnExcluir" data-controle="${produto.controle}">🗑️</button>
          <button class="btnVer" data-controle="${produto.controle}">👁️</button>
        </td>
      `;
      tbody.appendChild(linha);
    });
    configurarBotoesServico();
  }
  tabela.style.display = 'table';
  renderizarPaginacaoServicos();
}

function renderizarPaginacaoServicos() {
  const totalPaginas = Math.ceil(dadosServicos.length / itensPorPaginaServicos);
  const paginacao = document.getElementById('paginacaoServicos');
  if (!paginacao) return;

  paginacao.innerHTML = '';

  if (totalPaginas <= 1) return;

  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = 'Anterior';
  btnAnterior.disabled = paginaAtualServicos === 1; 
  btnAnterior.style.backgroundColor = '#0867c7ff';
  btnAnterior.style.color = '#fff';
  btnAnterior.style.border = 'none';
  btnAnterior.style.padding = '10px 16px';
  btnAnterior.style.borderTopLeftRadius = '20px';
  btnAnterior.style.borderBottomLeftRadius = '20px';
  btnAnterior.style.cursor = 'pointer';
  btnAnterior.style.fontWeight = 'bold';
  btnAnterior.onclick = () => {
    paginaAtualServicos--;
    renderizarPaginaServicos();
  };

  const btnProximo = document.createElement('button');
  btnProximo.textContent = 'Próxima';
  btnProximo.disabled = paginaAtualServicos === totalPaginas;
  btnProximo.style.backgroundColor = '#0867c7ff';  
  btnProximo.style.border = 'none';
  btnProximo.style.padding = '10px 16px';
  btnProximo.style.borderTopRightRadius = '20px';
  btnProximo.style.borderBottomRightRadius = '20px';
  btnProximo.style.cursor = 'pointer';
  btnProximo.style.fontWeight = 'bold';
  btnProximo.style.color = '#fff';
  btnProximo.onclick = () => {
    paginaAtualServicos++;
    renderizarPaginaServicos();
  };

  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtualServicos} de ${totalPaginas} `;
  span.style.margin = '0 10px';

  [btnAnterior, span, btnProximo].forEach(el => paginacao.appendChild(el));
}

function configurarBotoesServico() {
  const estiloBotao = {
    backgroundColor: '#1476dfff',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    marginTop: '5px'
  };

  const acoes = [
    {
      classe: '.btnEditar',
      handler: (controle) => EditarServico(controle)
    },
    {
      classe: '.btnExcluir',
      handler: (controle) => removerServico(controle)
    },
    {
      classe: '.btnVer',
      handler: (controle) => VisualizarServico(controle)
    }
  ];

  acoes.forEach(({ classe, handler }) => {
    document.querySelectorAll(classe).forEach(botao => {      
      Object.assign(botao.style, estiloBotao);      
      const pai = botao.parentElement;
      if (pai && !pai.classList.contains('coluna-botoes')) {
        pai.classList.add('coluna-botoes');
      }

      botao.addEventListener('click', () => {
        const controle = botao.getAttribute('data-controle');
        handler(controle);
      });
    });
  });
}

  function removerServico(controle) {      
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
      texto.textContent = 'Deseja realmente excluir este produto?';
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
    
        fetch(`/produtos/${controle}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error();
            result = "Serviço removido com sucesso!";  
            showToast(result, 2500);                                                                             
            limparNome();
            document.getElementById('formPresenta').style.display = 'none'; 
            document.getElementById('formListaServicos').style.display = 'block';
            document.getElementById('btnListaservico').click();
          })
          .catch(() => alert('Erro ao remover produto.'));
      };        
      
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
  }