let dadosProdutos = [];
let paginaAtualProdutos = 1;
const itensPorPaginaProdutos = 13;

function listaproduto() {    
  limparNome();   
  document.getElementById('formPainel').style.display = 'none';      
  document.getElementById('formPresenta').style.display = 'none';      
  document.getElementById('btnSalvarCliente').style.display = 'none';
  document.getElementById('btnAlterarCliente').style.display = 'none';    
  document.getElementById('formProduto').style.display = 'none';    
  document.getElementById('formListaItens').style.display = 'block';  
  document.getElementById("produto").focus();
  fetch('/produtos')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar produtos');
      return res.json();
    })
    .then(produtos => {
      dadosProdutos = produtos;
      paginaAtualProdutos = 1;
      renderizarPaginaProdutos();
    })
    .catch(err => {
      alert('Erro ao listar produtos: ' + err.message);
    });
}

function renderizarPaginaProdutos() {
  const tabela = document.getElementById('tabelaProdutos');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';
  const inicio = (paginaAtualProdutos - 1) * itensPorPaginaProdutos;
  const fim = inicio + itensPorPaginaProdutos;
  const pagina = dadosProdutos.slice(inicio, fim);

  if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhum produto cadastrado.</td></tr>';
  } else {
    pagina.forEach(produto => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td style="font-size: 12px;border:1px solid #ccc;text-align: center;height:30px">${produto.controle}</td>
        <td style="font-size: 12px;border:1px solid #ccc;height:30px">${produto.produto}</td>
        <td style="font-size: 12px;border:1px solid #ccc;height:30px">${produto.codbarras}</td>                
        <td style="font-size: 12px;border:1px solid #ccc;text-align: right;height:30px">${parseFloat(produto.quantidade).toFixed(2)}</td>
        <td style="font-size: 12px;border:1px solid #ccc;text-align: right;height:30px">R$ ${parseFloat(produto.precocusto).toFixed(2)}</td>
        <td style="font-size: 12px;border:1px solid #ccc;text-align: right;height:30px">R$ ${parseFloat(produto.precovenda).toFixed(2)}</td>        
        <td style="border:1px solid #ccc;height:30px">
          <button class="btnEditar"  data-controle="${produto.controle}">✏️</button>
          <button class="btnExcluir" data-controle="${produto.controle}">🗑️</button>
          <button class="btnVer" data-controle="${produto.controle}">👁️</button>
        </td>
      `;
      tbody.appendChild(linha);
    });
    configurarBotoesProduto();
  }
  tabela.style.display = 'table';
  renderizarPaginacaoProdutos();
}

function renderizarPaginacaoProdutos() {
  const totalPaginas = Math.ceil(dadosProdutos.length / itensPorPaginaProdutos);
  const paginacao = document.getElementById('paginacaoProdutos');
  if (!paginacao) return;

  paginacao.innerHTML = '';

  if (totalPaginas <= 1) return;

  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = 'Anterior';
  btnAnterior.disabled = paginaAtualProdutos === 1; 
  btnAnterior.style.backgroundColor = 'rgb(8, 8, 233)';
  btnAnterior.style.color = '#fff';
  btnAnterior.style.border = 'none';
  btnAnterior.style.padding = '10px 16px';
  btnAnterior.style.borderTopLeftRadius = '20px';
  btnAnterior.style.borderBottomLeftRadius = '20px';
  btnAnterior.style.cursor = 'pointer';
  btnAnterior.style.fontWeight = 'bold';
  btnAnterior.onclick = () => {
    paginaAtualProdutos--;
    renderizarPaginaProdutos();
  };

  const btnProximo = document.createElement('button');
  btnProximo.textContent = 'Próxima';
  btnProximo.disabled = paginaAtualProdutos === totalPaginas;
  btnProximo.style.backgroundColor = 'rgb(8, 8, 233)';  
  btnProximo.style.border = 'none';
  btnProximo.style.padding = '10px 16px';
  btnProximo.style.borderTopRightRadius = '20px';
  btnProximo.style.borderBottomRightRadius = '20px';
  btnProximo.style.cursor = 'pointer';
  btnProximo.style.fontWeight = 'bold';
  btnProximo.style.color = '#fff';
  btnProximo.onclick = () => {
    paginaAtualProdutos++;
    renderizarPaginaProdutos();
  };

  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtualProdutos} de ${totalPaginas} `;
  span.style.margin = '0 10px';

  [btnAnterior, span, btnProximo].forEach(el => paginacao.appendChild(el));
}

function configurarBotoesProduto() {
  const estiloBotao = {
    backgroundColor: 'rgb(8, 8, 233)',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    marginTop: '5px'
  };

  const acoes = [
    {
      classe: '.btnEditar',
      handler: (controle) => EditarProduto(controle)
    },
    {
      classe: '.btnExcluir',
      handler: (controle) => removerProduto(controle)
    },
    {
      classe: '.btnVer',
      handler: (controle) => VisualizarProduto(controle)
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

  function removerProduto(controle) {      
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
            result = "Produto removido com sucesso!";  
            showToast(result, 2500);                                                                             
            limparNome();
            document.getElementById('formPresenta').style.display = 'none'; 
            document.getElementById('formListaItens').style.display = 'block';
            document.getElementById('btnListarp').click();
          })
          .catch(() => alert('Erro ao remover produto.'));
      };        
      
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };

  }