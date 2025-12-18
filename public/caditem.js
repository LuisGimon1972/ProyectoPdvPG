function cadastroprodutos() {    
  limparNome();   
  carregarFornecedores()
  document.getElementById('formPresenta').style.display = 'none';      
  document.getElementById('formProduto').style.display = 'block'; 
  //document.getElementById('formPainel').style.display = 'block';    
  document.getElementById('formPainel').style.display = 'none';       
  document.getElementById("produto").focus();
  document.getElementById('btnSalvarProduto').style.display = 'block';
  document.getElementById('btnAlterarProduto').style.display = 'none';
  document.getElementById('codbarras').disabled = false;
  document.getElementById('ativop').style.display = 'none';
  document.querySelector('label[for="ativop"]').style.display = 'none';
  const msgi = window.document.getElementById('titulop');
  msgi.innerHTML = `Cadastro de produtos`;     
  deshabilitaitens(false) 
  const fracionadol = document.getElementById('fracionado');
  fracionadol.checked = false; 
  fetch('/produtos/max')
  .then(res => res.json())
  .then(data => {    
    let maxControle = data.maxControle;    
    let proximoControle = (maxControle !== null) ? maxControle + 1 : 1;    
    document.getElementById('controle').value = proximoControle;
  })
  .catch(err => {
    console.error('Erro ao buscar controle máximo:', err);
    alert('Erro ao buscar controle máximo');
  }); 
}

  function SalvarItem() {
    const produto = document.getElementById('produto').value.trim().toUpperCase();
    const codbarras = document.getElementById('codbarras').value.trim().toUpperCase();
    const fornecedor = document.getElementById('selectFornecedor').value.trim().toUpperCase();
    const grupoestoque = document.getElementById('grupo').value.trim().toUpperCase();
    const subgrupoestoque = document.getElementById('subgrupo').value.trim().toUpperCase();
    const marca = document.getElementById('marca').value.trim().toUpperCase();
    const precocusto = parseFloat(document.getElementById('precocusto').value);
    const perclucro = parseFloat(document.getElementById('perclucro').value);
    const precovenda = parseFloat(document.getElementById('precovenda').value);
    const precorevenda = parseFloat(document.getElementById('precorevenda').value);
    const precoatacado = parseFloat(document.getElementById('precoatacado').value);
    const quantidade = parseFloat(document.getElementById('quantidade').value);
    const quantidademin = parseFloat(document.getElementById('quantidademin').value);
    const quantidademax = parseFloat(document.getElementById('quantidademax').value);
    const ativop = "SIM";
    const aplicacao = 'PRODUTOS';
    const duracao = 0;
    const fracionadoEl = document.getElementById('fracionado');
    const fracionado = fracionadoEl.checked ? 'SIM' : 'NÃO';       
    const datahoracadastro = new Date().toISOString();     
    if (!produto ||!codbarras || !quantidade || !precocusto || !perclucro || !precovenda  ) {
      resul = "Preencha os campos obrigatórios: * Produto, Barras, Quantidade, Custo, % de Lucro e Preço de Venda";            
      showToast(resul, 2500);                                                                             
      if(!produto){document.getElementById("produto").focus(); return }        
      if(!codbarras){document.getElementById("codbarras").focus(); return }        
      if(!quantidade){document.getElementById("quantidade").focus(); return }        
      if(!precocusto){document.getElementById("precocusto").focus(); return }              
      if(!perclucro){document.getElementById("perclucro").focus(); return }              
      if(!precovenda){document.getElementById("precovenda").focus(); return }                    
    }       
    
if (isNaN(quantidade) || quantidade <= 0) {
  showToast("⚠️ A quantidade não pode ser zerada!", 2500);
  document.getElementById('quantidade').value = ''
  document.getElementById('quantidade').focus();  
  return;
}

if (isNaN(precocusto) || precocusto <= 0) {
  showToast("⚠️ O preço de custo não pode ser zerado!", 2500);
  document.getElementById('precocusto').value = ''
  document.getElementById('precocusto').focus();  
  return;
}

if (isNaN(perclucro) || perclucro <= 0) {
  showToast("⚠️ A percentagem de lucro não pode ser zerado!", 2500);
  document.getElementById('perclucro').value = ''
  document.getElementById('perclucro').focus();  
  return;
}

if (isNaN(precovenda) || precovenda <= 0) {
  showToast("⚠️ O preço de venda não pode ser zerado!", 2500);
  document.getElementById('precovenda').value = ''
  document.getElementById('precovenda').focus();  
  return;
}

  fetch('/produtos')
  .then(res => res.json())
  .then(produtos => {        
    const cbExistente = produtos.some(produto => produto.codbarras === parseInt(codbarras));
    if (cbExistente) {
      const mensagem = "⚠️ Este Código de barras já está cadastrado!";
      showToast(mensagem, 2500);
      const inputCb = document.getElementById("codbarras");
      if (inputCb) inputCb.focus();
      if (btnAdicionar) btnAdicionar.disabled = false;
      return;
    }

  fetch('/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      produto,
      codbarras,
      fornecedor,
      grupoestoque,
      subgrupoestoque,
      marca,
      precocusto,
      perclucro,
      precovenda,
      precorevenda,
      precoatacado,
      quantidade,
      quantidademin,
      quantidademax,
      datahoracadastro,
      ativop,
      fracionado,
      aplicacao,
      duracao
    })
  })
  .then(res => {
    if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
    return res.json();
  })
  .then(() => {
    resul = "💼Cadastro do item concluído com sucesso!";
    showToast(resul, 2500);                                                                     
    limparNome();
  })
  .catch(err => alert('Erro: ' + err.message))
  .finally(() => {
    if (btnAdicionar) btnAdicionar.disabled = false;
  });

})
.catch(err => {
  alert('Erro ao verificar Código de barras existente: ' + err.message);
  if (btnAdicionar) btnAdicionar.disabled = false;
});

} 

  function calcular() {    
    const precocusto = parseFloat(document.getElementById('precocusto').value);
    const perclucro = parseFloat(document.getElementById('perclucro').value); 
    
    if (isNaN(precocusto) || isNaN(perclucro)) {     
      document.getElementById("precovenda").focus();
      return;
    }          
    const precovenda = (precocusto + (precocusto * (perclucro / 100))).toFixed(2);
    document.getElementById('precovenda').value = precovenda;
    document.getElementById("precovenda").focus();
  }

  function calcularpc() {    
    const precocusto = parseFloat(document.getElementById('precocusto').value);
    const precovenda = parseFloat(document.getElementById('precovenda').value); 
    
    if (isNaN(precocusto) || isNaN(precovenda)) {
      resultado.textContent = "Por favor, preencha corretamente o preço de venda!";
      resultado.style.color = "red";
      resultado.style.display = "block";
      esperar(); 
      return;
    }      
    const perclucro = ((precovenda - precocusto) / precocusto) * 100; 
    document.getElementById('perclucro').value = perclucro.toFixed(2);
    document.getElementById("precorevenda").focus()
  }
 

  document.addEventListener('DOMContentLoaded', function () {
  const campos = [
    ["produto", "codbarras"],
    ["codbarras", "selectFornecedor"],
    ["selectFornecedor", "marca"],
    ["marca", "grupo"],
    ["grupo", "subgrupo"],
    ["subgrupo", "quantidade"],
    ["quantidade", "quantidademin"],
    ["quantidademin", "quantidademax"],
    ["quantidademax", "precocusto"],
    ["precocusto", "perclucro"],
    ["precorevenda", "precoatacado"],
    ["precoatacado", "btnSalvarProduto"],
    ["dinheiro", "cartaoDebito"],
    ["cartaoDebito", "btnFinalizar"]
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

  const perclucro = document.getElementById("perclucro");
  if (perclucro) {
    perclucro.addEventListener("keydown", function (event) {
      if (event.key === "Enter") calcular();
    });
  }

  const precovenda = document.getElementById("precovenda");
  if (precovenda) {
    precovenda.addEventListener("keydown", function (event) {
      if (event.key === "Enter") calcularpc();
    });
  }
});
