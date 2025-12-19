window.onload = function() {  
  verificarLogin();
}

window.addEventListener('load', () => {
  setTimeout(() => window.scrollTo(0, 0), 50);
});


function verificarLogin() {  
  const logado = sessionStorage.getItem('logado');
  const usuariologado = sessionStorage.getItem('usuario');
  controlarBotoesMenu(false)

  if (logado === 'sim') {    
    document.getElementById('nomeusuario').value = usuariologado
    usuariologadoF = usuariologado
    controlarBotoesMenu(true)
    iniciarSistema();    
  } else {
    document.getElementById('formLogin').style.display = 'flex';
    if (document.getElementById('formPdv')) {
      document.getElementById('formPdv').style.display = 'none';
    }
  }
}
let usuariologadoF
function validarLogin() {
  const usuario = document.getElementById('usuario').value.trim().toUpperCase();
  const senha = document.getElementById('senha').value.trim();

  if (!usuario || !senha) {
    showToast("Preencha usuário e senha!", 2500);
    return false;
  }

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, senha })
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.json();
    })
    .then(data => {
      sessionStorage.setItem('logado', 'sim');
      sessionStorage.setItem('usuario', data.nome);
      document.getElementById('nomeusuario').value = data.nome;
      usuariologadoF = data.nome;
      controlarBotoesMenu(true)
      showToast("Login bem-sucedido!", 2500);
      iniciarSistema();
    })
    .catch(err => {
      showToast(err.message || "Usuário ou senha inválidos!", 2500);
    });

  return false;
}

function iniciarSistema() {
  document.getElementById('formLogin').style.display = 'none';  
  pessoa()
  //buscarEmitente()
}

function logout() {
  sessionStorage.removeItem('logado');
  location.reload();
}

function criarBotaoLogoutComDialog() {  
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
  imagem.src = 'https://cdn-icons-png.flaticon.com/512/1828/1828665.png'; // ícone de logout (porta saída)
  imagem.alt = 'Sair';
  imagem.style.cssText = 'width: 50px; margin-bottom: 10px;';

  const texto = document.createElement('p');
  texto.textContent = 'Deseja realmente sair do Sistema?';
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
    window.scrollTo(0, 0);
    logout()
  };

  btnCancelar.onclick = () => {
    window.scrollTo(0, 0);
    document.body.removeChild(modal);
  };
}

  let emitenteNome = "";
  let emitenteTelefone = "";
  let emitenteDoc = "";
  async function buscarEmitente() {
    try {    
      const resp = await fetch("/emitente"); 
      const dados = await resp.json();
      if (dados && dados.length > 0) {
        const respEmit = await fetch("/emitente/1"); 
        const emit = await respEmit.json();
        if (emit) {
          emitenteNome = emit.emitente || "";
          emitenteTelefone = emit.telefone || emit.celular;
          emitenteDoc = emit.cnpj || emit.cpf || "";         
          const labelEmitente = document.getElementById('nomeemitente');
          if (labelEmitente) {
            labelEmitente.innerText = emitenteNome + '  |  ' + 'CPF/CNPJ: ' + emitenteDoc
          }          
        }
      } else {
        controlarBotoesMenu(false)
        resul = "⚠️É necessário cadastrar os dados do emitente no sistema para prosseguir!";            
        showToastl(resul, 3500);            
        emitente()
      }
    } catch (err) {
      console.error("Erro ao verificar emitente:", err);
    }
  } 

  let camposFisica, camposJuridica
  function pessoa() {
    document.getElementById('limpa').click();        
    camposFisica = [
    'cpf', 'naturalidade', 'nacionalidade', 'rg' 
    ];
    camposJuridica = [
    'cnpj', 'fantasia', 'ie', 'im'
    ];
  }

function acerca()
{  
  limparNome();    
  document.getElementById('formPresenta').style.display = 'none';      
  document.getElementById('formAcerca').style.display = 'block'; 
}

function habilitarCampos(campos, desabilitar) {
  if (!Array.isArray(campos)) {
    console.warn('Parâmetro "campos" inválido:', campos);
    return;
  }

  campos.forEach(campo => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.disabled = desabilitar;
    } else {
      console.warn(`Elemento com id "${campo}" não encontrado.`);
    }
  });
}

function atualizarCamposTipoCliente() {
  const tipoClienteEl = document.querySelector('input[name="radtip"]:checked'); 
  const camposFisica = ['cpf', 'rg'];
  const camposJuridica = ['cnpj', 'fantasia', 'ie', 'im'];
  if (!tipoClienteEl) return;
  if (tipoClienteEl.value === 'fisica') {
    habilitarCampos(camposFisica, false);
    habilitarCampos(camposJuridica, true);
    document.getElementById("cnpj").value = "";
    document.getElementById("fantasia").value = "";
    document.getElementById("ie").value = "";
    document.getElementById("im").value = "";
    document.querySelector('input[name="radsex"][value="masculino"]').disabled = false;
    document.querySelector('input[name="radsex"][value="feminino"]').disabled = false;
    document.querySelectorAll('input[name="radciv"]').forEach(el => {
      el.disabled = false;
      document.getElementById("cpf").focus()
    });

  } else {
    habilitarCampos(camposFisica, true);
    habilitarCampos(camposJuridica, false);
    document.getElementById("cpf").value = "";
    document.getElementById("rg").value = "";
    document.querySelector('input[name="radsex"][value="masculino"]').disabled = true;
    document.querySelector('input[name="radsex"][value="feminino"]').disabled = true;
    document.querySelectorAll('input[name="radciv"]').forEach(el => {
      el.disabled = true;
      document.getElementById("cnpj").focus()
    });
  }
}

document.addEventListener('DOMContentLoaded', atualizarCamposTipoCliente);
const radiosTipoCliente = document.querySelectorAll('input[name="radtip"]');
radiosTipoCliente.forEach(radio => {
  radio.addEventListener('change', atualizarCamposTipoCliente);
});


let camposFisicae, camposJuridicae
  function pessoa() {
    document.getElementById('limpa').click();        
    camposFisicae = [
    'cpfe', 'naturalidadee', 'nacionalidadee', 'rge', 'radcive', 'radsexe' 
    ];
    camposJuridicae = [
    'cnpje'
    ];
  }


function habilitarCampose(campos, desabilitar) {
  if (!Array.isArray(campos)) {
    console.warn('Parâmetro "campos" inválido:', campos);
    return;
  }

  campos.forEach(campo => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.disabled = desabilitar;
    } else {
      console.warn(`Elemento com id "${campo}" não encontrado.`);
    }
  });
}

function atualizarCamposTipoClientee() {
  const tipoClienteEl = document.querySelector('input[name="radtipe"]:checked'); 
  const camposFisicae = ['cpfe', 'rge'];
  const camposJuridicae = ['cnpje'];
  if (!tipoClienteEl) return;
  if (tipoClienteEl.value === 'fisica') {
    habilitarCampose(camposFisicae, false);
    habilitarCampose(camposJuridicae, true);
    document.getElementById("cnpje").value = "";    
    document.getElementById("iee").value = "";
    document.getElementById("ime").value = "";
    document.querySelector('input[name="radsexe"][value="masculino"]').disabled = false;
    document.querySelector('input[name="radsexe"][value="feminino"]').disabled = false;         
    document.getElementById("labelData").textContent = "Data de Nascimento";
    const campoData = document.getElementById("datanascimentoe");  
    campoData.style.width = "160px"; 
    document.getElementById('naturalidadee').disabled = false;             
    document.getElementById('nacionalidadee').disabled = false;        
    document.querySelectorAll('input[name="radcive"]').forEach(el => {
      el.disabled = false;
      document.getElementById("cpfe").focus()
    });

  } else {
    habilitarCampose(camposFisicae, true);
    habilitarCampose(camposJuridicae, false);
    document.getElementById("cpfe").value = "";
    document.getElementById("rge").value = "";
    document.querySelector('input[name="radsexe"][value="masculino"]').disabled = true;
    document.querySelector('input[name="radsexe"][value="feminino"]').disabled = true;    
    document.getElementById("labelData").textContent = "Data  de  Fundação:";
    const campoData = document.getElementById("datanascimentoe");  
    campoData.style.width = "169px"; 
    document.getElementById('naturalidadee').disabled = true;    
    document.getElementById('nacionalidadee').disabled = true;        
    document.querySelectorAll('input[name="radcive"]').forEach(el => {
      el.disabled = true;
      document.getElementById("cnpje").focus()
    });
  }
}

