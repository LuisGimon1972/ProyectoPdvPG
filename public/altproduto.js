function EditarProduto(controle) {  
  limparNome();
  let check = false; 
  const inputFracionado = document.querySelector(`input[name="fracionado"][value="true"]`);
  if (inputFracionado && inputFracionado.checked) {
  check = true;
  }
  const msgi = window.document.getElementById('titulop');
  msgi.innerHTML = `Alteração de dados de produtos`;     
  document.getElementById('formListaItens').style.display = 'none';    
fetch(`/produtos/${controle}`)
  .then(res => {
    if (!res.ok) throw new Error('Produto não encontrado.');
    return res.json();
  })
  .then(produto => {    
    document.getElementById('controle').value = produto.controle || '';
    document.getElementById('produto').value = produto.produto || '';
    document.getElementById('codbarras').value = produto.codbarras;
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
    deshabilitaitens(false) 
    const codbarrasaux = produto.codbarras;    
    const formProduto = document.getElementById('formProduto');
    const formPresenta = document.getElementById('formPresenta');
    const formLista = document.getElementById('formLista');     
    if (formPresenta) formPresenta.style.display = 'none';
    if (formLista) formLista.style.display = 'none';
    formProduto.style.display = 'block'; 
    document.getElementById('formPainel').style.display = 'block';     
    document.getElementById('btnSalvarProduto').style.display = 'none';
    document.getElementById('btnAlterarProduto').style.display = 'block';
    document.getElementById('ativop').style.display = 'inline-block';
    document.querySelector('label[for="ativop"]').style.display = 'inline-block'; 
    
    const inputAtivo = document.querySelector(`input[name="ativop"][value="true"]`);
    if (inputAtivo && produto.ativop) {
      inputAtivo.checked = (produto.ativop.toUpperCase() === 'SIM');
    } 

    const inputfracionado = document.querySelector(`input[name="fracionado"][value="true"]`);
    if (inputfracionado && produto.fracionado) {
      inputfracionado.checked = (produto.fracionado.toUpperCase() === 'SIM');
    } 
    
   // const fracionadoEl = document.getElementById('fracionado');
   // const fracionado = fracionadoEl.checked ? 'SIM' : 'NÃO';       
    const btnProduto = document.getElementById('btnAlterarProduto');
    btnCliente.style.display = 'block';
    document.getElementById('btnSalvarProduto').style.display = 'none';    
    const newBtnProduto = btnProduto.cloneNode(true);
    btnProduto.parentNode.replaceChild(newBtnProduto, btnProduto);
    newBtnProduto.addEventListener('click', () => {          
    AlterarProduto(controle, codbarrasaux);
    formProduto.style.display = 'block';   
    document.getElementById('formPainel').style.display = 'block';     
    document.getElementById('formPainel').style.display = 'block';      
    }, { once: true });
  })
  .catch(err => {
    alert('Erro ao carregar produto: ' + err.message);
  });
}

function VerProduto(controle) {    
  const msgi = window.document.getElementById('titulop');
  msgi.innerHTML = `Alteração de dados de produtos`;     
  document.getElementById('formListaItens').style.display = 'none';    
fetch(`/produtos/${controle}`)
  .then(res => {
    if (!res.ok) throw new Error('Produto não encontrado.');
    return res.json();
  })
  .then(produto => {     
    const codbarrasaux = produto.codbarras;    
    const formProduto = document.getElementById('formProduto');
    const formPresenta = document.getElementById('formPresenta');
    const formLista = document.getElementById('formLista');     
    if (formPresenta) formPresenta.style.display = 'none';
    if (formLista) formLista.style.display = 'none';
    formProduto.style.display = 'block'; 
    document.getElementById('btnSalvarProduto').style.display = 'none';
    document.getElementById('btnAlterarProduto').style.display = 'block';
    document.getElementById('ativop').style.display = 'inline-block';
    document.querySelector('label[for="ativop"]').style.display = 'inline-block'; 
    const inputAtivo = document.querySelector(`input[name="ativop"][value="true"]`);
    if (inputAtivo && produto.ativop) {
      inputAtivo.checked = (produto.ativop.toUpperCase() === 'SIM');
    }  
    const inputfracionado = document.querySelector(`input[name="fracionado"][value="true"]`);
    if (inputfracionado && produto.fracionado) {
      inputfracionado.checked = (produto.fracionado.toUpperCase() === 'SIM');
    } 
    const btnProduto = document.getElementById('btnAlterarProduto');
    btnCliente.style.display = 'block';
    document.getElementById('btnSalvarProduto').style.display = 'none';    
    const newBtnProduto = btnProduto.cloneNode(true);
    btnProduto.parentNode.replaceChild(newBtnProduto, btnProduto);
    newBtnProduto.addEventListener('click', () => {          
    AlterarProduto(controle, codbarrasaux);
    formProduto.style.display = 'block';    
    }, { once: true });
  })
  .catch(err => {
    alert('Erro ao carregar produto: ' + err.message);
  });
}

