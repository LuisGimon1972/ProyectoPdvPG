function cadastrofornecedores() {   
  limparNome(); 
  document.getElementById('formPresenta').style.display = 'none';      
  document.getElementById('formFornecedor').style.display = 'block';       
  document.getElementById('formPainel').style.display = 'none';      
  document.getElementById("cnpjfo").focus();
  document.getElementById('btnSalvarFornecedor').style.display = 'block';
  document.getElementById('btnAlterarFornecedor').style.display = 'none';    
  document.getElementById('ativofo').style.display = 'block';
  document.querySelector('label[for="ativofo"]').style.display = 'block';
  deshabilitafornc(false); 
  document.getElementById('botoncepfo').style.display = 'in-block'; 
  document.getElementById('btnSalvarFornecedor').style.display = 'block';  
  const msg = window.document.getElementById('titulifo');
  msg.innerHTML = `Cadastro de Fornecedor`;       
}

function SalvarFornec() {
  const fornecedor = document.getElementById('fornecedore').value.trim().toUpperCase();
  const cnpj = document.getElementById('cnpjfo').value.trim().toUpperCase();
  const ie = document.getElementById('iefo').value.trim().toUpperCase();
  const cep = document.getElementById('cepfo').value.trim().toUpperCase();
  const endereco = document.getElementById('logradourofo').value.trim().toUpperCase();
  const bairro = document.getElementById('bairrofo').value.trim().toUpperCase();
  const numero = document.getElementById('numerofo').value.trim().toUpperCase();
  const uf = document.getElementById('estadosfo').value.trim().toUpperCase();
  const cidade = document.getElementById('ciudadfo').value.trim().toUpperCase();
  const telefone = document.getElementById('telefonefo').value.trim().toUpperCase();
  const celular = document.getElementById('celularfo').value.trim().toUpperCase();
  const email = document.getElementById('e_mailfo').value.trim().toUpperCase();
  const agora = new Date();
  const datahoracadastrofo = agora.toLocaleString('pt-BR');  
  const observacoes = "";  
  const ativoCheckbox = document.getElementById('ativofo');
  const ativo = ativoCheckbox.checked ? "SIM" : "NÃO";

  if (!cnpj  || !fornecedor || !ie || !cep || !numero) {
      resul = "Preencha os campos obrigatórios: * CNPJ, IE, FORNECEDOR, CEP e NÚMERO";
      showToast(resul, 2500);                                                             
      if (!cnpj) { document.getElementById("cnpjfo").focus(); return; }
      if (!ie) { document.getElementById("iefo").focus(); return; }      
      if (!fornecedor) { document.getElementById("fornecedore").focus(); return; }      
      if (!cep) { document.getElementById("cepfo").focus(); return; }    
      if (!numero) { document.getElementById("numerofo").focus(); return; }        
    }  

  fetch('/fornecedores')
    .then(res => res.json())
    .then(fornecedores => {
      const cnpjExistente = fornecedores.some(f => f.cnpj === cnpj);
      if (cnpjExistente && cnpj) {
        showToast("⚠️ Este CNPJ já está cadastrado!", 2500);
        document.getElementById("cnpjfo").focus();
        return;
      }      
      fetch('/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fornecedor,
          cnpj,
          ie,
          endereco,
          bairro,
          cidade,
          uf,
          cep,
          numero,
          telefone,
          celular,
          email,
          datahoracadastrofo,
          observacoes,
          ativo
        })
      })
      .then(res => {
        if (!res.ok) {
          return res.text().then(msg => { throw new Error(msg); });
        }
        return res.json();
      })
      .then(() => {
        showToast("💼 Cadastro do fornecedor concluído com sucesso!", 2500);
        limparNome();
      })
      .catch(err => {
        alert('Erro ao cadastrar fornecedor: ' + err.message);
      });
    })
    .catch(err => {
      alert('Erro ao verificar fornecedores: ' + err.message);
    });
}

document.addEventListener('DOMContentLoaded', function () {
  const campos = [
    ["cnpjfo", "iefo"],
    ["iefo", "fornecedore"],
    ["fornecedore", "cepfo"],    
    ["cepfo", "botoncepfo"],
    ["botoncepfo", "logradourofo"],
    ["logradourofo", "bairrofo"],
    ["bairrofo", "ciudadfo"],
    ["ciudadfo", "estadosfo"],
    ["estadosfo", "numerofo"],
    ["numerofo", "e_mailfo"],
    ["e_mailfo", "telefonefo"],
    ["telefonefo", "celularfo"],
    ["celularfo", "btnSalvarFornecedor"]    
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