document.addEventListener('DOMContentLoaded', atualizarCamposTipoClientee);
const radiosTipoClientee = document.querySelectorAll('input[name="radtipe"]');
radiosTipoClientee.forEach(radio => {
  radio.addEventListener('change', atualizarCamposTipoClientee);
});

function limparNome() {
    window.scrollTo(0, 0);
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById("cpf").value = "";
    document.getElementById("cliente").value = "";
    document.getElementById("rg").value = "";
    document.getElementById("e_mail").value = "";
    document.getElementById("numero").value = "";
    document.getElementById("datanascimento").value = "";
    document.getElementById("cep").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("estado").value = "";
    document.getElementById("ciudad").value = "";
    document.getElementById("estados").value = "";
    document.getElementById("pais").value = "";
    document.getElementById("nacionalidade").value = "";
    document.getElementById("naturalidade").value = "";
    document.getElementById("logradouro").value = "";
    document.getElementById("bairro").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("cnpj").value = "";  
    document.getElementById("ie").value = "";  
    document.getElementById("im").value = "";  
    document.getElementById("fantasia").value = "";  
    //Produtos
    document.getElementById('controle').value = "";
    document.getElementById('produto').value = "";
    document.getElementById('codbarras').value = "";
    document.getElementById('selectFornecedor').value = "";
    document.getElementById('grupo').value = "";
    document.getElementById('subgrupo').value = "";
    document.getElementById('marca').value = "";
    document.getElementById('precocusto').value = "";
    document.getElementById('perclucro').value = "";
    document.getElementById('precovenda').value = "";
    document.getElementById('precorevenda').value = "";
    document.getElementById('precoatacado').value = "";
    document.getElementById('quantidade').value = "";
    document.getElementById('quantidademin').value = "";
    document.getElementById('quantidademax').value = "";
    // Fim produtos
    //Funcionarios
    document.getElementById('funcionario').value = "";
    document.getElementById('funcaof').value = "";
    document.getElementById('cpff').value = "";
    document.getElementById('rgf').value = "";
    document.getElementById('cepf').value = "";
    document.getElementById('logradourof').value = "";
    document.getElementById('bairrof').value = "";
    document.getElementById('numerof').value = "";
    document.getElementById('estadosf').value = "";
    document.getElementById('ciudadf').value = "";
    document.getElementById('telefonef').value = "";
    document.getElementById('celularf').value = "";
    document.getElementById('datanascimentof').value = "";
    document.getElementById('datanaadmissaof').value = "";
    document.getElementById('e_mailf').value = "";
    document.querySelector('input[name="radsexf"][value="masculino"]').checked = true;
    document.querySelector('input[name="radcivf"][value="solteiro"]').checked = true;    
    
    document.getElementById('fornecedore').value = "";    
    document.getElementById('cnpjfo').value = "";    
    document.getElementById('iefo').value = "";    
    document.getElementById('cepfo').value = "";
    document.getElementById('logradourofo').value = "";
    document.getElementById('bairrofo').value = "";
    document.getElementById('numerofo').value = "";
    document.getElementById('estadosfo').value = "";
    document.getElementById('ciudadfo').value = "";
    document.getElementById('telefonefo').value = "";
    document.getElementById('celularfo').value = "";       
    document.getElementById('e_mailfo').value = "";    
    
    document.querySelector('input[name="radtip"][value="fisica"]').checked = true;
    document.getElementById('formCadastro').style.display = 'none';
    document.getElementById('formCliente').style.display = 'none';
    document.getElementById('formEmitente').style.display = 'none';
    document.getElementById('formFuncionario').style.display = 'none';
    document.getElementById('formLista').style.display = 'none';      
    document.getElementById('formProduto').style.display = 'none'; 
    document.getElementById('btnSalvarCliente').style.display = 'none';
    document.getElementById('btnAlterarCliente').style.display = 'none';
    document.getElementById('formListaItens').style.display = 'none';
    document.getElementById('formListaFuncionarios').style.display = 'none';
    document.getElementById('formFornecedor').style.display = 'none'; 
    document.getElementById('formListaFornecedores').style.display = 'none';    
    document.getElementById('formListaReceber').style.display = 'none';     
    document.getElementById('formListaReceberCliente').style.display = 'none';            
    document.getElementById('formListaPagarFornecedor').style.display = 'none';                
    document.getElementById('formListaPagar').style.display = 'none';            
    document.getElementById('formListaCaixa').style.display = 'none';    
    document.getElementById('formListaOS').style.display = 'none';        
    document.getElementById('formAcerca').style.display = 'none';           
    document.getElementById('selectCliFiltro').value ='';   
    document.getElementById('formLogin').value ='';       
    document.getElementById('formPainel').style.display = 'none';   
    document.getElementById('formPdv').style.display = 'none';    
    document.getElementById('formCalculos').style.display = 'none';    
    document.getElementById('formConfig').style.display = 'none';        
    document.getElementById('formObjetos').style.display = 'none';            
    document.getElementById('formServicio').style.display = 'none';    
    document.getElementById('formListaServicos').style.display = 'none';        
    document.getElementById('formOs').style.display = 'none';        
    document.getElementById('cpf').disabled = false;       
    formPresenta.style.display = 'block';         
    document.querySelector('input[name="radtip"][value="juridica"]').disabled = false;
    document.querySelector('input[name="radtip"][value="fisica"]').disabled = false;  
    limparcalculos();
  }
  
  function estilizarBotao(botao, onClickHandler) {
    botao.style.backgroundColor = ' #f1ab13';
    botao.style.color = 'white';
    botao.style.padding = '10px 20px';
    botao.style.border = 'none';
    botao.style.borderRadius = '8px';
    botao.style.fontSize = '16px';
    botao.style.cursor = 'pointer';
    if (typeof onClickHandler === 'function') {
      botao.addEventListener('click', onClickHandler);
    }
  }
  
  function estilizarBotao2(cur, botao) {
    botao.style.backgroundColor = cur === 0 ? 'blue' : 'red';
    botao.style.color = 'white';
    botao.style.padding = '10px 20px';
    botao.style.border = 'none';
    botao.style.borderRadius = '8px';
    botao.style.fontSize = '12px';
    botao.style.cursor = 'pointer';
    botao.style.marginLeft = '10px';
  }
  
  function formatarCPF(cpf) 
    {
      cpf = cpf.replace(/\D/g, "");     
      cpf = cpf.substring(0, 11);    
      if (cpf.length > 9) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      } else if (cpf.length > 6) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      } else if (cpf.length > 3) {
        cpf = cpf.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      }
      return cpf;
    }

    function formatarCNPJ(valor) {
      valor = valor.replace(/\D/g, '');   
      if (valor.length > 14) valor = valor.slice(0, 14);   
      valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
      valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
  
      return valor;
    }
  
    function formatarCEP(cep) {
      cep = cep.replace(/\D/g, ""); 
      cep = cep.substring(0, 8);        
      if (cep.length > 5) {
        cep = cep.replace(/^(\d{5})(\d{1,3})/, "$1-$2");
      }  
      return cep;
    }    
  
    async function buscarLogradouro(cep) {
      cep = cep.replace(/\D/g, "");     
      if (cep.length !== 8) {
        console.error("CEP inválido. Deve conter 8 dígitos.");
        resultado.textContent = "CEP inválido. Deve conter 8 dígitos.";      
        return;
      }
    
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
    
        if (data.erro) {
          console.error("CEP não encontrado.");
        } else {
          console.log("Logradouro:", data.logradouro); 
          return data.logradouro;
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
      }
    }
  
    async function preencherEndereco() {
      const cep = document.getElementById("cep").value.replace(/\D/g, "");
  
      if (cep.length !== 8) {                    
        result = "CEP inválido. Digite 8 números.";  
        showToast(result, 2500);                                                                       
        return;
      }
  
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
  
        if (data.erro) {          
          result = "CEP não encontrado!";  
          showToast(result, 2500);                                                                       
        } else {        
        
          document.getElementById("logradouro").value = data.logradouro || "";
          document.getElementById("bairro").value = data.bairro || "";
          document.getElementById("ciudad").value = data.localidade || "";        
          document.getElementById("estados").value = data.uf || "";
          document.getElementById("estado").value = data.uf || "";
          const cidadeSelect = document.getElementById('cidade');
          cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>'; 
          const optionCidade = document.createElement('option');
          optionCidade.value = data.localidade;
          optionCidade.textContent = data.localidade;
          cidadeSelect.appendChild(optionCidade); 
          cidadeSelect.value = data.localidade;
          cidadeSelect.disabled = true;                  
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
        showToastl("Erro na busca. Tente novamente. ", 2500);                                                                      
        
      }
    }
  let cepvalido = false
  let swty = false
  
  document.getElementById("cepe").addEventListener("input", () => {
  const cep = document.getElementById("cepe").value.replace(/\D/g, ""); 
  cepvalido = false; 

  if (cep.length === 8) {
    cepvalido = true;
    document.getElementById("botoncepe").focus();
    document.getElementById('botoncepe').click(); 
  }
});

  async function preencherEnderecoe() {
      const cep = document.getElementById("cepe").value.replace(/\D/g, "");      
  
      if (cep.length !== 8) {                    
        result = "CEP inválido. Digite 8 números.";  
        showToast(result, 2500);                                                                       
        return;
      }
  
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
  
        if (data.erro) {          
          result = "CEP não encontrado!";  
          showToast(result, 2500);     
          document.getElementById("cepe").focus(); 
          cepvalido = false
          return;            
          
        } else {        
          cepvalido = true 
          swty = true
          document.getElementById("logradouroe").value = data.logradouro || "";
          document.getElementById("bairroe").value = data.bairro || "";
          document.getElementById("ciudade").value = data.localidade || "";        
          document.getElementById("estadose").value = data.uf || "";
          document.getElementById("estadoe").value = data.uf || "";
          const cidadeSelect = document.getElementById('cidade');
          cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>'; 
          const optionCidade = document.createElement('option');
          optionCidade.value = data.localidade;
          optionCidade.textContent = data.localidade;
          cidadeSelect.appendChild(optionCidade); 
          cidadeSelect.value = data.localidade;
          cidadeSelect.disabled = true;                  
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
        showToastl("Erro na busca. Tente novamente. ", 2500);                                                                      
      }
    }
    
    async function preencherEnderecof() {
      const cepf = document.getElementById("cepf").value.replace(/\D/g, "");
  
      if (cepf.length !== 8) {            
        result = "CEP inválido. Digite 8 números.";  
        showToast(result, 2500);                                                                       
        return;
      }
  
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepf}/json/`);
        const data = await response.json();
  
        if (data.erro) {
          result = "CEP não encontrado!";  
          showToast(result, 2500);                                                                       
        } else {        
        
          document.getElementById("logradourof").value = data.logradouro || "";
          document.getElementById("bairrof").value = data.bairro || "";
          document.getElementById("ciudadf").value = data.localidade || "";        
          document.getElementById("estadosf").value = data.uf || "";                 
          // resultado.textContent = "✅  CEP encontrado!.";                
          resultado.style.color = "green";
          resultado.style.display = "block"; 
          esperar(); 
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);        
      }
    }

    async function preencherEnderecofo() {
      const cepf = document.getElementById("cepfo").value.replace(/\D/g, "");
  
      if (cepf.length !== 8) {            
        result = "CEP inválido. Digite 8 números.";  
        showToast(result, 2500);                                                                       
        return;
      }
  
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepf}/json/`);
        const data = await response.json();
  
        if (data.erro) {
          result = "CEP não encontrado!";  
          showToast(result, 2500);                                                                       
        } else {        
        
          document.getElementById("logradourofo").value = data.logradouro || "";
          document.getElementById("bairrofo").value = data.bairro || "";
          document.getElementById("ciudadfo").value = data.localidade || "";        
          document.getElementById("estadosfo").value = data.uf || "";                         
          resultado.style.color = "green";
          resultado.style.display = "block"; 
          esperar(); 
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);        
      }
    }

    function validarCPF(cpf) {
      cpf = cpf.replace(/\D/g, ''); 
  
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
      let soma = 0;
      for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let dig1 = (soma * 10) % 11;
      if (dig1 === 10 || dig1 === 11) dig1 = 0;
      if (dig1 !== parseInt(cpf.charAt(9))) return false;
  
      soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
      }
      let dig2 = (soma * 10) % 11;
      if (dig2 === 10 || dig2 === 11) dig2 = 0;
      if (dig2 !== parseInt(cpf.charAt(10))) return false;
  
      return true;
    }  
   
  let segmentoSelecionado = '';

  const segmentos = [
    { valor: "comercio_geral", texto: "Comércio Geral" },
    { valor: "comercio_servicos", texto: "Comércio e Serviços" },
    { valor: "servicos", texto: "Serviços" },
    { valor: "industria", texto: "Indústria" },
    { valor: "agropecuaria", texto: "Agropecuária" },    
    { valor: "transporte_logistica", texto: "Transporte e Logística" },
    { valor: "educacao", texto: "Educação" },
    { valor: "saude", texto: "Saúde" },
    { valor: "tecnologia", texto: "Tecnologia da Informação (TI)" },
    { valor: "financeiro", texto: "Financeiro" },
    { valor: "importacao_exportacao", texto: "Importação e Exportação" },
    { valor: "orgao_publico", texto: "Órgão Público / Terceiro Setor" }
  ];

  const select = document.getElementById("segmento"); 
  select.innerHTML += segmentos
    .map(seg => `<option value="${seg.valor}">${seg.texto}</option>`)
    .join("");

 
  function obterSegmentoSelecionado() {
    return {
      valor: select.value,
      texto: select.options[select.selectedIndex].text
    };
  }

  select.addEventListener("change", () => {
    const { valor, texto } = obterSegmentoSelecionado();
    segmentoSelecionado = texto;
    console.log("Segmento selecionado:", valor, "-", segmentoSelecionado);
  });

  
  let regimen = '';
  function carregarRegimes() {
    const regimes = [
      { valor: "simples", texto: "Simples Nacional" },
      { valor: "lucro_presumido", texto: "Lucro Presumido" },
      { valor: "lucro_real", texto: "Lucro Real" }
    ];

    const select = document.getElementById("rt");
   
    if (select.options.length === 1) {
      regimes.forEach(regime => {
        const option = document.createElement("option");
        option.value = regime.valor;
        option.textContent = regime.texto;
        select.appendChild(option);
      });
    }
  }

  function obterRegimeSelecionado() {
    const select = document.getElementById("rt");
    return select.value; 
  }

  document.getElementById("rt").addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    regimen = selectedOption.text;
    console.log("Regime selecionado:", regimen); 
  });

  carregarRegimes();

  let faixar = '';
  function carregarFaixas() {
    const faixas = [
      { valor: "faixa1", texto: "1ª Faixa - Até R$ 180.000,00" },
      { valor: "faixa2", texto: "2ª Faixa - R$ 180.000,01 a R$ 360.000,00" },
      { valor: "faixa3", texto: "3ª Faixa - R$ 360.000,01 a R$ 720.000,00" },
      { valor: "faixa4", texto: "4ª Faixa - R$ 720.000,01 a R$ 1.800.000,00" },
      { valor: "faixa5", texto: "5ª Faixa - R$ 1.800.000,01 a R$ 3.600.000,00" },
      { valor: "faixa6", texto: "6ª Faixa - R$ 3.600.000,01 a R$ 4.800.000,00" }
    ];

    const select = document.getElementById("faixa");    
    if (select.options.length === 1) {
      faixas.forEach(faixa => {
        const option = document.createElement("option");
        option.value = faixa.valor;
        option.textContent = faixa.texto;        
        select.appendChild(option);
      });
    }
  }
  
  document.getElementById("faixa").addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    faixar = selectedOption.text;
    console.log("Faixa selecionada:", faixar);
  });

  carregarFaixas();


