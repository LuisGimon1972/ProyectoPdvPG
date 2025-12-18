function emitente() {
  limparNome();  
  deshabilitafixo(false);   
  document.getElementById('btnSalvarEmitente').style.display = 'block';
  document.getElementById('formPresenta').style.display = 'none'; 
  document.getElementById('ativoe').style.display = 'none';
  document.querySelector('label[for="ativoe"]').style.display = 'none';
  document.getElementById('formEmitente').style.display = 'block'; 
  document.getElementById('formPainel').style.display = 'none';         
  document.getElementById('botoncepe').style.display = 'block';
  document.getElementById('botonvalida').style.display = 'block';
  document.getElementById("cpfe").focus();
  const msg = window.document.getElementById('titulie');
  msg.innerHTML = `Cadastro de Emitente`;   
  verificarEmitente();
}

function verificare() {
    const sexoEl = document.querySelector('input[name="radsexe"]:checked');
    const estadoCivilEl = document.querySelector('input[name="radcive"]:checked');   
    const sexo = sexoEl ? (sexoEl.value === 'masculino' ? 'Masculino' : 'Feminino') : '';
    const estadoCivil = estadoCivilEl ? estadoCivilEl.value.charAt(0).toUpperCase() + estadoCivilEl.value.slice(1) : '';    
    const cpf = document.getElementById('cpfe').value;
    const cliente = document.getElementById('emitente').value;
    const dataNascimento = document.getElementById('datanascimentoe').value;    
    document.getElementById('botoncepe').style.display = 'block';    
    AdicionarEmitente(); 
  }

  async function AdicionarEmitente() {
  const btnAdicionar = document.getElementById('btnAdicionare');
  if (btnAdicionar) btnAdicionar.disabled = true;

  try {
    // ─── Coleta de campos ─────────────────────────────
    const sexoEl = document.querySelector('input[name="radsexe"]:checked');
    const estadocivilEl = document.querySelector('input[name="radcive"]:checked');     
    const tipoClienteEl = document.querySelector('input[name="radtipe"]:checked');

    const emitente = getInputValue('emitente');
    const cidade = getInputValue('ciudade');
    const cep = getInputValue('cepe');
    const endereco = getInputValue('logradouroe');
    const bairro = getInputValue('bairroe');
    const numero = getInputValue('numeroe');
    const pais = getInputValue('paise');
    const uf = getInputValue('estadose');
    const telefone = getInputValue('telefoneemite');
    const celular = getInputValue('celulari');
    const datanascimento = document.getElementById('datanascimentoe').value;
    const hoje = new Date();    
    const datahoracadastro = hoje.toLocaleDateString("pt-BR");
    const naturalidade = getInputValue('naturalidadee');
    const nacionalidade = getInputValue('nacionalidadee');            
    const rg = getInputValue('rge');      
    const cpf = getInputValue('cpfe');
    const cnpj = getInputValue('cnpje');      
    const e_mail = getInputValue('e_maile');    
    const fantasia = getInputValue('fantasiae');      
    const ie = getInputValue('iee');      
    const im = getInputValue('ime');     
    const suframa = getInputValue('suframa');     
    const crt = regimen;     
    const segmento = segmentoSelecionado;
    const faixa = faixar;
    const tipoemitente = tipoClienteEl ? (tipoClienteEl.value === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica') : '';      
    const sexo = sexoEl ? capitalize(sexoEl.value) : '';
    const estadocivil = estadocivilEl ? capitalize(estadocivilEl.value) : '';                  
    const ativo = "SIM"; 
    const tipodebusca = "CONTROLE"      

    
    if (tipoemitente === 'Pessoa Física') {
      if (!cpf || !emitente || !fantasia || !ie || !crt || !segmento || !faixa || !cep || !numero) {
        return avisoCamposObrigatorios(['CPF', 'Emitente', 'FANTASIA', 'IE','REGIME', 'SEGMENTO', 'FAIXA', 'CEP', 'Número']);
      }
    } else if (tipoemitente === 'Pessoa Jurídica') {
      if (!cnpj || !emitente || !fantasia || !ie || !crt || !segmento || !faixa || !cep || !numero) {
        return avisoCamposObrigatoriosj(['CNPJ', 'Emitente', 'FANTASIA', 'IE', 'REGIME', 'SEGMENTO', 'FAIXA', 'CEP', 'Número']);
      }
    }

    if(!cepvalido)
    {
     result = "CEP não encontrado!";  
     showToast(result, 2500);       
     document.getElementById("cepe").focus()                                                                 
     return;
    }

    // ─── Verificação de CPF/CNPJ duplicado ─────────────
    const emitentes = await fetchJson('/emitente');
    if (cpf && emitentes.some(e => e.cpf === cpf)) return avisoDuplicado('CPF', 'cpfe');
    if (cnpj && emitentes.some(e => e.cnpj === cnpj)) return avisoDuplicado('CNPJ', 'cnpje');

    // ─── Cadastro ─────────────────────────────────────
    const cadastro = {
      emitente, cidade, cep, endereco, bairro, numero, pais, uf, ativo,
      telefone, celular, datanascimento, datahoracadastro, naturalidade,
      nacionalidade, rg, sexo, estadocivil, cpf, cnpj, tipocliente: tipoemitente,
      e_mail, ie, im, suframa, crt, segmento, faixa, fantasia,  tipodebusca
    };

    await fetchPost('/emitente', cadastro);

    showToast("✅ Cadastro do emitente concluído com sucesso!", 2500);
    cepvalido = false
    controlarBotoesMenu(true)
    limparEmitenteForm();
    limparNome();  
    buscarEmitente(1)  

  } catch (err) {
    alert("Erro: " + err.message);
  } finally {
    if (btnAdicionar) btnAdicionar.disabled = false;
  }
}

// ─── Funções auxiliares ─────────────────────────────
function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim().toUpperCase() : '';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function avisoCamposObrigatorios(campos) {
  showToast(`⚠️ Preencha os campos obrigatórios: * ${campos.join(', ')}.`, 2500);

  const camposIds = [    
    "cpfe",    
    "emitente",
    "fantasiae",
    "iee",    
    "rt",      
    "segmento",                
    "faixa",            
    "cepe",    
    "numeroe"
  ];

  for (const id of camposIds) {
    const elemento = document.getElementById(id);
    if (elemento && elemento.value.trim() === '') {
      elemento.focus();
      return;
    }
  }
}

function avisoCamposObrigatoriosj(campos) {
  showToast(`⚠️ Preencha os campos obrigatórios: * ${campos.join(', ')}.`, 2500);

  const camposIds = [    
    "cnpje",
    "emitente",
    "fantasiae",
    "iee",        
    "rt",            
    "segmento",                
    "faixa",            
    "cepe",    
    "numeroe"
  ];

  for (const id of camposIds) {
    const elemento = document.getElementById(id);
    if (elemento && elemento.value.trim() === '') {
      elemento.focus();
      return;
    }
  }
}


function avisoDuplicado(tipo, campoId) {
  showToast(`⚠️ Este ${tipo} já está cadastrado!`, 2500);
  const campo = document.getElementById(campoId);
  if (campo) campo.focus();
  return false;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao acessar ${url}`);
  return res.json();
}

async function fetchPost(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
}

function limparEmitenteForm() {
  const campos = [
    "emitente","ciudade","cepe","logradouroe","bairroe","numeroe",
    "paise","estadoe","telefoneemite","celulari","datanascimentoe",
    "naturalidadee","nacionalidadee","rge","cpfe","cnpje","e_maile",
    "fantasiae","iee","ime","rt","segmento","faixa"
  ];
  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const radios = ['radsexe','radcive','radtipe'];
  radios.forEach(name => {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (selected) selected.checked = false;
  });
}


  function validar() {
    const cpf = document.getElementById("cpf").value;
    const resultado = document.getElementById("resultado");

    if (validarCPF(cpf)) {
      resul = "✅ CPF válido no formato.";      
      showToast(resul, 2500);                                                              
      setTimeout(() => {      
      }, 300);
    } else {
      resul = "❌ CPF inválido.";            
      showToast(resul, 2500);                                                               
    }
  }

  async function verificarEmitente() {
  try {    
    const resp = await fetch("/emitente"); // rota GET que retorna emitente
    const dados = await resp.json();

    if (dados && dados.length > 0) {
      // Se já tem emitente cadastrado
      document.getElementById('btnSalvarEmitente').style.display = 'none';
      document.getElementById('btnAlterarEmitente').style.display = 'block';
      carregarEmitente(1)
      //document.getElementById('botoncepe').click();
    } else {
      document.getElementById('btnSalvarEmitente').style.display = 'block';
      document.getElementById('btnAlterarEmitente').style.display = 'none';
      // Se não tem emitente
      //AdicionarEmitente();
    }
  } catch (err) {
    console.error("Erro ao verificar emitente:", err);
  }
}


document.addEventListener('DOMContentLoaded', function () {
  const campos = [
    ["cpfe", "rge"],
    ["rge", "emitente"],    
    ["emitente", "fantasiae"],
    ["fantasiae", "datanascimentoe"],
    ["datanascimentoe", "iee"],
    ["iee", "ime"],
    ["ime", "suframa"],
    ["suframa", "rt"],
    ["rt", "segmento"],
    ["segmento", "faixa"],
    ["faixa", "sexuale"],    
    ["sexuale", "civile"],
    ["civile", "estadoe"],
    ["estadoe", "cidadee"],
    ["cidadee", "paise"],
    ["paise", "nacionalidadee"],
    ["nacionalidadee", "naturalidadee"],
    ["naturalidadee", "cepe"],
    ["cepe", "botoncepe"],
    ["botoncepe", "logradouroe"],
    ["logradouroe", "bairroe"],
    ["bairroe", "ciudade"],
    ["ciudade", "estadose"],
    ["estadose", "numeroe"],
    ["numeroe", "e_maile"],
    ["e_maile", "telefoneemite"],
    ["telefoneemite", "celulari"],
    ["celulari", "btnAlterarEmitente"]    
    
  ];

  campos.forEach(([de, para]) => {
    const elemDe = document.getElementById(de);
    const elemPara = document.getElementById(para);
    if (elemDe && elemPara) {
      elemDe.addEventListener("keydown", function (event) {
        if (event.key === "Enter") elemPara.focus();
      });
    }
  });  
});


document.addEventListener('DOMContentLoaded', function () {
  const campos2 = [   
    ["cnpje", "emitente"],    
    ["emitente", "fantasiae"],
    ["fantasiae", "datanascimentoe"],
    ["datanascimentoe", "iee"],
    ["iee", "ime"],
    ["ime", "suframa"],
    ["suframa", "rt"],
    ["rt", "segmento"],
    ["segmento", "faixa"],
    ["faixa", "estadoe"],        
    ["estadoe", "cidadee"],
    ["cidadee", "paise"],
    ["paise", "cepe"],   
    ["cepe", "botoncepe"],
    ["botoncepe", "logradouroe"],
    ["logradouroe", "bairroe"],
    ["bairroe", "ciudade"],
    ["ciudade", "estadose"],
    ["estadose", "numeroe"],
    ["numeroe", "e_maile"],
    ["e_maile", "telefoneemite"],
    ["telefoneemite", "celulari"],
    ["celulari", "btnAlterarEmitente"]    
  ];

  campos2.forEach(([de, para]) => {
    const elemDe = document.getElementById(de);
    const elemPara = document.getElementById(para);
    if (elemDe && elemPara) {
      elemDe.addEventListener("keydown", function (event) {
        if (event.key === "Enter") elemPara.focus();
      });
    }
  });  
});