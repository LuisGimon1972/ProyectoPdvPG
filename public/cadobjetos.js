let dadosCliente = {};
let listaObjetos = [];
const btnAlterarX = document.getElementById('alterartodo');
btnAlterarX.addEventListener('click', () => {  
  if(swos){
    controleaux = controleSelecionadoos
  }
  atualizarTudo(controleaux)    
});

function salvarDadosClienteTemp() {    
  window.scrollTo(0, 0);  
  limparObjetos();
  document.getElementById("tbodyObjetos").innerHTML = "";
  listaObjetos = [];
  Passar()    
  dadosCliente = {
    cliente: document.getElementById('cliente').value.trim().toUpperCase(),
    cidade: document.getElementById('cidade').value.trim().toUpperCase(),
    cep: document.getElementById('cep').value.trim(),
    endereco: document.getElementById('logradouro').value.trim().toUpperCase(),
    bairro: document.getElementById('bairro').value.trim().toUpperCase(),
    numero: document.getElementById('numero').value.trim(),
    pais: document.getElementById('pais').value.trim().toUpperCase(),
    uf: document.getElementById('estados').value.trim().toUpperCase(),
    ativo: ativoaux,
    telefone: document.getElementById('telefone').value.trim(),
    celular: document.getElementById('celular').value.trim(),
    datanascimento: document.getElementById('datanascimento').value,
    datahoracadastro: new Date().toISOString(),
    naturalidade: document.getElementById('naturalidade').value.trim().toUpperCase(),
    nacionalidade: document.getElementById('nacionalidade').value.trim().toUpperCase(),
    rg: document.getElementById('rg').value.trim(),
    sexo: sexoaux,
    estadocivil: civilaux,
    cpf: document.getElementById('cpf').value.trim(),
    tipocliente: document.querySelector('input[name="radtip"]:checked')?.value || '',
    cnpj: document.getElementById('cnpj').value.trim(),
    e_mail: document.getElementById('email').value.trim(),
    ie: document.getElementById('ie').value.trim(),
    im: document.getElementById('im').value.trim(),
    fantasia: document.getElementById('fantasia').value.trim().toUpperCase(),
    limite: document.getElementById('limite').value.trim()
  }; 
   
  if(dadosCliente.tipocliente == 'fisica')
      {
        dadosCliente.tipocliente = 'Pessoa Física'
        if (!dadosCliente.cpf ||!dadosCliente.cliente || !dadosCliente.cep || !dadosCliente.numero  ) {
           resul = "⚠️Preencha os campos obrigatórios: * CPF, Cliente, CEP e Numero.";            
           showToast(resul, 2500);                                     
           if(!dadosCliente.cpf){document.getElementById("cpf").focus();  return }        
           if(!dadosCliente.cliente){document.getElementById("cliente").focus();  return }        
           if(!dadosCliente.cep){document.getElementById("cep").focus(); return }        
           if(!dadosCliente.numero){document.getElementById("numero").focus(); return }                              
         }
       }
         if(dadosCliente.tipocliente === 'juridica')
         {
         dadosCliente.tipocliente = 'Pessoa Jurídica'
         if (!dadosCliente.cnpj || !dadosCliente.cliente || !dadosCliente.ie  || !dadosCliente.cep || !dadosCliente.numero ) {
           resul = "⚠️Preencha os campos obrigatórios: * CNPJ, Cliente, IE, CEP e Numero.";   
           showToast(resul, 2500);                                                         
           if(!dadosCliente.cnpj)
           {document.getElementById("cnpj").focus();  return }
           if(!dadosCliente.cliente)
           {document.getElementById("cliente").focus(); return}
           if(!dadosCliente.ie)
           { document.getElementById("ie").focus(); return }
           if(!dadosCliente.cep){document.getElementById("cep").focus(); return }
           if(!dadosCliente.numero){document.getElementById("numero").focus(); return}                                
         }
        }         
  
  document.getElementById('formCliente').style.display = 'none';
  document.getElementById('formObjetos').style.display = 'block';      
  if (salva == 1) {
  document.getElementById('salvartodo').style.display = 'in-block';
  document.getElementById('alterartodo').style.display = 'none';
} else {
  document.getElementById('salvartodo').style.display = 'none';
  document.getElementById('alterartodo').style.display = 'in-block';
}

  if(controleaux!=null)
  {    
    carregarObjetosCliente(controleaux);
  }
}