let cargoSelecionado = '';

function carregarCargos(selectId = 'funcaof') {
  const cargos = [
    { valor: "admin", texto: "ADMINISTRADOR" },
    { valor: "supervisor", texto: "SUPERVISOR" },
    { valor: "tecnico", texto: "TÉCNICO" },
    { valor: "mecanico", texto: "MECÂNICO" },
    { valor: "vendedor", texto: "VENDEDOR" },
    { valor: "operador", texto: "OPERADOR" },
    { valor: "auxiliar", texto: "AUXILIAR" },
    { valor: "gerente", texto: "GERENTE" },
    { valor: "estagiario", texto: "ESTAGIÁRIO" }
  ];

  const select = document.getElementById(selectId);
  if (!select) return;  
  const valoresExistentes = new Set();
  Array.from(select.options).forEach(opt => valoresExistentes.add(opt.value.toLowerCase()));
  cargos.forEach(cargo => {
    if (!valoresExistentes.has(cargo.valor.toLowerCase())) {
      select.add(new Option(cargo.texto, cargo.valor));
      valoresExistentes.add(cargo.valor.toLowerCase());
    }
  });  
  select.onchange = () => {
    cargoSelecionado = select.options[select.selectedIndex].text.toUpperCase();
    console.log("Cargo selecionado:", cargoSelecionado);
  };
}
carregarCargos();


