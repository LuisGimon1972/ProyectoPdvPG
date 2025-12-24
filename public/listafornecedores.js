// Variáveis globais
let dadosFornecedores = [];
let paginaAtualFornecedores = 1;
const itensPorPaginaFornecedores = 12;

function listafornecedor() {
  limparNome();
  document.getElementById('formPresenta').style.display = 'none';
  document.getElementById('formPainel').style.display = 'none';      
  document.getElementById('formListaFornecedores').style.display = 'block';
  fetch('/fornecedores')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar fornecedor');
      return res.json();
    })
    .then(fornecedores => {
      dadosFornecedores = fornecedores;
      paginaAtualFornecedores = 1;
      renderizarPaginaFornecedores();
    })
    .catch(err => {
      alert('Erro ao listar fornecedores: ' + err.message);
    });
}

function renderizarPaginaFornecedores() {
  const tabela = document.getElementById('tabelaFornecedores');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';
  const inicio = (paginaAtualFornecedores - 1) * itensPorPaginaFornecedores;
  const fim = inicio + itensPorPaginaFornecedores;
  const pagina = dadosFornecedores.slice(inicio, fim);
  if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhum fornecedor cadastrado.</td></tr>';
  } else {
    pagina.forEach(fornecedor => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${fornecedor.cnpj}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${fornecedor.ie}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${fornecedor.fornecedor}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${fornecedor.email || ''}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${fornecedor.telefone || ''}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${fornecedor.celular || ''}</td>
        <td style="border:1px solid #ccc;">
          <button class="btnEditarfo" data-controle="${fornecedor.controle}">✏️</button>
          <button class="btnExcluirfo" data-controle="${fornecedor.controle}">🗑️</button>
          <button class="btnVerfo" data-controle="${fornecedor.controle}">👁️</button>
        </td>
      `;
      tbody.appendChild(linha);
    });
    configurarBotoesFornecedores();
  }
  tabela.style.display = 'table';
  renderizarPaginacaoFornecedores();
}

function configurarBotoesFornecedores() {
  const acoes = [
    {
      classe: '.btnEditarfo',
      handler: (controle) => {
        if (controle != 1) {
          EditarFornecedore(controle);
        } else {
          showToast("Impossível alterar o Fornecedor Padrão!", 2500);
        }
      }
    },
    {
      classe: '.btnExcluirfo',
      handler: (controle) => {
        if (controle != 1) {
          removerFornecedor(controle);
        } else {
          showToast("Impossível excluir o Fornecedor Padrão!", 2500);
        }
      }
    },
    {
      classe: '.btnVerfo',
      handler: (controle) => VisualizarFornecedor(controle)
    }
  ];

  acoes.forEach(({ classe, handler }) => {
    document.querySelectorAll(classe).forEach(botao => {
      aplicarEstiloBotao(botao);    
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


function renderizarPaginacaoFornecedores() {
  const totalPaginas = Math.ceil(dadosFornecedores.length / itensPorPaginaFornecedores);
  const paginacao = document.getElementById('paginacaoFornecedores');
  if (!paginacao) return;

  paginacao.innerHTML = '';
  if (totalPaginas <= 1) return;

  const btnAnterior = criarBotaoPaginacao('Anterior', paginaAtualFornecedores === 1, () => {
    paginaAtualFornecedores--;
    renderizarPaginaFornecedores();
  });

  const btnProximo = criarBotaoPaginacao('Próxima', paginaAtualFornecedores === totalPaginas, () => {
    paginaAtualFornecedores++;
    renderizarPaginaFornecedores();
  });

  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtualFornecedores} de ${totalPaginas} `;
  span.style.margin = '0 10px';
  paginacao.appendChild(btnAnterior);
  paginacao.appendChild(span);
  paginacao.appendChild(btnProximo);
}

function criarBotaoPaginacao(texto, desabilitado, onClick) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  btn.disabled = desabilitado;
  btn.onclick = onClick;

  Object.assign(btn.style, {
    backgroundColor: '#f1ab13',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  });

  if (texto === 'Anterior') {
    btn.style.borderTopLeftRadius = '20px';
    btn.style.borderBottomLeftRadius = '20px';
  } else {
    btn.style.borderTopRightRadius = '20px';
    btn.style.borderBottomRightRadius = '20px';
  }

  return btn;
}

function aplicarEstiloBotao(botao) {
  Object.assign(botao.style, {
    backgroundColor: '#f1ab13',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    marginTop: '5px',
    cursor: 'pointer'
  });
}


  function removerFornecedor(controle) {    
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
      texto.textContent = 'Deseja realmente excluir este Fornecedor?';
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
    
        fetch(`/fornecedores/${controle}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error();
            result = "Fornecedor removido com sucesso!";  
            showToast(result, 2500);                                                             
            resultado.style.color = "green";                
            resultado.style.display = "block";  
            esperar();         
            limparNome();
            document.getElementById('formPresenta').style.display = 'none'; 
            document.getElementById('formListaFornecedores').style.display = 'block';
            document.getElementById('btnListarfo').click();
          })
          .catch(() => alert('Erro ao remover fornecedor.'));
      };        
      
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
  }