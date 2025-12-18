const btnCliente = document.getElementById('btn-clientes');
const formCliente = document.getElementById('formCliente');
btnCliente.addEventListener('click', () => {
  limparNome();  
  deshabilitafixo(false); 
  document.getElementById('btnSalvarCliente').style.display = 'block';
  document.getElementById('formPresenta').style.display = 'none'; 
  document.getElementById('ativo').style.display = 'none';  
  document.querySelector('label[for="ativo"]').style.display = 'none';
  formCliente.style.display = 'block';  
  document.getElementById('formPainel').style.display = 'none';     
  document.getElementById('botoncep').style.display = 'block';
  document.getElementById('botonvalida').style.display = 'block';
  document.getElementById("cpf").focus();
  const msg = window.document.getElementById('tituli');
  msg.innerHTML = `Cadastro de clientes`;   
});


function verificar() {
    const sexoEl = document.querySelector('input[name="radsex"]:checked');
    const estadoCivilEl = document.querySelector('input[name="radciv"]:checked');   
    const sexo = sexoEl ? (sexoEl.value === 'masculino' ? 'Masculino' : 'Feminino') : '';
    const estadoCivil = estadoCivilEl ? estadoCivilEl.value.charAt(0).toUpperCase() + estadoCivilEl.value.slice(1) : '';    
    const cpf = document.getElementById('cpf').value;
    const cliente = document.getElementById('cliente').value;
    const dataNascimento = document.getElementById('datanascimento').value;    
    document.getElementById('botoncep').style.display = 'block';
    AdicionarCliente(); 
  }

  function AdicionarCliente() {
    const sexoEl = document.querySelector('input[name="radsex"]:checked');
    const estadocivilEl = document.querySelector('input[name="radciv"]:checked');     
    const tipoClienteEl = document.querySelector('input[name="radtip"]:checked');
    const cliente = document.getElementById('cliente').value.trim().toUpperCase();
    const cidade = document.getElementById('ciudad').value.trim().toUpperCase();
    const cep = document.getElementById('cep').value.trim().toUpperCase();
    const endereco = document.getElementById('logradouro').value.trim().toUpperCase();
    const bairro = document.getElementById('bairro').value.trim().toUpperCase();
    const numero = document.getElementById('numero').value.trim().toUpperCase();
    const pais = document.getElementById('pais').value.trim().toUpperCase();
    const uf = document.getElementById('estado').value.trim().toUpperCase();
    const telefone = document.getElementById('telefone').value.trim().toUpperCase();
    const celular = document.getElementById('celular').value.trim().toUpperCase();
    const datanascimento = document.getElementById('datanascimento').value;
    const datahoracadastro = new Date().toISOString();
    const naturalidade = document.getElementById('naturalidade').value.trim().toUpperCase();
    const nacionalidade = document.getElementById('nacionalidade').value.trim().toUpperCase();            
    const rg = document.getElementById('rg').value.trim().toUpperCase();      
    const cpf = document.getElementById('cpf').value.trim().toUpperCase();
    const e_mail = document.getElementById('e_mail').value.trim().toUpperCase();
    const limite = document.getElementById('limite').value;
    const tipocliente = tipoClienteEl ? (tipoClienteEl.value === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica') : '';      
    const ativo = "SIM"; // ou document.getElementById('ativo').checked ? "SIM" : "NÃO"    
    const sexo = sexoEl ? (sexoEl.value === 'masculino' ? 'Masculino' : 'Feminino') : '';
    const estadocivil = estadocivilEl ? estadocivilEl.value.charAt(0).toUpperCase() + estadocivilEl.value.slice(1) : '';                  
    const cnpj = document.getElementById('cnpj').value.trim().toUpperCase();      
    const fantasia = document.getElementById('fantasia').value.trim().toUpperCase();      
    const ie = document.getElementById('ie').value.trim().toUpperCase();      
    const im = document.getElementById('im').value.trim().toUpperCase();          
    if(tipocliente == 'Pessoa Física')
   {
     if (!cpf ||!cliente || !cep || !numero  ) {
        resul = "Preencha os campos obrigatórios: * CPF, Cliente, CEP e Numero.";            
        showToast(resul, 2500);                                                                 
        if(!cpf){document.getElementById("cpf").focus(); return }        
        if(!cliente){document.getElementById("cliente").focus(); return }        
        if(!cep){document.getElementById("cep").focus(); return }        
        if(!numero){document.getElementById("numero").focus(); return }        
        if (btnAdicionar) btnAdicionar.disabled = false;
        return;        
      }
    }
      if(tipocliente === 'Pessoa Jurídica')
      {
      if (!cnpj || !cliente || !ie  || !cep || !numero ) {
        resul = "⚠️Preencha os campos obrigatórios: * CNPJ, Cliente, IE, CEP e Numero.";            
        showToast(resul, 2500);                                                                 
        if(!cnpj)
        {document.getElementById("cnpj").focus(); return }
        if(!cliente)
        {document.getElementById("cliente").focus(); return}
        if(!ie)
        { document.getElementById("ie").focus(); return }
        if(!cep){document.getElementById("cep").focus(); return }
        if(!numero){document.getElementById("numero").focus(); return}                     
        if (btnAdicionar) btnAdicionar.disabled = false;
        return;        
      }      
     }        
      
    const btnAdicionar = document.getElementById('btnAdicionar');
    if (btnAdicionar) btnAdicionar.disabled = true;      
  
    
  fetch('/clientes')
  .then(res => res.json())
  .then(clientes => {
  const cpfExistente = clientes.some(c => c.cpf === cpf);
  const cnpjExistente = clientes.some(c => c.cnpj === cnpj);

  if (cpfExistente && cpf) {
    resul = "⚠️ Este CPF já está cadastrado!";            
    showToast(resul, 2500);                                                             
    document.getElementById("cpf").focus();     
    if (btnAdicionar) btnAdicionar.disabled = false;
    return;
  }
  if (cnpjExistente && cnpj) {
    resul = "⚠️ Este CNPJ já está cadastrado!";            
    showToast(resul, 2500);                                                             
    document.getElementById("cnpj").focus();     
    if (btnAdicionar) btnAdicionar.disabled = false;
    return;
  }

  // 🔽 Continua o cadastro normalmente se o CPF não existir
  fetch('/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente,
      cidade,
      cep,
      endereco,
      bairro,
      numero,
      pais,
      uf,
      ativo,
      telefone,
      celular,
      datanascimento,
      datahoracadastro,
      naturalidade,
      nacionalidade,
      rg,
      sexo,
      estadocivil,
      cpf,
      tipocliente,
      cnpj,
      e_mail,
      ie,
      im,
      fantasia,
      limite
    })
  })
  .then(res => {
    if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
    return res.json();
  })
  .then(() => {
    resul = "✅Cadastro do cliente concluído com sucesso!";
    showToast(resul, 2500);                                                             
    limparNome();
  })
  .catch(err => alert('Erro: ' + err.message))
  .finally(() => {
    if (btnAdicionar) btnAdicionar.disabled = false;
  });

})
.catch(err => {
  alert('Erro ao verificar CPF existente: ' + err.message);
  if (btnAdicionar) btnAdicionar.disabled = false;
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


  document.addEventListener('DOMContentLoaded', function () {
  const campos = [
    ["cpf", "rg"],
    ["rg", "cliente"],
    ["cliente", "datanascimento"],
    ["datanascimento", "sexual"],
    ["sexual", "civil"],
    ["civil", "estado"],
    ["estado", "ciudades"],
    ["ciudades", "naciones"],
    ["naciones", "nacionalidad"],
    ["nacionalidad", "naturalidad"],
    ["naturalidad", "cep"],
    ["cep", "botoncep"],
    ["botoncep", "logradouro"],
    ["logradouro", "bairro"],
    ["bairro", "ciudad"],
    ["ciudad", "estados"],
    ["estados", "numero"],
    ["numero", "e_mail"],
    ["e_mail", "telefone"],
    ["telefone", "celular"],
    ["celular", "limite"],    
    ["limite", "btnSalvarCliente"]    
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
    ["cnpj", "cliente"],
    ["cliente", "fantasia"],
    ["fantasia", "ie"],
    ["ie", "im"],
    ["im", "estado"],    
    ["estado", "ciudades"],
    ["ciudades", "naciones"],
    ["naciones", "nacionalidad"],
    ["nacionalidad", "naturalidad"],
    ["naturalidad", "cep"],
    ["cep", "botoncep"],
    ["botoncep", "logradouro"],
    ["logradouro", "bairro"],
    ["bairro", "ciudad"],
    ["ciudad", "estados"],
    ["estados", "numero"],
    ["numero", "e_mail"],
    ["e_mail", "telefone"],
    ["telefone", "celular"],
    ["celular", "limite"],    
    ["limite", "btnSalvarCliente"]    
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