let statusSelecionado = '';

function carregarStatus(selectId = 'selecstatusos') {
  const status = [
    { valor: "aberta", texto: "ABERTA" },
    { valor: "orçamento", texto: "ORÇAMENTO" },
    { valor: "pendente", texto: "PENDENTE" },
    { valor: "anda", texto: "EM ANDAMENTO" },
    { valor: "liberada", texto: "LIBERADA" },    
    { valor: "pronta", texto: "PRONTA" },
    { valor: "cancelada", texto: "CANCELADA" },    
    { valor: "finalizada", texto: "FINALIZADA" }    
  ];

  const select = document.getElementById(selectId);
  if (!select) return;

  const valoresExistentes = new Set();
  Array.from(select.options).forEach(opt => valoresExistentes.add(opt.value.toLowerCase()));

  status.forEach(statu => {
    if (!valoresExistentes.has(statu.valor.toLowerCase())) {
      select.add(new Option(statu.texto, statu.valor));
      valoresExistentes.add(statu.valor.toLowerCase());
    }
  });

  // Define "aberta" como valor padrão selecionado
  select.value = "aberta";
  statusSelecionado = "ABERTA";
  console.log("Status selecionado:", statusSelecionado);

  select.onchange = () => {
    statusSelecionado = select.options[select.selectedIndex].text.toUpperCase();
    console.log("Status selecionado:", statusSelecionado);
  };
}

carregarStatus();


        
    function esperar() 
    {
      setTimeout(function() 
      {
      resultado.style.display = "none";
      }, 2500); 
    }
  
    async function carregarEstados() {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const estados = await response.json();
      const selectEstado = document.getElementById('estado');
      estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.sigla;
        option.textContent = estado.nome;
        selectEstado.appendChild(option);
      });
    }
    
    async function carregarCidades(uf) {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const cidades = await response.json();
      const selectCidade = document.getElementById('cidade');
      selectCidade.innerHTML = '<option value="">Selecione uma cidade</option>';
      cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade.id;      
        option.textContent = cidade.nome;      
        selectCidade.appendChild(option);
      });
      selectCidade.disabled = false;           
    }
    
    document.getElementById('estado').addEventListener('change', function() {
      const uf = this.value;
      if (uf) {
        carregarCidades(uf);
      } else {
        document.getElementById('cidade').disabled = true;
        document.getElementById('cidade').innerHTML = '<option value="">Selecione uma cidade</option>';
      }
    });
    
    carregarEstados();

    async function carregarEstadose() {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const estados = await response.json();
      const selectEstado = document.getElementById('estadoe');
      estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.sigla;
        option.textContent = estado.nome;
        selectEstado.appendChild(option);
      });
    }
    
    async function carregarCidadese(uf) {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const cidades = await response.json();
      const selectCidade = document.getElementById('cidadee');
      selectCidade.innerHTML = '<option value="">Selecione uma cidade</option>';
      cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade.id;      
        option.textContent = cidade.nome;      
        selectCidade.appendChild(option);
      });
      selectCidade.disabled = false;           
    }
    
    document.getElementById('estadoe').addEventListener('change', function() {
      const uf = this.value;
      if (uf) {
        carregarCidadese(uf);
      } else {
        document.getElementById('cidadee').disabled = true;
        document.getElementById('cidadee').innerHTML = '<option value="">Selecione uma cidade</option>';
      }
    });
    
    carregarEstadose();
  
 async function carregarPaises() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,translations');
    const data = await response.json();

    const paisSelect = document.getElementById("pais");
    paisSelect.innerHTML = '';

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecione um país...";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    paisSelect.appendChild(defaultOption);

    const paises = data
      .map(pais => pais.translations?.por?.common || pais.name.common)
      .sort((a, b) => a.localeCompare(b));

    paises.forEach(pais => {
      const option = document.createElement("option");
      option.value = pais;
      option.textContent = pais;
      paisSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar os países:", error);
  }
}