function AlterarProduto(controle, codbarrasaux) {
  const produto = document.getElementById('produto').value.trim().toUpperCase();
  const codbarras = document.getElementById('codbarras').value;
  const fornecedor = document.getElementById('selectFornecedor').value.trim().toUpperCase();
  const grupoestoque = document.getElementById('grupo').value.trim().toUpperCase();
  const subgrupoestoque = document.getElementById('subgrupo').value.trim().toUpperCase();
  const marca = document.getElementById('marca').value.trim().toUpperCase();
  const precocusto = document.getElementById('precocusto').value;
  const perclucro = document.getElementById('perclucro').value;
  const precovenda = document.getElementById('precovenda').value;
  const precorevenda = document.getElementById('precorevenda').value;
  const precoatacado = document.getElementById('precoatacado').value;
  const quantidade = document.getElementById('quantidade').value;
  const quantidademin = document.getElementById('quantidademin').value;
  const quantidademax = document.getElementById('quantidademax').value;   
  const ativoEl = document.getElementById('ativop');
  const ativop = ativoEl.checked ? 'SIM' : 'NÃO';   
  const fracionadoEl = document.getElementById('fracionado');
  const fracionado = fracionadoEl.checked ? 'SIM' : 'NÃO';           
  const aplicacao = 'PRODUTOS';
  const duracao = 0;
  
  if (!produto ||!codbarras || !quantidade || !precocusto || !perclucro || !precovenda) {
    resul = "Preencha os campos obrigatórios: * Produto, Cod. de Barras, Preço de Custo, % de Lucro e Preço de Venda!";            
    showToast(resul, 2500);                                                                     
    if(!produto){document.getElementById("produto").focus(); VerProduto(controle); return }        
    if(!codbarras){document.getElementById("codbarras").f7ocus(); VerProduto(controle); return }        
    if(!quantidade){document.getElementById("quantidade").focus(); VerProduto(controle); return }        
    if(!precocusto){document.getElementById("precocusto").focus(); VerProduto(controle); return }              
    if(!perclucro){document.getElementById("perclucro").focus(); VerProduto(controle); return }              
    if(!precovenda){document.getElementById("precovenda").focus(); VerProduto(controle); return }                    
  }     
  
  if (isNaN(quantidade) || quantidade <= 0) {
  showToast("⚠️ A quantidade não pode ser zerada!", 2500);
  document.getElementById('quantidade').value = ''
  document.getElementById('quantidade').focus();
  VerProduto(controle)
  return;
}

if (isNaN(precocusto) || precocusto <= 0) {
  showToast("⚠️ O preço de custo não pode ser zerado!", 2500);
  document.getElementById('precocusto').value = ''
  document.getElementById('precocusto').focus();
  VerProduto(controle)
  return;
}

if (isNaN(perclucro) || perclucro <= 0) {
  showToast("⚠️ A percentagem de lucro não pode ser zerado!", 2500);
  document.getElementById('perclucro').value = ''
  document.getElementById('perclucro').focus();
  VerProduto(controle)
  return;
}

if (isNaN(precovenda) || precovenda <= 0) {
  showToast("⚠️ O preço de venda não pode ser zerado!", 2500);
  document.getElementById('precovenda').value = ''
  document.getElementById('precovenda').focus();
  VerProduto(controle)
  return;
}

  const codbarrasAuxNormalizado = codbarrasaux;  
  fetch('/produtos')
  .then(res => res.json())
  .then(produtos => {        
    const cbExistente = produtos.some(produto => produto.codbarras === parseInt(codbarras));
    if (cbExistente && codbarrasAuxNormalizado != codbarras) {
      const mensagem = "⚠️ Este Código de barras já está cadastrado!";
      showToast(mensagem, 2500);            
      document.getElementById("codbarras").focus()
      VerProduto(controle);      
    }
    else
    {
      salvaproduto();
    }
     })
  .catch(err => {
    console.error("Erro ao buscar produtos:", err);
    showToast("Erro ao validar código de barras!", 2500);
  });    

function salvaproduto()
{  
const btnAlterar = document.getElementById('btnAlterarProduto');
if (btnAlterar) btnAlterar.disabled = true;

fetch(`/produtos/${controle}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    produto,
    codbarras,
    fornecedor,
    grupo,
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
    resul = "📝 Dados do produto atualizados com sucesso!";
    showToast(resul, 2500);                                                                     
    limparNome();
    document.getElementById('formPresenta').style.display = 'none'; 
    document.getElementById('formListaItens').style.display = 'block';
    document.getElementById('btnListarp').click();        
    
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
}
