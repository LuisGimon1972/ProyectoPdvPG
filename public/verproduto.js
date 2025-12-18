function VisualizarProduto(controle) {  
    limparNome();
      document.getElementById('formPainel').style.display = 'block';           
      document.getElementById('formListaItens').style.display = 'none';
      const msgi = window.document.getElementById('titulop');
      msgi.innerHTML = `Visualização de dados de produtos`;       
  fetch(`/produtos/${controle}`)
    .then(res => {
      if (!res.ok) throw new Error('Produto não encontrado.');
      return res.json();
    })
    .then(produto => {    
      document.getElementById('controle').value = produto.controle || '';
      document.getElementById('produto').value = produto.produto || '';
      document.getElementById('codbarras').value = produto.codbarras || '';
      document.getElementById('selectFornecedor').value = produto.fornecedor || '';
      document.getElementById('grupo').value = produto.grupoestoque || '';
      document.getElementById('subgrupo').value = produto.subgrupoestoque || '';
      document.getElementById('marca').value = produto.marca || '';
      document.getElementById('precocusto').value = produto.precocusto || '';
      document.getElementById('perclucro').value = produto.perclucro || '';
      document.getElementById('precovenda').value = produto.precovenda || '';
      document.getElementById('precorevenda').value = produto.precorevenda || '';
      document.getElementById('precoatacado').value = produto.precoatacado || '';
      document.getElementById('quantidade').value = produto.quantidade || '';
      document.getElementById('quantidademin').value = produto.quantidademin || '';
      document.getElementById('quantidademax').value = produto.quantidademax || '';      
      deshabilitaitens(true) 
      const formProduto = document.getElementById('formProduto');
      const formPresenta = document.getElementById('formPresenta');
      const formLista = document.getElementById('formLista');     
      if (formPresenta) formPresenta.style.display = 'none';
      if (formLista) formLista.style.display = 'none';
      formProduto.style.display = 'block'; 
      document.getElementById('btnSalvarProduto').style.display = 'none';
      document.getElementById('btnAlterarProduto').style.display = 'none';
      const btnProduto = document.getElementById('btnAlterarProduto');
      btnCliente.style.display = 'block';
      document.getElementById('btnSalvarProduto').style.display = 'none';          
    })
    .catch(err => {
      alert('Erro ao carregar produto: ' + err.message);
    });
  }

  function deshabilitaitens(valor) 
  { 
    document.getElementById('produto').disabled = valor;
    document.getElementById('codbarras').disabled = valor;
    document.getElementById('selectFornecedor').disabled = valor;
    document.getElementById('grupo').disabled = valor;
    document.getElementById('subgrupo').disabled = valor;
    document.getElementById('marca').disabled = valor;
    document.getElementById('precocusto').disabled = valor;
    document.getElementById('perclucro').disabled = valor;
    document.getElementById('precovenda').disabled = valor;
    document.getElementById('precorevenda').disabled = valor;
    document.getElementById('precoatacado').disabled = valor;
    document.getElementById('quantidade').disabled = valor;          
    document.getElementById('quantidademin').disabled = valor;                  
    document.getElementById('quantidademax').disabled = valor;                  
    document.getElementById('ativop').disabled = valor; 
     document.querySelectorAll('input[name="fracionado"]').forEach(radio => {
    radio.disabled = valor;
    });  
    document.querySelectorAll('input[name="ativop"]').forEach(radio => {
    radio.disabled = valor;
    });             
  }

  function deshabilitaservicos(valor) 
  { 
    document.getElementById('servicio').disabled = valor;
    document.getElementById('precoservico').disabled = valor;
    document.getElementById('duracao').disabled = valor;
    document.getElementById('controleser').disabled = valor;    
    document.querySelectorAll('input[name="ativoser"]').forEach(radio => {
    radio.disabled = valor;
    });             
  }