async function carregarPaisese() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,translations');
    const data = await response.json();

    const paisSelect = document.getElementById("paise");
    paisSelect.innerHTML = '';

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecione um país...";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    paisSelect.appendChild(defaultOption);

    const paises = data
      .map(pais => pais.translations?.por?.common || pais.name.common)
      .sort((a, b) => a.localeCompare(b));

    paises.forEach(pais => {
      const option = document.createElement("option");
      option.value = pais;
      option.textContent = pais;
      paisSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar os países:", error);
  }
}

      
function carregarNacionalidades() {
  fetch('https://restcountries.com/v3.1/all?fields=demonyms')
    .then(response => response.json())
    .then(data => {
      const nacionalidadeSelect = document.getElementById("nacionalidade");
      const nacionalidades = data
        .map(pais => pais.demonyms?.por?.m || pais.demonyms?.eng?.m || null)
        .filter(Boolean)
        .filter((item, index, self) => self.indexOf(item) === index)
        .sort((a, b) => a.localeCompare(b));
        
      nacionalidades.forEach(nacionalidade => {
        const option = document.createElement("option");
        option.value = nacionalidade;
        option.textContent = nacionalidade;
        nacionalidadeSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error("Erro ao carregar as nacionalidades:", error);
    });
}

function carregarNacionalidadese() {
  fetch('https://restcountries.com/v3.1/all?fields=demonyms')
    .then(response => response.json())
    .then(data => {
      const nacionalidadeSelect = document.getElementById("nacionalidadee");
      const nacionalidades = data
        .map(pais => pais.demonyms?.por?.m || pais.demonyms?.eng?.m || null)
        .filter(Boolean)
        .filter((item, index, self) => self.indexOf(item) === index)
        .sort((a, b) => a.localeCompare(b));
        
      nacionalidades.forEach(nacionalidade => {
        const option = document.createElement("option");
        option.value = nacionalidade;
        option.textContent = nacionalidade;
        nacionalidadeSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error("Erro ao carregar as nacionalidades:", error);
    });
}
  
      window.addEventListener("DOMContentLoaded", () => {
        carregarPaises();
        carregarPaisese();
        carregarNacionalidades();
        carregarNacionalidadese();
      });
  
      function carregarNaturalidades() {
        fetch('https://restcountries.com/v3.1/all?fields=demonyms')
          .then(response => response.json())
          .then(data => {
            const naturalidadeSelect = document.getElementById("naturalidade");
            const naturalidades = data
              .map(pais => pais.demonyms?.por?.m || pais.demonyms?.eng?.m || null)
              .filter(Boolean)
              .filter((item, index, self) => self.indexOf(item) === index) 
              .sort((a, b) => a.localeCompare(b));
              naturalidades.forEach(naturalidade => {
              const option = document.createElement("option");
              option.value = naturalidade;
              option.textContent = naturalidade;
              naturalidadeSelect.appendChild(option);
            });
          })
          .catch(error => {
            console.error("Erro ao carregar as naturalidades:", error);
          });
      }

      function carregarNaturalidadese() {
        fetch('https://restcountries.com/v3.1/all?fields=demonyms')
          .then(response => response.json())
          .then(data => {
            const naturalidadeSelect = document.getElementById("naturalidadee");
            const naturalidades = data
              .map(pais => pais.demonyms?.por?.m || pais.demonyms?.eng?.m || null)
              .filter(Boolean)
              .filter((item, index, self) => self.indexOf(item) === index) 
              .sort((a, b) => a.localeCompare(b));
              naturalidades.forEach(naturalidade => {
              const option = document.createElement("option");
              option.value = naturalidade;
              option.textContent = naturalidade;
              naturalidadeSelect.appendChild(option);
            });
          })
          .catch(error => {
            console.error("Erro ao carregar as naturalidades:", error);
          });
      }
  
      window.addEventListener("DOMContentLoaded", () => {
        carregarPaises();
        carregarNacionalidades();
        carregarNaturalidades();
        carregarNaturalidadese();
      });
  
      function aplicarMascaraTelefone(inputId) {
        const input = document.getElementById(inputId);
    
        input.addEventListener("input", function(e) {
          let valor = e.target.value.replace(/\D/g, '');
    
          if (valor.length > 11) valor = valor.slice(0, 11);
    
          if (valor.length >= 2 && valor.length <= 6) {
            valor = valor.replace(/(\d{2})(\d+)/, '($1) $2');
          } else if (valor.length > 6 && valor.length <= 10) {
            valor = valor.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
          } else if (valor.length > 10) {
            valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
          }
    
          e.target.value = valor;
        });
      } 
      aplicarMascaraTelefone("telefone");
      aplicarMascaraTelefone("celular");
      aplicarMascaraTelefone("telefoneemite");
      aplicarMascaraTelefone("celulari");
      aplicarMascaraTelefone("telefonef");
      aplicarMascaraTelefone("celularf");
      aplicarMascaraTelefone("telefonefo");
      aplicarMascaraTelefone("celularfo");

      function formatarIE(valor) {
        valor = valor.toUpperCase(); 
      
        
        if (valor === "ISENTO") return "ISENTO";
      
        
        valor = valor.replace(/\D/g, '');
      
        
        return valor.slice(0, 11);
      }

      function formatarIE(valor) {
        valor = valor.toUpperCase();     
        valor = valor.replace(/[^A-Z0-9]/g, '');    
        return valor.slice(0, 11);
      }

      function permitirSomenteNumeros(idInput) {
        const input = document.getElementById(idInput);
    
        input.addEventListener('input', function() {
          this.value = this.value.replace(/\D/g, '');
        });
      }    
      
      permitirSomenteNumeros('codbarras');

let funcionarioSelecionado = 'FUNCIONÁRIO PADRÃO';
let codfunciona = 1;

function carregarFuncionarios() {
  fetch('/funcionarios')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectFuncionario');
      if (!select) return;      
      select.innerHTML = '<option value="" selected>FUNCIONÁRIO PADRÃO</option>';      
      const funcionariosAtivos = data.filter(funcionario =>
        funcionario.ativof?.toUpperCase() === 'SIM' &&
        funcionario.funcionariof.toUpperCase() !== 'FUNCIONÁRIO PADRÃO' &&
        funcionario.controle != 1
      );      
      funcionariosAtivos.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario.controle;
        option.textContent = funcionario.funcionariof;
        select.appendChild(option);
      });      
      select.addEventListener('change', () => {
        const selecionado = funcionariosAtivos.find(f => f.controle == select.value);
        if (selecionado) {
          funcionarioSelecionado = selecionado.funcionariof;
          codfunciona = selecionado.controle;
        } else {
          funcionarioSelecionado = 'FUNCIONÁRIO PADRÃO';
          codfunciona = 1;
        }
      });
    })
    .catch(error => {
      console.error('Erro ao carregar funcionários:', error);
    });
}   
      document.addEventListener('DOMContentLoaded', carregarFuncionarios);


let funcionarioSelecionadoos = '';
let codfuncionaos = 1;
function carregarFuncionariosos() {
  fetch('/funcionarios')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectFuncionarioos');
      if (!select) return;      
      select.innerHTML = '<option value="" selected>FUNCIONÁRIO PADRÃO</option>';      
      const funcionariosAtivos = data.filter(funcionario =>
        funcionario.ativof?.toUpperCase() === 'SIM' &&
        funcionario.funcionariof.toUpperCase() !== 'FUNCIONÁRIO PADRÃO' &&
        funcionario.controle != 1
      );      
      funcionariosAtivos.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario.controle;
        option.textContent = funcionario.funcionariof;
        select.appendChild(option);
      });      
      select.addEventListener('change', () => {
        const selecionado = funcionariosAtivos.find(f => f.controle == select.value);
        if (selecionado) {
          funcionarioSelecionadoos = selecionado.funcionariof;
          codfuncionaos = selecionado.controle;
        } else {
          funcionarioSelecionadoos = '';
          codfuncionaos = 1;
        }
      });
    })
    .catch(error => {
      console.error('Erro ao carregar funcionários:', error);
    });
}      

let funcionarioSelecionadoTecMec = 'FUNCIONÁRIO PADRÃO';
let codFuncionarioTecMec = 1;

function carregarFuncionariosTecMec() {
  fetch('/funcionarios')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectFuncionariosTecnicos');
      if (!select) return;
      
      select.innerHTML = '<option value="" selected>FUNCIONÁRIO PADRÃO</option>';

      const funcionariosFiltrados = data.filter(funcionario =>
        funcionario.ativof?.toUpperCase() === 'SIM' &&
        funcionario.funcionariof.toUpperCase() !== 'FUNCIONÁRIO PADRÃO' &&
        funcionario.controle != 1 &&
        (funcionario.funcaof?.toUpperCase() === 'TÉCNICO' ||
         funcionario.funcaof?.toUpperCase() === 'MECÂNICO')
      );

      funcionariosFiltrados.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario.controle;
        option.textContent = funcionario.funcionariof;
        select.appendChild(option);
      });

      select.addEventListener('change', () => {
        const selecionado = funcionariosFiltrados.find(f => f.controle == select.value);
        if (selecionado) {
          funcionarioSelecionadoTecMec = selecionado.funcionariof;
          codFuncionarioTecMec = selecionado.controle;
        } else {
          funcionarioSelecionadoTecMec = 'FUNCIONÁRIO PADRÃO';
          codFuncionarioTecMec = 1;
        }
      });
    })
    .catch(error => {
      console.error('Erro ao carregar funcionários (Técnico/Mecânico):', error);
    });
}