function adicionarObjeto() {  
  const tipo = document.getElementById('tipo').value.trim();
  const marca = document.getElementById('marcao').value.trim().toUpperCase(); 
  const modelo = document.getElementById('modelo').value.trim().toUpperCase();
  const ano = document.getElementById('ano').value.trim().toUpperCase();
  const cor = document.getElementById('cor').value.trim().toUpperCase();
  const serie = document.getElementById('serie').value.trim().toUpperCase();
  const observacao = document.getElementById('observacao').value.trim().toUpperCase();
  
  if (!tipo) {    
    showToast('Informe o tipo do objeto!', 2500); document.getElementById('tipo').focus();return;    
  } 
  if (!marca) {    
    showToast('Informe a marca do objeto!', 2500); document.getElementById('marcao').focus();return;    
  } 
  if (!modelo) {    
    showToast('Informe o modelo objeto!', 2500); document.getElementById('modelo').focus();return;    
  } 
  if (tipo =='VEÍCULO') {    
    {
     if (!serie) {    
    showToast('Informe a placa do veículo!', 2500); document.getElementById('serie').focus();return;    
     } 
    }    
  }    
  listaObjetos.push({ tipo, marca, modelo, ano, cor, serie, observacao });
  atualizarTabelaObjetos();    
  limparObjetos();
}

function limparObjetos()
{
  const tipoSelect = document.getElementById('tipo');  
  if (tipoSelect) {
    tipoSelect.value = 'VEÍCULO';
  }  
  document.getElementById('marcao').value = '';
  document.getElementById('modelo').value = '';
  document.getElementById('ano').value = '';
  document.getElementById('cor').value = '';
  document.getElementById('serie').value = '';
  document.getElementById('observacao').value = '';
}

function atualizarTabelaObjetos() {
  const tbody = document.getElementById('tbodyObjetos');
  tbody.innerHTML = '';

  listaObjetos.forEach((obj, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${obj.tipo}</td>
      <td>${obj.marca}</td>
      <td>${obj.modelo}</td>
      <td>${obj.ano}</td>
      <td>${obj.cor}</td>
      <td>${obj.serie}</td>
      <td>${obj.observacao}</td>
      <td><button onclick="removerObjeto(${i})">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  });    
}

function removerObjeto(i) {
  listaObjetos.splice(i, 1);
  atualizarTabelaObjetos();
}

