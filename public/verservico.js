function VisualizarServico(controle) {  
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
    deshabilitaservicos(true)    
    document.getElementById('btnSalvarServico').style.display = 'none';
    document.getElementById('btnAlterarServico').style.display = 'none';
    document.getElementById('ativoser').style.display = 'inline-block';
    document.querySelector('label[for="ativoser"]').style.display = 'inline-block'; 
    
    const inputAtivo = document.querySelector(`input[name="ativoser"][value="true"]`);
    if (inputAtivo && produto.ativop) {
      inputAtivo.checked = (produto.ativop.toUpperCase() === 'SIM');
    }           
    
  })
  .catch(err => {
    alert('Erro ao carregar produto: ' + err.message);
  });
}