let funcionarioSelecionadoR = 'FUNCIONÁRIO PADRÃO';
let codfuncionaR = 1;
function carregarFuncionariosReceber() {
  fetch('/funcionarios')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectFuncionarioReceber');
      if (select) {        
        select.innerHTML = '<option value="" selected>FUNCIONÁRIO PADRÃO</option>';
        data.forEach(funcionario => {          
          if (funcionario.funcionariof.toUpperCase() !== 'FUNCIONÁRIO PADRÃO' && funcionario.controle != 1) {
            const option = document.createElement('option');
            option.value = funcionario.controle;
            option.textContent = funcionario.funcionariof;
            select.appendChild(option);
          }
        });
        select.addEventListener('change', () => {
          const selecionado = data.find(f => f.controle == select.value);
          if (selecionado) {
            funcionarioSelecionadoR = selecionado.funcionariof;
            codfuncionaR = selecionado.controle;
          } else {            
            funcionarioSelecionadoR = 'FUNCIONÁRIO PADRÃO';
            codfuncionaR = 1;
          }
        });
      }
    })
    .catch(error => {
      console.error('Erro ao carregar funcionários:', error);
    });
}      
    document.addEventListener('DOMContentLoaded', carregarFuncionariosReceber);


let controleSelecionadoos = 1;
let nomeclienos = '';
let cpfcliente = '', cepcliente = '', endcliente = '', numcliente = '' 
let swos = false
function carregarClientesos() {
  const select = document.getElementById('selectClienteos');
  const selectObjetos = document.getElementById('selectObjetos');
  if (!select || !selectObjetos) return;

  // Limpa o select para evitar duplicidade de opções
  select.innerHTML = '<option disabled selected hidden>-- SELECIONE UM CLIENTE --</option>';
  selectObjetos.innerHTML = '<option value="">-- Selecione --</option>';
  selectObjetos.disabled = false;

  // Carrega clientes ativos do backend
  fetch('/clientes')
    .then(response => response.json())
    .then(data => {
      const clientesAtivos = data.filter(cliente =>
        cliente.ativo?.toUpperCase() === 'SIM' &&
        cliente.cliente.toUpperCase() !== 'CONSUMIDOR PADRÃO' &&
        cliente.controle != 1
      );

      // Adiciona clientes ativos sem duplicidade
      const clientesExistentes = new Set();
      clientesAtivos.forEach(cliente => {
        if (!clientesExistentes.has(cliente.controle)) {
          const option = document.createElement('option');
          option.value = cliente.controle;
          option.textContent = cliente.cliente;
          select.appendChild(option);
          clientesExistentes.add(cliente.controle);
        }
      });

      
      controleSelecionadoos = 1;
      nomeclienos = '';      
      carregarObjetosClienteOs(controleSelecionadoos);      
      if (!select._hasChangeListener) {
        select._changeHandler = async () => {
          const clienteSelecionadoos = clientesAtivos.find(c => c.controle == select.value);
          if (clienteSelecionadoos) {
            desabilitarControlesObjeto(true)           
            limparControlesObjeto()
            tipoos=''
            controleSelecionadoos = clienteSelecionadoos.controle;
            nomeclienos = clienteSelecionadoos.cliente;
            cpfcliente = clienteSelecionadoos.cpf ? clienteSelecionadoos.cpf : clienteSelecionadoos.cnpj;
            document.getElementById('cpfos').value = cpfcliente            
            cepcliente = clienteSelecionadoos.cep;
            document.getElementById('cepos').value = cepcliente;            
            endcliente = clienteSelecionadoos.endereco;
            document.getElementById('endos').value = endcliente;            
            numcliente = clienteSelecionadoos.numero;
            document.getElementById('numcli').value = numcliente;            

          } else {
            controleSelecionadoos = 1;
            nomeclienos = 'CONSUMIDOR PADRÃO';
          }
          await carregarObjetosClienteOs(controleSelecionadoos);
        };
        select.addEventListener('change', select._changeHandler);
        select._hasChangeListener = true;
      }
    })
    .catch(error => {
      console.error('Erro ao carregar clientes:', error);
    });
}

let objetoplaca = '', tipoos = '', tmarcaos = '', tmodeloos = '', tanoos = '', tcoros = '', tobid = 0;

async function carregarObjetosClienteOs(clienteId) {
  const selectObjetos = document.getElementById('selectObjetos');
  if (!selectObjetos) return;
  
  selectObjetos.innerHTML = '<option value="">-- SELECIONE UM OBJETO / VEÍCULO --</option>';
  objetoplaca = ''; // limpa ao trocar de cliente
  
  if (!clienteId || clienteId == 1) return;

  try {
    const response = await fetch(`/clientes/${clienteId}/objetos-veiculos`);
    const objetos = await response.json();

    if (objetos.length === 0) {
      showToastl(`⚠️ O cliente "${nomeclienos}" não possui objetos cadastrados.\nCadastre um objeto antes de prosseguir.`, 2500);
      selectObjetos.innerHTML = '<option value="">-- Nenhum objeto disponível --</option>';
      selectObjetos.disabled = true;
      swos = true;
      EditarClienteOs(clienteId);
      return;
    }

    selectObjetos.disabled = false;
    const valoresExistentes = new Set();

    objetos.forEach(obj => {
      const descricao = `${obj.tipo || ''} - ${obj.marca || ''} ${obj.modelo || ''}`.trim();
      const optionValue = obj.id.toString();
      if (!valoresExistentes.has(optionValue)) {
        valoresExistentes.add(optionValue);
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = descricao || 'Objeto sem descrição';
        // armazena a placa no atributo data
        option.dataset.placaSerie = obj.placaSerie || '';
        option.dataset.tipo = obj.tipo || '';
        option.dataset.marca = obj.marca || '';
        option.dataset.modelo = obj.modelo || '';
        option.dataset.ano = obj.ano || '';
        option.dataset.cor = obj.cor || '';
        option.dataset.id = obj.id || '';
        selectObjetos.appendChild(option);
      }
    });

    // evento para capturar a placa do objeto selecionado
    selectObjetos.addEventListener('change', () => {
      const selectedOption = selectObjetos.options[selectObjetos.selectedIndex];
      objetoplaca = selectedOption?.dataset?.placaSerie || '';
      tipoos = selectedOption?.dataset?.tipo || '';
      tmarcaos = selectedOption?.dataset?.marca || '';
      tmodeloos = selectedOption?.dataset?.modelo || '';
      tanoos = selectedOption?.dataset?.ano || '';
      tcoros = selectedOption?.dataset?.cor || '';
      tobid = selectedOption?.dataset?.id || 0;      
      document.getElementById('obplaca').value = objetoplaca      
      document.getElementById('obtipo').value = tipoos      
      document.getElementById('obmarca').value = tmarcaos
      document.getElementById('obmodelo').value = tmodeloos
      document.getElementById('obano').value = tanoos
      document.getElementById('obcor').value = tcoros
      console.log('Placa selecionada:', objetoplaca);
    });

  } catch (error) {
    console.error('Erro ao carregar objetos do cliente:', error);
  }
}

