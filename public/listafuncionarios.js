let dadosFuncionarios = [];
let paginaAtualFuncionarios = 1;
const itensPorPaginaFuncionarios = 10;

function listafuncionario() {
  limparNome();
  document.getElementById('formPresenta').style.display = 'none';
  document.getElementById('formPainel').style.display = 'none';      
  document.getElementById('formListaFuncionarios').style.display = 'block';

  fetch('/funcionarios')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar funcionários');
      return res.json();
    })
    .then(funcionarios => {
      dadosFuncionarios = funcionarios;
      paginaAtualFuncionarios = 1;
      renderizarPaginaFuncionarios();
    })
    .catch(err => {
      alert('Erro ao listar funcionários: ' + err.message);
    });
}

function renderizarPaginaFuncionarios() {
  const tabela = document.getElementById('tabelaFuncionarios');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';

  const inicio = (paginaAtualFuncionarios - 1) * itensPorPaginaFuncionarios;
  const fim = inicio + itensPorPaginaFuncionarios;
  const pagina = dadosFuncionarios.slice(inicio, fim);

  if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhum funcionário cadastrado.</td></tr>';
  } else {
    pagina.forEach(funcionario => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td style="font-size: 12px;border:1px solid #ccc;text-align: center;">${funcionario.cpff}</td>
        <td style="font-size: 12px;border:1px solid #ccc;">${funcionario.rgf}</td>
        <td style="font-size: 12px;border:1px solid #ccc;">${funcionario.funcionariof}</td>
        <td style="font-size: 12px;border:1px solid #ccc;">${funcionario.funcaof ||''}</td>
        <td style="font-size: 12px;border:1px solid #ccc;">${funcionario.e_mailf ||''}</td>
        <td style="font-size: 12px;border:1px solid #ccc;">${funcionario.telefonef ||''}</td>
        <td style="font-size: 12px;border:1px solid #ccc;">
          <button class="btnEditarf" data-controle="${funcionario.controle}">✏️</button>
          <button class="btnExcluirf" data-controle="${funcionario.controle}">🗑️</button>
          <button class="btnVerf" data-controle="${funcionario.controle}">👁️</button>
        </td>
      `;
      tbody.appendChild(linha);
    });
    configurarBotoesFuncionarios();
  }
  tabela.style.display = 'table';
  renderizarPaginacaoFuncionarios();
}

function configurarBotoesFuncionarios() {
  const acoes = [
    {
      classe: '.btnEditarf',
      handler: (controle) => {
        if (controle != 1) {
          EditarFuncionario(controle);
        } else {
          showToast("Impossível alterar o Funcionário Padrão!", 2500);
        }
      }
    },
    {
      classe: '.btnExcluirf',
      handler: (controle) => {
        if (controle != 1) {
          removerFuncionario(controle);
        } else {
          showToast("Impossível remover o Funcionário Padrão!", 2500);
        }
      }
    },
    {
      classe: '.btnVerf',
      handler: (controle) => {
        VisualizarFuncionario(controle);
      }
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

function aplicarEstiloBotao(botao) {
  Object.assign(botao.style, {
    backgroundColor: 'rgb(8, 8, 233)',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    marginTop: '5px',
    cursor: 'pointer'
  });
}

function renderizarPaginacaoFuncionarios() {
  const totalPaginas = Math.ceil(dadosFuncionarios.length / itensPorPaginaFuncionarios);
  const paginacao = document.getElementById('paginacaoFuncionarios');
  if (!paginacao) return;
  paginacao.innerHTML = '';
  if (totalPaginas <= 1) return;
  const btnAnterior = criarBotaoPaginacao('Anterior', paginaAtualFuncionarios === 1, () => {
    paginaAtualFuncionarios--;
    renderizarPaginaFuncionarios();
  });
  const btnProximo = criarBotaoPaginacao('Próxima', paginaAtualFuncionarios === totalPaginas, () => {
    paginaAtualFuncionarios++;
    renderizarPaginaFuncionarios();
  });
  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtualFuncionarios} de ${totalPaginas} `;
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
    backgroundColor: 'rgb(8, 8, 233)',
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

  function removerFuncionario(controle) {    
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
      texto.textContent = 'Deseja realmente excluir este funcionário?';
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
        fetch(`/funcionarios/${controle}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error();
            result = "Funcionário removido com sucesso!";  
            showToast(result, 2500);                                                             
            resultado.style.color = "green";                
            resultado.style.display = "block";  
            esperar();         
            limparNome();
            document.getElementById('formPresenta').style.display = 'none'; 
            document.getElementById('formListaFuncionarios').style.display = 'block';
            document.getElementById('btnListarf').click();
          })
          .catch(() => alert('Erro ao remover produto.'));
      };              
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
  }