const formCadastro = document.getElementById('formCadastro');
const btnCarregar = document.getElementById('btn-carregar');
btnCarregar.addEventListener('click', () => {
  limparNome();   
  document.getElementById('formPresenta').style.display = 'none'; 
  formCadastro.style.display = 'block';  
  document.getElementById('formPainel').style.display = 'none';       
  document.getElementById('nome').focus()      
});

btnAdicionar.disabled = true;

document.addEventListener('DOMContentLoaded', () => {
  const nomeInput = document.getElementById('nome');    
  const emailInput = document.getElementById('email');
  const senhaInput1 = document.getElementById('senha_1');
  const senhaInput2 = document.getElementById('senha_2');  
  nomeInput.focus();
  nomeInput.addEventListener('input', () => {
    nomeInput.value = nomeInput.value.toUpperCase();
  });
  
  nomeInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      senhaInput1.focus();
    }
  });

  senhaInput1.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      senhaInput2.focus();
    }
  });
  
  function validarSenhas() {
  const senha1 = senhaInput1.value.trim();
  let senha2 = senhaInput2.value.trim();
  
  if (senha2.length > senha1.length) {
    senhaInput2.value = senha2.slice(0, senha1.length);
    senha2 = senhaInput2.value;
  }

  if (senha1.length === senha2.length) {
    if (!senha2 || senha1 !== senha2) {
      showToast("As senhas não coincidem!", 2500); 
      btnAdicionar.disabled = true;                  
      senhaInput2.value = "";   
      senhaInput2.focus();   
      return;
    } else {
      btnAdicionar.disabled = false;
    }
  } else {    
    btnAdicionar.disabled = true;
  }
}

senhaInput1.addEventListener("input", () => {
  senhaInput2.maxLength = senhaInput1.value.length; // 🔒 trava limite
});
 
senhaInput2.addEventListener('input', validarSenhas);

const btnAdiciona = document.getElementById('btnAdicionar');

btnAdiciona.addEventListener("mouseover", () => {
  if (btnAdiciona.disabled) {
    if (
  senhaInput1.value.trim() === '' || 
  senhaInput2.value.trim() === '' || 
  nomeInput.value.trim() === '') {
  showToast("⚠️ Preencha os campos obrigatórios(*) antes de continuar!", 2500);
  }
  }
});

    const btnAdicionar = document.getElementById('btnAdicionar');
    const btnSalvar = document.getElementById('btnSalvarCliente');
    const lista = document.getElementById('lista');
    estilizarBotao(btnSalvar, handleAdicionarCliente());
    estilizarBotao(btnAdicionar, handleAdicionar);
    btnAdicionar.addEventListener('click', handleAdicionar);
    btnAdicionar.disabled = true;
    carregarUsuarios();
    function limparCampos() {
      nomeInput.value = '';
      senhaInput1.value = '';
      senhaInput2.value = '';
      emailInput.value = '';
    }
  
    function renderizarLista(usuarios) {
      lista.innerHTML = '';
      usuarios.forEach(usuario => lista.appendChild(criarItemUsuario(usuario)));
    }
  
    function criarItemUsuario({ id, nome, email, senha_1, senha_2 }) {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.padding = '8px 12px';
      li.style.borderBottom = '1px solid #ccc';
      const info = document.createElement('span');
      info.innerHTML = `<strong>${nome}</strong> - ${email}`;      
      const btnExcluir = criarBotao('🗑️ Excluir', () => {
        if (id != 1) {
          apagarUsuario(id);
        } else {
          showToast("Impossível excluir o Usuário Padrão!", 2500);
        }
      });      
      estilizarBotao2(1, btnExcluir);
      const grupoBotoes = document.createElement('div');
      grupoBotoes.style.display = 'flex';
      grupoBotoes.style.gap = '8px';      
      grupoBotoes.appendChild(btnExcluir);
      li.appendChild(info);
      li.appendChild(grupoBotoes);
      return li;
    }
    function criarBotao(texto, onClick) {
      const btn = document.createElement('button');
      btn.textContent = texto;
      btn.onclick = onClick;
      return btn;
    }
  function handleAdicionar() {
  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput2.value.trim(); 

  if (!nome || !senha) {    
    showToast("Por favor, preencha todos os campos.!", 2500);
    return;
  }

  btnAdicionar.disabled = true;

  fetch('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }) 
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.json();
    })
    .then(() => {
      limparCampos();        
      carregarUsuarios();     
    })
    .catch(err => alert('Erro: ' + err.message))
    .finally(() => {
      btnAdicionar.disabled = false; 
    });
}

  function carregarUsuarios() {    
      fetch('/usuarios')
        .then(res => res.json())
        .then(renderizarLista)
        .catch(() => alert('Erro ao carregar usuários.'));     
        document.getElementById('nome').focus()    
    }

    function apagarUsuario(id) {
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
  texto.textContent = 'Deseja realmente excluir este usuário?';
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
    fetch(`/usuarios/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error();
          carregarUsuarios();
        })
        .catch(() => alert('Erro ao remover usuário.'));
  };

  btnCancelar.onclick = () => {
    document.body.removeChild(modal);
  };
}  
    
  function handleAdicionarCliente() {    
    }  
  });  

  document.addEventListener('DOMContentLoaded', function () {
  const campos7 = [
    ["nome", "senha_1"],
    ["senha_1", "senha_2"],
    ["senha_2", "email"],    
    ["email", "btnAdicionar"]    
  ];

  campos7.forEach(([de, para]) => {
    const elemDe = document.getElementById(de);
    const elemPara = document.getElementById(para);
    if (elemDe && elemPara) {
      elemDe.addEventListener("keydown", function (event) {
        if (event.key === "Enter") elemPara.focus();
      });
    }
  });  
});