function salvarTudo() {
    Passar()    
  dadosCliente = {
    cliente: document.getElementById('cliente').value.trim().toUpperCase(),
    cidade: document.getElementById('cidade').value.trim().toUpperCase(),
    cep: document.getElementById('cep').value.trim(),
    endereco: document.getElementById('logradouro').value.trim().toUpperCase(),
    bairro: document.getElementById('bairro').value.trim().toUpperCase(),
    numero: document.getElementById('numero').value.trim(),
    pais: document.getElementById('pais').value.trim().toUpperCase(),
    uf: document.getElementById('estados').value.trim().toUpperCase(),
    ativo: ativoaux,
    telefone: document.getElementById('telefone').value.trim(),
    celular: document.getElementById('celular').value.trim(),
    datanascimento: document.getElementById('datanascimento').value,
    datahoracadastro: new Date().toISOString(),
    naturalidade: document.getElementById('naturalidade').value.trim().toUpperCase(),
    nacionalidade: document.getElementById('nacionalidade').value.trim().toUpperCase(),
    rg: document.getElementById('rg').value.trim(),
    sexo: sexoaux,
    estadocivil: civilaux,
    cpf: document.getElementById('cpf').value.trim(),
    tipocliente: document.querySelector('input[name="radtip"]:checked')?.value || '',
    cnpj: document.getElementById('cnpj').value.trim(),
    e_mail: document.getElementById('email').value.trim(),
    ie: document.getElementById('ie').value.trim(),
    im: document.getElementById('im').value.trim(),
    fantasia: document.getElementById('fantasia').value.trim().toUpperCase(),
    limite: document.getElementById('limite').value.trim()
  }; 
   
  if(dadosCliente.tipocliente == 'fisica')
      {
        dadosCliente.tipocliente = 'Pessoa Física'
        if (!dadosCliente.cpf ||!dadosCliente.cliente || !dadosCliente.cep || !dadosCliente.numero  ) {
           resul = "⚠️Preencha os campos obrigatórios: * CPF, Cliente, CEP e Numero.";            
           showToast(resul, 2500);                                     
           if(!dadosCliente.cpf){document.getElementById("cpf").focus();  return }        
           if(!dadosCliente.cliente){document.getElementById("cliente").focus();  return }        
           if(!dadosCliente.cep){document.getElementById("cep").focus(); return }        
           if(!dadosCliente.numero){document.getElementById("numero").focus(); return }                              
         }
       }
         if(dadosCliente.tipocliente === 'juridica')
         {
         dadosCliente.tipocliente = 'Pessoa Jurídica'
         if (!dadosCliente.cnpj || !dadosCliente.cliente || !dadosCliente.ie  || !dadosCliente.cep || !dadosCliente.numero ) {
           resul = "⚠️Preencha os campos obrigatórios: * CNPJ, Cliente, IE, CEP e Numero.";   
           showToast(resul, 2500);                                                         
           if(!dadosCliente.cnpj)
           {document.getElementById("cnpj").focus();  return }
           if(!dadosCliente.cliente)
           {document.getElementById("cliente").focus(); return}
           if(!dadosCliente.ie)
           { document.getElementById("ie").focus(); return }
           if(!dadosCliente.cep){document.getElementById("cep").focus(); return }
           if(!dadosCliente.numero){document.getElementById("numero").focus(); return}                                
         }
        }         

  if (Object.keys(dadosCliente).length === 0) {
    alert('Por favor, cadastre primeiro os dados do cliente.');
    return;
  }
  
  fetch('/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosCliente)
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.json();
    })
    .then(clienteCriado => {
  const clienteId = clienteCriado.id; 

  if (listaObjetos.length > 0) {
    const promises = listaObjetos.map(obj =>
      fetch(`/clientes/${clienteId}/objetos-veiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: obj.tipo || 'OUTRO',
          marca: obj.marca || '',
          modelo: obj.modelo || '',
          ano: obj.ano || '',
          cor: obj.cor || '',
          placaSerie: obj.serie || '',
          numeroSerie: obj.numeroSerie || '',
          observacoes: obj.observacao || ''
        })
      })
    );
    return Promise.all(promises);
  }
})
    .then(() => {
      showToast('✅ Cliente cadastrado com sucesso!', 2500);      
      dadosCliente = {};
      listaObjetos = [];
      atualizarTabelaObjetos();
      limparNome();      
    })
    .catch(err => alert('Erro ao salvar: ' + err.message));
}

function atualizarTudo(clienteId) {  
  Passar()    
    dadosCliente = {
    cliente: document.getElementById('cliente').value.trim().toUpperCase(),
    cidade: document.getElementById('cidade').value.trim().toUpperCase(),
    cep: document.getElementById('cep').value.trim(),
    endereco: document.getElementById('logradouro').value.trim().toUpperCase(),
    bairro: document.getElementById('bairro').value.trim().toUpperCase(),
    numero: document.getElementById('numero').value.trim(),
    pais: document.getElementById('pais').value.trim().toUpperCase(),
    uf: document.getElementById('estados').value.trim().toUpperCase(),
    ativo: ativoaux,
    telefone: document.getElementById('telefone').value.trim(),
    celular: document.getElementById('celular').value.trim(),
    datanascimento: document.getElementById('datanascimento').value,
    datahoracadastro: new Date().toISOString(),
    naturalidade: document.getElementById('naturalidade').value.trim().toUpperCase(),
    nacionalidade: document.getElementById('nacionalidade').value.trim().toUpperCase(),
    rg: document.getElementById('rg').value.trim(),
    sexo: sexoaux,
    estadocivil: civilaux,
    cpf: document.getElementById('cpf').value.trim(),
    tipocliente: document.querySelector('input[name="radtip"]:checked')?.value || '',
    cnpj: document.getElementById('cnpj').value.trim(),
    e_mail: document.getElementById('email').value.trim(),
    ie: document.getElementById('ie').value.trim(),
    im: document.getElementById('im').value.trim(),
    fantasia: document.getElementById('fantasia').value.trim().toUpperCase(),
    limite: document.getElementById('limite').value.trim()
  };
  
  if (!dadosCliente.cliente) {
    alert('Informe o nome do cliente antes de avançar.');
    return;
  }  
  if(dadosCliente.tipocliente == 'fisica')
      {
        dadosCliente.tipocliente = 'Pessoa Física'
        if (!dadosCliente.cpf ||!dadosCliente.cliente || !dadosCliente.cep || !dadosCliente.numero  ) {
           resul = "⚠️Preencha os campos obrigatórios: * CPF, Cliente, CEP e Numero.";            
           showToast(resul, 2500);                                     
           if(!dadosCliente.cpf){document.getElementById("cpf").focus(); VerClienteM(clienteId); return }        
           if(!dadosCliente.cliente){document.getElementById("cliente").focus(); VerClienteM(clienteId); return }        
           if(!dadosCliente.cep){document.getElementById("cep").focus(); VerClienteM(clienteId); return }        
           if(!dadosCliente.numero){document.getElementById("numero").focus(); VerClienteM(clienteId); return }                            
         }
       }
         if(dadosCliente.tipocliente === 'juridica')
         {
         dadosCliente.tipocliente = 'Pessoa Jurídica'
         if (!dadosCliente.cnpj || !dadosCliente.cliente || !dadosCliente.ie  || !dadosCliente.cep || !dadosCliente.numero ) {
           resul = "⚠️Preencha os campos obrigatórios: * CNPJ, Cliente, IE, CEP e Numero.";   
           showToast(resul, 2500);                                                         
           if(!dadosCliente.cnpj)
           {document.getElementById("cnpj").focus(); VerClienteM(clienteId); return }        
           if(!dadosCliente.cliente)
           {document.getElementById("cliente").focus(); VerClienteM(clienteId); return }        
           if(!dadosCliente.ie)
           { document.getElementById("ie").focus(); VerClienteM(clienteId); return }        
           if(!dadosCliente.cep){document.getElementById("cep").focus(); VerClienteM(clienteId); return }        
           if(!dadosCliente.numero){document.getElementById("numero").focus(); VerClienteM(clienteId); return }        
         }
        }

  if (!clienteId) {
    alert('Cliente não identificado para atualização.');
    return;
  }

  if (Object.keys(dadosCliente).length === 0) {
    alert('Por favor, preencha os dados do cliente antes de salvar.');
    return;
  }
 
  fetch(`/clientes/${clienteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosCliente)
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.json();
    })
    .then(() => {      
      if (listaObjetos.length > 0) {        
        return fetch(`/clientes/${clienteId}/objetos-veiculos`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) return res.text().then(msg => { throw new Error(msg); });            
            const promises = listaObjetos.map(obj =>
              fetch(`/clientes/${clienteId}/objetos-veiculos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tipo: obj.tipo || 'OUTRO',
                  marca: obj.marca || '',
                  modelo: obj.modelo || '',
                  ano: obj.ano || '',
                  cor: obj.cor || '',
                  placaSerie: obj.placaSerie || obj.serie || '',
                  numeroSerie: obj.numeroSerie || '',
                  observacoes: obj.observacoes || obj.observacao || ''
                })
              })
            );
            return Promise.all(promises);
          });
      } else {        
        return fetch(`/clientes/${clienteId}/objetos-veiculos`, { method: 'DELETE' }); // garante que limpe caso tenha sobrado algo
      }
    })
    .then(() => {
      showToast('✅ Cliente atualizado com sucesso!', 2500);
      dadosCliente = {};
      listaObjetos = [];
      listaObjetos.tipo = 'Veículo'
      atualizarTabelaObjetos();
      limparNome();      
      if(!swos){
      document.getElementById('formPresenta').style.display = 'none';
      document.getElementById('formLista').style.display = 'block';
      document.getElementById('btnListar').click();
      }
      else{
        document.getElementById('formPresenta').style.display = 'none';        
        document.getElementById('formPainel').style.display = 'none';   
        document.getElementById('formCalculos').style.display = 'none';     
        document.getElementById('formOs').style.display = 'block';     
        const select = document.getElementById('selectClienteos');
        if (select) {      
          select.innerHTML = '<option value="">-- Selecione --</option>';
        }
        if (select && select._hasChangeListener) {
          select.removeEventListener('change', select._changeHandler);
          select._hasChangeListener = false;
        }
        carregarClientesos()
      }
      swos = false
    })
    .catch(err => {
      alert('❌ Erro ao atualizar: ' + err.message);
      console.error('Erro detalhado:', err);
    });
}

function carregarObjetosCliente(clienteId) {
  if (!clienteId) {
    console.warn("⚠️ Nenhum clienteId informado para carregar objetos.");
    return;
  }

  fetch(`/clientes/${clienteId}/objetos-veiculos`)
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar objetos do cliente.');
      return res.json();
    })
    .then(objetos => {
      listaObjetos = objetos.map(o => ({
        id: o.id,
        tipo: o.tipo || '',
        marca: o.marca || '',
        modelo: o.modelo || '',
        ano: o.ano || '',
        cor: o.cor || '',
        serie: o.placaSerie || '',
        numeroSerie: o.numeroSerie || '',
        observacao: o.observacoes || ''
      }));

      atualizarTabelaObjetos(); 
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao carregar objetos do cliente: ' + err.message);
    });
}

document.addEventListener('DOMContentLoaded', function () {
  const campos2 = [
    ["tipo", "marcao"],
    ["marcao", "modelo"],
    ["modelo", "ano"],
    ["ano", "cor"],
    ["cor", "serie"],    
    ["serie", "observacao"],    
    ["observacao", "adicob"]    
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