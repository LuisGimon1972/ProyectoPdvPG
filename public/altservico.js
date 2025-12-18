function EditarServico(controle) {  
  limparNome();  
  const msgi = window.document.getElementById('tituloser');
  document.getElementById('formPresenta').style.display = 'none';  
  document.getElementById('formServicio').style.display = 'block';     
  msgi.innerHTML = `Alteração de dados de serviços`;       
fetch(`/produtos/${controle}`)
  .then(res => {
    if (!res.ok) throw new Error('Produto não encontrado.');
    return res.json();
  })
  .then(produto => {    
    document.getElementById('controleser').value = produto.controle || '';
    document.getElementById('servicio').value = produto.produto || '';
    document.getElementById('precoservico').value = produto.precovenda || '';
    document.getElementById('duracao').value = produto.duracao ? converterDecimalParaHora(produto.duracao) : '';
    deshabilitaservicos(false)    
    document.getElementById('btnSalvarServico').style.display = 'none';
    document.getElementById('btnAlterarServico').style.display = 'block';
    document.getElementById('ativoser').style.display = 'inline-block';
    document.querySelector('label[for="ativoser"]').style.display = 'inline-block'; 
    
    const inputAtivo = document.querySelector(`input[name="ativoser"][value="true"]`);
    if (inputAtivo && produto.ativop) {
      inputAtivo.checked = (produto.ativop.toUpperCase() === 'SIM');
    }         
   
    const btnServico = document.getElementById('btnAlterarServico');    
    btnServico.addEventListener('click', () => {          
        AtualizarServico(controle);        
        }, { once: true });
  })
  .catch(err => {
    alert('Erro ao carregar produto: ' + err.message);
  });
}

function VerServico(controle) {    
  const msgi = document.getElementById('tituloser');
  msgi.innerHTML = 'Alteração de dados de Serviços';     
  document.getElementById('formListaItens').style.display = 'none';      
      const formServico = document.getElementById('formServico');
      const formPresenta = document.getElementById('formPresenta');        
      document.getElementById('btnSalvarServico').style.display = 'none';
      document.getElementById('btnAlterarServico').style.display = 'block';      
      const btnServico = document.getElementById('btnAlterarServico');
      const newBtnServico = btnServico.cloneNode(true);
      btnServico.parentNode.replaceChild(newBtnServico, btnServico);
      newBtnServico.addEventListener('click', () => {          
        AtualizarServico(controle);
      }, { once: true });    
}

function AtualizarServico(idServico) { 
  const servicio = document.getElementById('servicio').value.trim().toUpperCase();
  const precoservico = parseFloat(document.getElementById('precoservico').value);
  const duracaoDecimal = document.getElementById('duracao').value.trim();
  const duracao = converterHoraParaDecimal(duracaoDecimal); 
  const aplicacao = 'SERVIÇOS';
  const ativoEl = document.getElementById('ativoser');
  const ativoser = ativoEl.checked ? 'SIM' : 'NÃO';   

  if (!idServico) {
    alert("❌ ID do serviço não encontrado para atualização!");
    return;
  }

  if (!servicio) {
    showToast("⚠️ Informe o nome do serviço!", 2500);
    document.getElementById("servicio").focus();
    VerServico(idServico);
    return;
  }

  if (!precoservico || isNaN(precoservico) || precoservico <= 0) {
    showToast("⚠️ O preço do serviço deve ser maior que zero!", 2500);
    document.getElementById("precoservico").focus();
    VerServico(idServico);
    return;
  }

  const servicoAtualizado = {
    produto: servicio,        
    codbarras: '',             
    fornecedor: '',            
    grupoestoque: '',          
    subgrupoestoque: '',
    marca: '',
    precocusto: 0,
    perclucro: 0,    
    precovenda: precoservico,
    precorevenda: 0,
    precoatacado: 0,
    quantidade: 0,
    quantidademin: 0,
    quantidademax: 0,
    ativop: ativoser,  
    fracionado: 0,
    aplicacao,  
    duracao
  };

  fetch(`/produtos/${idServico}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(servicoAtualizado)
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.json();
    })
    .then(() => {
      showToast("💼 Serviço atualizado com sucesso!", 2500);
      limparNome();
      limparCamposServico()
      document.getElementById('formListaServicos').style.display = 'block';
      document.getElementById('btnListaservico').click();
    })
    .catch(err => {
      alert('Erro ao atualizar serviço: ' + err.message);
    });
}


function esperar() {
setTimeout(() => {
  const resultado = document.getElementById('resultado');
  if (resultado) resultado.style.display = 'none';
}, 3000);
}