async function carregarObjetosClienteOsOb(clienteId, objeto) {
  selectObjetos.disabled = false;
  selectObjetos.innerHTML = '<option value="">-- SELECIONE --</option>';
  const valoresExistentes = new Set();

  objetos.forEach(obj => {
    const descricao = `${obj.tipo || ''} - ${obj.marca || ''} ${obj.modelo || ''}`.trim();
    const optionValue = obj.id.toString();
    if (!valoresExistentes.has(optionValue)) {
      valoresExistentes.add(optionValue);
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = descricao || 'Objeto sem descrição';
      option.dataset.placaSerie = obj.placaSerie || '';
      option.dataset.tipo = obj.tipo || '';
      option.dataset.marca = obj.marca || '';
      option.dataset.modelo = obj.modelo || '';
      option.dataset.ano = obj.ano || '';
      option.dataset.cor = obj.cor || '';
      option.dataset.id = obj.id || '';
      selectObjetos.appendChild(option);
    }
  });

  // ✅ Define o valor do select e campos relacionados depois que as opções estiverem criadas
  if (objeto) {
    const opcaoSelecionada = Array.from(selectObjetos.options)
      .find(opt => opt.dataset.tipo === objeto.tipo);
    if (opcaoSelecionada) {
      selectObjetos.value = opcaoSelecionada.value;
      document.getElementById('obtipo').value = objeto.tipo || '';
      document.getElementById('obplaca').value = objeto.placaSerie || '';
      document.getElementById('obmarca').value = objeto.marca || '';
      document.getElementById('obmodelo').value = objeto.modelo || '';
      document.getElementById('obcor').value = objeto.cor || '';
    }
  }
}




function desabilitarControlesObjeto(valor) {  
  // Campos do objeto
  document.getElementById("obtipo").readOnly = valor;
  document.getElementById("obplaca").readOnly = valor;
  document.getElementById("obmarca").readOnly = valor;
  document.getElementById("obmodelo").readOnly = valor;
  document.getElementById("obano").readOnly = valor;
  document.getElementById("obcor").readOnly = valor;  

  // Campos do cliente
  document.getElementById("cpfos").readOnly = valor;
  document.getElementById("cepos").readOnly = valor;
  document.getElementById("endos").readOnly = valor;
  document.getElementById("numcli").readOnly = valor;
}

function limparControlesObjeto() {
  const campos = [
    "obtipo", "obplaca", "obmarca", "obmodelo", "obano", "obcor",
    "cpfos", "cepos", "endos", "numcli"
  ];

  campos.forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
}





let funcionarioSelecionadoPagar = 'FUNCIONÁRIO PADRÃO';
let codfuncionaPagar = 1;
function carregarFuncionariosPagar() {
  fetch('/funcionarios')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectFuncionarioPagar');
      if (select) {
        
        select.innerHTML = '<option value="" selected>FUNCIONÁRIO PADRÃO</option>';        
        data
          .filter(funcionario => funcionario.funcionariof.toUpperCase() !== 'FUNCIONÁRIO PADRÃO' && funcionario.controle != 1)
          .forEach(funcionario => {
            const option = document.createElement('option');
            option.value = funcionario.controle;
            option.textContent = funcionario.funcionariof;
            select.appendChild(option);
          });
        
        select.addEventListener('change', () => {
          const selecionado = data.find(f => f.controle == select.value);
          if (selecionado) {
            funcionarioSelecionadoPagar = selecionado.funcionariof;
            codfuncionaPagar = selecionado.controle;
          } else {
            funcionarioSelecionadoPagar = 'FUNCIONÁRIO PADRÃO';
            codfuncionaPagar = 1;
          }
        });
      }
    })
    .catch(error => {
      console.error('Erro ao carregar funcionários:', error);
    });
}
      
      document.addEventListener('DOMContentLoaded', carregarFuncionariosPagar);


let controleSelecionado = 1;
let nomeclien = 'Consumidor Padrão';
function carregarClientes() {
  fetch('/clientes')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectCliente');
      if (!select) return;      
      select.innerHTML = '<option value="" selected>CONSUMIDOR PADRÃO</option>';      
      const clientesAtivos = data.filter(cliente =>
        cliente.ativo?.toUpperCase() === 'SIM' &&
        cliente.cliente.toUpperCase() !== 'CONSUMIDOR PADRÃO' &&
        cliente.controle != 1
      );
      
      clientesAtivos.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.controle;
        option.textContent = cliente.cliente;
        select.appendChild(option);
      });

      select.addEventListener('change', () => {
        const clienteSelecionado = clientesAtivos.find(c => c.controle == select.value);

        if (clienteSelecionado) {
          controleSelecionado = clienteSelecionado.controle;
          nomeclien = clienteSelecionado.cliente;
        } else {
          controleSelecionado = 1;
          nomeclien = 'Consumidor Padrão';
        }
      });
    })
    .catch(error => {
      console.error('Erro ao carregar clientes:', error);
    });
}

let controleSeleCliente = 1;
let nomeclienSele = 'Consumidor Padrão';
function carregarClientesF() {
  fetch('/clientes')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectCliFiltro');
      if (select) {        
        select.innerHTML = '<option value="" selected>CONSUMIDOR PADRÃO</option>';        
        data
          .filter(cliente => cliente.cliente.toUpperCase() !== 'CONSUMIDOR PADRÃO' && cliente.controle != 1)
          .forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.controle;
            option.textContent = cliente.cliente;
            select.appendChild(option);
          });        
        select.addEventListener('change', () => {
          const clienteSelecionado = data.find(c => c.controle == select.value);
          if (clienteSelecionado) {
            controleSeleCliente = clienteSelecionado.controle;
            nomeclienSele = clienteSelecionado.cliente;
          } else {
            controleSeleCliente = 1;
            nomeclienSele = 'Consumidor Padrão';
          }
        });
      }
    })
    .catch(error => {
      console.error('Erro ao carregar clientes:', error);
    });
}

let controleFornecedorSelecionado = 1;
let nomeFornecedorSelecionado = 'FORNECEDOR PADRÃO';

function carregarFornecedores() {
  fetch('/fornecedores')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectFornecedor');
      if (!select) return;      
      select.innerHTML = '<option value="1" selected>FORNECEDOR PADRÃO</option>';      
      const fornecedores = data.filter(fornecedor =>
        fornecedor.fornecedor?.toUpperCase() !== 'FORNECEDOR PADRÃO' &&
        fornecedor.controle != 1
      );      
      fornecedores.forEach(fornecedor => {
        const option = document.createElement('option');
        option.value = fornecedor.controle;
        option.textContent = fornecedor.fornecedor;
        if (fornecedor.ativo?.toUpperCase() === 'NÃO') {
          option.style.color = 'gray';
          option.textContent += ' (Desativado)';
        }

        select.appendChild(option);
      });      
      controleFornecedorSelecionado = 1;
      nomeFornecedorSelecionado = 'FORNECEDOR PADRÃO';      
      select.onchange = () => {
        const fornecedorSelecionado = data.find(f => f.controle == select.value);
        if (!fornecedorSelecionado) {
          controleFornecedorSelecionado = 1;
          nomeFornecedorSelecionado = 'FORNECEDOR PADRÃO';
          return;
        }        
        if (fornecedorSelecionado.ativo?.toUpperCase() === 'NÃO') {
          showToast("Impossível selecionar fornecedor desativado!", 2500);          
          select.value = "1";
          controleFornecedorSelecionado = 1;
          nomeFornecedorSelecionado = 'FORNECEDOR PADRÃO';
          return;
        }        
        controleFornecedorSelecionado = fornecedorSelecionado.controle;
        nomeFornecedorSelecionado = fornecedorSelecionado.fornecedor;
      };
    })
    .catch(error => {
      console.error('Erro ao carregar fornecedores:', error);
    });
}




let controleFornecedorSelecionadoP = 1;
let nomeFornecedorSelecionadoP = 'FORNECEDOR PADRÃO';

