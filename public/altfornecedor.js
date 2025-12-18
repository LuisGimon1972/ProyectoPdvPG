function VerFornecedor(controle) {    
  const msgi = window.document.getElementById('titulop');  
  msgi.innerHTML = `Alteração de dados de produtos`;     
  document.getElementById('formListaItens').style.display = 'none';     
  deshabilitafornc(false); 
  document.getElementById('cnpjfo').disabled = true;         
  document.getElementById('botoncepfo').style.display = 'inline-block';
  document.getElementById('botoncepfo').click();           
  document.getElementById('btnAlterarFornecedor').style.display = 'block';
  document.getElementById('btnSalvarFornecedor').style.display = 'none';
  document.getElementById('formPresenta').style.display = 'none';                              
  document.getElementById('formFornecedor').style.display = 'block';    
  document.getElementById('formPainel').style.display = 'block';     
  const btnFornecedor = document.getElementById('btnAlterarFornecedor');
  const newBtnFornecedor = btnFornecedor.cloneNode(true);
  btnFornecedor.parentNode.replaceChild(newBtnFornecedor, btnFornecedor);
  newBtnFornecedor.addEventListener('click', () => {          
  AlterarFornecedore(controle);
  document.getElementById('formFornecedor').style.display = 'block';   
  }, { once: true });
}    

function EditarFornecedore(controle) {
    limparNome();
    const msg = window.document.getElementById('titulifo');
    msg.innerHTML = `Alteração de dados do Fornecedor`;       
    fetch(`/fornecedores/${controle}`)
    .then(res => {
        if (!res.ok) throw new Error('Fornecedor não encontrado.');
        return res.json();
    })
    .then(fornecedor => {    
        document.getElementById('cnpjfo').value = fornecedor.cnpj || '';
        document.getElementById('iefo').value = fornecedor.ie || '';
        document.getElementById('fornecedore').value = fornecedor.fornecedor || '';        
        document.getElementById('cepfo').value = fornecedor.cep || '';
        document.getElementById('logradourofo').value = fornecedor.endereco || '';
        document.getElementById('bairrofo').value = fornecedor.bairro || '';
        document.getElementById('ciudadfo').value = fornecedor.cidade || '';
        document.getElementById('estadosfo').value = fornecedor.uf || '';
        document.getElementById('numerofo').value = fornecedor.numero || '';   
        document.getElementById('telefonefo').value = fornecedor.telefone || '';
        document.getElementById('celularfo').value = fornecedor.celular || '';    
        document.getElementById('e_mailfo').value = fornecedor.email || '';             
        document.getElementById('ativofo').style.display = 'inline-block';
        document.querySelector('label[for="ativofo"]').style.display = 'inline-block';       
        document.getElementById('ativofo').checked = fornecedor.ativo && fornecedor.ativo.toUpperCase() === 'SIM';
        deshabilitafornc(false); 
        document.getElementById('cnpjfo').disabled = true;         
        document.getElementById('botoncepfo').style.display = 'inline-block';
        document.getElementById('botoncepfo').click();             
        document.getElementById('btnAlterarFornecedor').style.display = 'block';
        document.getElementById('btnSalvarFornecedor').style.display = 'none';
        document.getElementById('formPresenta').style.display = 'none';                              
        document.getElementById('formFornecedor').style.display = 'block';    
        document.getElementById('formPainel').style.display = 'block';     
        const btnFornecedor = document.getElementById('btnAlterarFornecedor');
        const newBtnFornecedor = btnFornecedor.cloneNode(true);
        btnFornecedor.parentNode.replaceChild(newBtnFornecedor, btnFornecedor);
        newBtnFornecedor.addEventListener('click', () => {          
            AlterarFornecedore(controle);
            document.getElementById('formFornecedor').style.display = 'block';   
        }, { once: true });
    })
    .catch(err => {
        alert('Erro ao carregar fornecedor: ' + err.message);
    });
}

function AlterarFornecedore(controle) {
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
      resul = "Preencha os campos obrigatórios: * CNPJ, IE, FORNECEDOR e CEP";
      showToast(resul, 2500);                                                             
      if (!cnpj) { document.getElementById("cnpjfo").focus(); VerFornecedor(controle); return; }
      if (!ie) { document.getElementById("iefo").focus(); VerFornecedor(controle); return; }      
      if (!fornecedor) { document.getElementById("fornecedore").focus(); VerFornecedor(controle); return; }      
      if (!cep) { document.getElementById("cepfo").focus(); VerFornecedor(controle);return; }      
      if (!numero) { document.getElementById("numerofo").focus(); VerFornecedor(controle); return; }        
    }  
  const btnAlterar = document.getElementById('btnAlterarFornecedor');
if (btnAlterar) btnAlterar.disabled = true;


fetch(`/fornecedores/${controle}`, {
  method: 'PUT',
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
    if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
    return res.json();
  })
  .then(() => {
    resul = "✅ Dados do fornecedor atualizados com sucesso!";
    showToast(resul, 2500);                                                                    
    limparNome();
    document.getElementById('btnListarfo').click();                     
  })
  .catch(err => alert('Erro: ' + err.message))
  .finally(() => {
    if (btnAlterar) btnAlterar.disabled = false;
  });
}

function esperar() {
setTimeout(() => {
  const resultado = document.getElementById('resultado');
  if (resultado) resultado.style.display = 'none';
}, 3000);
}