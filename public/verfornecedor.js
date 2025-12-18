function VisualizarFornecedor(controle) {
    limparNome();
    document.getElementById('formPainel').style.display = 'block';           
    const msg = window.document.getElementById('titulifo');
    msg.innerHTML = `Ver dados do Fornecedor`;       
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
    const inputAtivofo = document.querySelector(`input[name="ativof"][value="true"]`);
    if (inputAtivofo && fornecedor.ativo) {
      inputAtivofo.checked = (fornecedor.ativo.toUpperCase() === 'SIM');
    }    
 
             
    deshabilitafornc(true); 
    document.getElementById('botoncepfo').style.display = 'none';
    document.getElementById('btnAlterarFornecedor').style.display = 'none';
    document.getElementById('btnSalvarFornecedor').style.display = 'none';
    document.getElementById('formPresenta').style.display = 'none';                              
    document.getElementById('formFornecedor').style.display = 'block';                                           
  });
}

function deshabilitafornc(valor) {    
    document.getElementById('cnpjfo').disabled = valor;    
    document.getElementById('iefo').disabled = valor;    
    document.getElementById('fornecedore').disabled = valor;    
    document.getElementById('cepfo').disabled = valor;    
    document.getElementById('logradourofo').disabled = valor;    
    document.getElementById('bairrofo').disabled = valor;    
    document.getElementById('ciudadfo').disabled = valor;    
    document.getElementById('estadosfo').disabled = valor;    
    document.getElementById('numerofo').disabled = valor;    
    document.getElementById('telefonefo').disabled = valor;    
    document.getElementById('celularfo').disabled = valor;    
    document.getElementById('e_mailfo').disabled = valor;    
    document.getElementById('ativofo').disabled = valor;             
  }
