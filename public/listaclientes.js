let dadosClientes = [];
let paginaAtualClientes = 1;
let controleaux
const itensPorPaginaClientes = 12;

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

const btnLista = document.getElementById('btnListar');
const formLista = document.getElementById('formLista');

btnLista.addEventListener('click', () => {
  limparNome();
  document.getElementById('formPresenta').style.display = 'none';
  document.getElementById('formPainel').style.display = 'none';      
  formLista.style.display = 'block';

  fetch('/clientes')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar clientes');
      return res.json();
    })
    .then(clientes => {
      dadosClientes = clientes;
      paginaAtualClientes = 1;
      renderizarPaginaClientes();
    })
    .catch(err => alert('Erro ao listar clientes: ' + err.message));
});

function renderizarPaginaClientes() {
  const tabela = document.getElementById('tabelaClientes');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';

  const inicio = (paginaAtualClientes - 1) * itensPorPaginaClientes;
  const fim = inicio + itensPorPaginaClientes;
  const pagina = dadosClientes.slice(inicio, fim);

  if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhum cliente cadastrado.</td></tr>';
  } else {
    pagina.forEach(cliente => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${cliente.cpf || ''}</td>
        <td style="font-size: 10px;border:1px solid #ccc;text-align: center;">${cliente.cnpj || ''}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${cliente.cliente}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${cliente.e_mail || ''}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${cliente.telefone || ''}</td>
        <td style="font-size: 10px;border:1px solid #ccc;">${cliente.cidade || ''}</td>
        <td style="border:1px solid #ccc;">
          <button class="btnEditar" data-controle="${cliente.controle}">✏️</button>
          <button class="btnExcluir" data-controle="${cliente.controle}">🗑️</button>
          <button class="btnVer" data-controle="${cliente.controle}">👁️</button>
        </td>
      `;
      tbody.appendChild(linha);
    });

    configurarBotoesClientes();
  }

  tabela.style.display = 'table';
  renderizarPaginacaoClientes();
}

function configurarBotoesClientes() {
  const acoes = [
    {
      classe: '.btnEditar',
      handler: (controle) => {
        if (controle != 1) {
          controleaux = controle
          EditarCliente(controle);
        } else {
          showToast("Impossível alterar o Consumidor Padrão!", 2500);
        }
      }
    },
    {
      classe: '.btnExcluir',
      handler: (controle) => {
        if (controle != 1) {
          removerCliente(controle);
        } else {
          showToast("Impossível remover o Consumidor Padrão!", 2500);
        }
      }
    },
    {
      classe: '.btnVer',
      handler: (controle) => {
        VerCliente(controle);
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
        const controle = botao.dataset.controle;
        handler(controle);
      });
    });
  });
}

function renderizarPaginacaoClientes() {
  const totalPaginas = Math.ceil(dadosClientes.length / itensPorPaginaClientes);
  const paginacao = document.getElementById('paginacaoClientes');
  if (!paginacao) return;

  paginacao.innerHTML = '';
  if (totalPaginas <= 1) return;

  const btnAnterior = criarBotaoPaginacao('Anterior', paginaAtualClientes === 1, () => {
    paginaAtualClientes--;
    renderizarPaginaClientes();
  });

  const btnProximo = criarBotaoPaginacao('Próxima', paginaAtualClientes === totalPaginas, () => {
    paginaAtualClientes++;
    renderizarPaginaClientes();
  });

  const span = document.createElement('span');
  span.textContent = ` Página ${paginaAtualClientes} de ${totalPaginas} `;
  span.style.margin = '0 10px';

  paginacao.append(btnAnterior, span, btnProximo);
}
  
    function removerCliente(controle) {
        
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
        texto.textContent = 'Deseja realmente excluir este cliente?';
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
      
          fetch(`/clientes/${controle}`, { method: 'DELETE' })
            .then(res => {
              if (!res.ok) throw new Error();
              result = "Cliente removido com sucesso!";  
              showToast(result, 2500);                                                                       
              limparNome();
              document.getElementById('formPresenta').style.display = 'none'; 
              document.getElementById('formLista').style.display = 'block';
              document.getElementById('btnListar').click();
            })
            .catch(() => alert('Erro ao remover cliente.'));
        };        
        
        btnCancelar.onclick = () => {
          document.body.removeChild(modal);
        };
      }