function carregarFornecedoresPagar() {
  fetch('/fornecedores')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectForFiltro');
      if (!select) return;      
      select.innerHTML = '<option value="1" selected>FORNECEDOR PADRÃO</option>';      
      const fornecedoresAtivos = data.filter(fornecedor =>
        fornecedor.ativo?.toUpperCase() === 'SIM' &&
        fornecedor.fornecedor.toUpperCase() !== 'FORNECEDOR PADRÃO' &&
        fornecedor.controle != 1
      );      
      fornecedoresAtivos.forEach(fornecedor => {
        const option = document.createElement('option');
        option.value = fornecedor.controle;
        option.textContent = fornecedor.fornecedor;
        select.appendChild(option);
      });      
      controleFornecedorSelecionadoP = 1;
      nomeFornecedorSelecionadoP = 'FORNECEDOR PADRÃO';      
      select.addEventListener('change', () => {
        const fornecedorSelecionado = fornecedoresAtivos.find(f => f.controle == select.value);
        if (fornecedorSelecionado) {
          controleFornecedorSelecionadoP = fornecedorSelecionado.controle;
          nomeFornecedorSelecionadoP = fornecedorSelecionado.fornecedor;
        } else {
          controleFornecedorSelecionadoP = 1;
          nomeFornecedorSelecionadoP = 'FORNECEDOR PADRÃO';
        }
      });
    })
    .catch(error => {
      console.error('Erro ao carregar fornecedores:', error);
    });
}

function formatarDataBR(dataISO) {
  if (!dataISO) return ''; // retorna vazio se não houver data
  const partes = dataISO.split('-');
  if (partes.length !== 3) return dataISO; // retorna original se formato inesperado
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}


let controleFornecedorSel = 1;
let nomeFornecedorSel = 'FORNECEDOR PADRÃO';

function carregarFornecedoris() {
  fetch('/fornecedores')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('selectFornece');
      if (!select) return;      
      select.innerHTML = '<option value="1" selected>FORNECEDOR PADRÃO</option>';      
      const fornecedoresAtivos = data.filter(fornecedor =>
        fornecedor.ativo?.toUpperCase() === 'SIM' &&
        fornecedor.fornecedor.toUpperCase() !== 'FORNECEDOR PADRÃO' &&
        fornecedor.controle != 1
      );
      
      fornecedoresAtivos.forEach(fornecedor => {
        const option = document.createElement('option');
        option.value = fornecedor.controle;
        option.textContent = fornecedor.fornecedor;
        select.appendChild(option);
      });
      
      controleFornecedorSel = 1;
      nomeFornecedorSel = 'FORNECEDOR PADRÃO';      
      select.addEventListener('change', () => {
        const fornecedorSelecionado = fornecedoresAtivos.find(f => f.controle == select.value);
        if (fornecedorSelecionado) {
          controleFornecedorSel = fornecedorSelecionado.controle;
          nomeFornecedorSel = fornecedorSelecionado.fornecedor;
        } else {
          controleFornecedorSel = 1;
          nomeFornecedorSel = 'FORNECEDOR PADRÃO';
        }
      });
    })
    .catch(error => {
      console.error('Erro ao carregar fornecedores:', error);
    });
}   
      document.addEventListener('DOMContentLoaded', carregarFornecedoris);
      document.addEventListener('DOMContentLoaded', carregarFornecedores);     
      document.addEventListener('DOMContentLoaded', carregarFornecedoresPagar);     
      document.addEventListener('DOMContentLoaded', carregarClientes);    
      document.addEventListener('DOMContentLoaded', carregarClientesF);         
      

function showToast(message, tempo) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, tempo); ;
}

function showToastl(message, tempo) {
  const toastl = document.getElementById("toast");
  toastl.textContent = message;
  toastl.className = "toastl show";
  setTimeout(() => {
    toastl.className = toastl.className.replace("show", "");
  }, tempo); ;
}

function limparcalculos()
{
    document.getElementById('troco').value = '0.00'
    document.getElementById('total-geral').innerText = '0.00';
    document.getElementById('dinheiro').value = ''
    document.getElementById('cartaoDebito').value = ''
    document.getElementById('cartaoCredito').value = ''
    document.getElementById('falta').value = '0.00'; 
    document.getElementById('entra').value = ''; 
    document.getElementById('desconto').value = ''
    document.getElementById('acrescimo').value = ''
}

function desabilitarControles(valor) {  
  document.getElementById("dinheiro").disabled = valor;
  document.getElementById("cartaoDebito").disabled = valor;
  document.getElementById("cartaoCredito").disabled = valor;
  document.getElementById("parceladoCredito").disabled = valor;  
  document.getElementById("troco").disabled = valor;
  document.getElementById("falta").disabled = valor;  
  document.getElementById("btnFinalizar").disabled = valor;
  document.getElementById("btnCancelar").disabled = valor;
  document.getElementById('desconto').disabled = valor;
  document.getElementById('acrescimo').disabled = valor;
  document.getElementById('descontoPorcentagem').disabled = valor;
  document.getElementById('acrescimoPorcentagem').disabled = valor;

}

function controlarBotoesMenu(ativo) {
  const ids = [
    'btn-carregar',      
    'btn-clientes',          
    'btnListarf',        
    'btnListar',         
    'btnListarfo',       
    'btnListarp',    
    'btnRecaixa',    
    'btnRec',    
    'btnReCli',    
    'btnPag',    
    'btnPagFor', 
    'acercade',   
    'sair',       
    'limpa'              
  ];

  const botoesExtras = [
    'cadastrofuncionarios',
    'emitente',
    'cadastrofornecedores',
    'cadastroprodutos',
    'listafuncionario',
    'listafornecedor',
    'listaproduto',
    'compra',
    'cadvendapdv'
  ];  
  ids.forEach(id => {
    const botao = document.getElementById(id);
    if (botao) {
      botao.disabled = !ativo;
      botao.style.opacity = ativo ? '1' : '0.8';
      botao.style.cursor = ativo ? 'pointer' : 'not-allowed';
    }
  });  
  const inputs = document.querySelectorAll('input[type="button"]');
  inputs.forEach(input => {
    const acao = input.getAttribute('onclick');
    if (acao && botoesExtras.some(fn => acao.includes(fn))) {
      input.disabled = !ativo;
      input.style.opacity = ativo ? '1' : '0.8';
      input.style.cursor = ativo ? 'pointer' : 'not-allowed';
    }
  });
}

function moduloAtivoCliente() {
  return document.getElementById('formListaReceberCliente')?.style.display !== 'none';
}

function moduloAtivoFornecedor() {
  return document.getElementById('formListaPagarFornecedor')?.style.display !== 'none';
}

function executarCalculoGeral() {
  if (moduloAtivoCliente()) {    
    CalcularDescAcres();
    if (dinheirov > 0 || cartaoDebitov > 0) {
      calcularOperacao();
    }
  } else if (moduloAtivoFornecedor()) {
    CalcularDescAcresF();
    if (dinheirov > 0 || cartaoDebitov > 0) {
      calcularOperacaoF();
    }
  }
}

['desconto', 'acrescimo'].forEach(id => {
  document.getElementById(id).addEventListener('input', executarCalculoGeral);
});

['descontoPorcentagem', 'acrescimoPorcentagem'].forEach(id => {
  document.getElementById(id).addEventListener('change', executarCalculoGeral);
});

function EditarClienteOs(controle) {        
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
        texto.textContent = 'Deseja abrir o módulo do cliente?';
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
          EditarCliente(controle)          
        };        
        
        btnCancelar.onclick = () => {          
          document.body.removeChild(modal);
          carregarClientesos()
        };
      }

function RestauraLabel(){
document.getElementById('descontoPorcentagem').parentElement.innerHTML = `
  <input type="checkbox" id="descontoPorcentagem"> %
`;
document.getElementById('acrescimoPorcentagem').parentElement.innerHTML = `
  <input type="checkbox" id="acrescimoPorcentagem"> %
`;

document.getElementById('descontoPorcentagem').parentElement.style.display = 'inline-block';
document.getElementById('acrescimoPorcentagem').parentElement.style.display = 'inline-block';
}

function tornarDescontoEAcrescimoSomenteLeitura(valor) {
  // Campos numéricos
  document.getElementById('desconto').readOnly = valor;
  document.getElementById('acrescimo').readOnly = valor;

  // Checkboxes (não têm readonly, usamos disabled)
  document.getElementById('descontoPorcentagem').disabled = valor;
  document.getElementById('acrescimoPorcentagem').disabled = valor;
}