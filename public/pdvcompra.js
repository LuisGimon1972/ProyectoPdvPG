let dinheiro=0, troco = 0, cartaoDebito=0, cartaoCredito=0, descontoc, acrescimoc, subtotalc, dinheiroc, cartaoDebitoc, cartaoCreditoc
let desconto = 0
let acrescimo = 0
function compra()
{    
    limparNome();      
    limparcalculos();
    carregarFuncionarios()
    carregarFornecedoris()
    desabilitarControles(true)   
    RestauraLabel()
    tornarDescontoEAcrescimoSomenteLeitura(false)        
    document.getElementById('btnFinalizarOs').style.display = 'none';    
    document.getElementById('btnFinalizarOsOs').style.display = 'none';
    document.getElementById('btnCancelaros').style.display = 'none';    
    swti = 0
    window.scrollTo(0, 0);
    document.getElementById('formPresenta').style.display = 'none';    
    document.getElementById('formPdv').style.display = 'block';   
    document.getElementById('formPainel').style.display = 'block';       
    document.getElementById('formCalculos').style.display = 'block';      
    document.getElementById("entra").focus(); 
    document.getElementById('troco').disabled = true;
    document.getElementById('falta').disabled = true;
    document.getElementById('titulomod').innerText = 'Nota de Compra';
    document.getElementById('selectCliente').style.display = 'none';
    document.getElementById('clien').style.display = 'none';
    document.getElementById('selectFornece').style.display = 'block';
    document.getElementById('forno').style.display = 'block';    
    document.getElementById('cartaoCredito').style.display = 'block';
    document.getElementById('btnCancelar').style.display = 'none';  
    document.getElementById('btnCancelarv').style.display = 'inline-block';         
    document.getElementById('btnFinalizarFi').style.display = 'none';        
    document.getElementById('btnFinalizar').style.display = 'inline-block';            
    document.getElementById('btnFinalizarFc').style.display = 'none';             
    document.querySelector('label[for="cartaoCredito"]').style.display = 'block';    
    document.getElementById('parceladoCredito').parentElement.style.display = 'block';
    desconto = document.getElementById('desconto');
    acrescimo = document.getElementById('acrescimo');
    const checkDesconto = document.getElementById('descontoPorcentagem');
    const checkAcrescimo = document.getElementById('acrescimoPorcentagem');
    checkDesconto.addEventListener('change', () => {
     desconto.placeholder = checkDesconto.checked ? "0%" : "R$ 0,00";
    });
    checkAcrescimo.addEventListener('change', () => {
    acrescimo.placeholder = checkAcrescimo.checked ? "0%" : "R$ 0,00";
    }); 

    carregarTiposPdvc(1);    
    let tipoBusca = ''
    async function carregarTiposPdvc(controle) {
    try {
      const emitente = await fetch(`/emitente/${controle}`).then(r => r.json());
      const tipo = emitente.tipodebusca.toUpperCase();
      const valorRadio = tipo === "CONTROLE" ? "controle" : "codbarras";
      document.querySelector(`input[name="tipoBusca"][value="${valorRadio}"]`).checked = true;    
      tipoBusca = document.querySelector('input[name="tipoBusca"]:checked').value;
      console.log("Tipo de busca selecionado:", tipoBusca);
    } catch (err) {
    console.error("Erro ao carregar emitente:", err);
    }
    }
    document.querySelectorAll('input[name="tipoBusca"]').forEach(radio => {
    radio.disabled = true;
    });
    
    let compras = [];
    document.getElementById('form-venda').addEventListener('submit', handleFormSubmitc);
    
    async function handleFormSubmitc(e) {
    e.preventDefault();
    const entrada = e.target.entrada.value.trim();        
    let quantidade, controle;
    tipoBusca = document.querySelector('input[name="tipoBusca"]:checked').value;       
    if (entrada.includes('*')) {    
    const [quantidadeStr, controleStr] = entrada.split('*');       
    quantidade = parseFloat(quantidadeStr.trim().replace(',', '.'));         
    // Controle só inteiro
    if (!/^\d+$/.test(controleStr.trim())) {     
        if (tipoBusca === 'controle') 
        {
        resultado = "⚠️Entrada inválida. Exemplo: 2*1234";                    
        showToast(resultado, 2500);       
        document.getElementById("entra").value = "";
        }          
        else
        {resultado = "⚠️Entrada inválida. Exemplo: 2*7898528977415";                    
        showToast(resultado, 2500);      
        document.getElementById("entra").value = "";
        }
        throw new Error("Controle deve ser um número inteiro válido");
        
    }
    controle = parseInt(controleStr.trim(), 10);    
    await handleEntradac(controle, tipoBusca, quantidade);

} else {    
    quantidade = 1;
    if (!/^\d+$/.test(entrada.trim())) {
        if (tipoBusca === 'controle') 
        {
        resultado = "⚠️Entrada inválida. Exemplo: 1234";            
        showToast(resultado, 2500);       
        document.getElementById("entra").value = "";
        }          
        else
        {resultado = "⚠️Entrada inválida. Exemplo: 7898528977415";            
        showToast(resultado, 2500);      
        document.getElementById("entra").value = "";
        }
        throw new Error("Controle deve ser um número inteiro válido");
    }
    controle = parseInt(entrada.trim(), 10);    
    await handleEntradac(controle, tipoBusca, quantidade);
}    
  
    if (isNaN(quantidade) || isNaN(controle) || quantidade <= 0) {
    resultado = "⚠️Entrada inválida. Exemplo: 2*1234 ou 1234";            
    showToast(resultado, 2500);               
    document.getElementById("entra").value = "";
    return;
    }       
    

 async function buscarProdutoc(tipo, valor) {
  if (tipo === 'controle') { return await buscarProdutoPorControlec(valor); }
  if (tipo === 'codbarras'){ return await buscarProdutoPorCodBarrasc(valor);}
  throw new Error("Tipo de busca inválido: " + tipo);
}

async function handleEntradac(valor, tipoBusca, quantidade = 1) {  
  try {
    // busca o produto
    const produto = await buscarProdutoc(tipoBusca, valor);
    if (!produto) {
      showToast("⚠️Produto inexistente ou desativado!", 2500);
      limparEntrada();
      return;
    }

    // verifica quantidade fracionada
    if (!Number.isInteger(quantidade) && produto.fracionado !== 'SIM') {
      showToast(`🚫 Produto "${produto.produto}" não permite quantidade fracionada!`, 2500);
      limparEntrada();
      return;
    }
    

    // tenta atualizar o estoque
    const estoqueAtualizado = await aumentarEstoque(produto.controle, quantidade);
    if (!estoqueAtualizado) {
      showToast("❌ Erro ao atualizar estoque!", 2500);
      limparEntrada();
      return;
    }  
    
    adicionarItemCompra(produto, quantidade);
    atualizarTabelac();  

    limparEntrada();
  } catch (err) {
    console.error("Erro em handleEntradac:", err);
    showToast("❌ Ocorreu um erro inesperado!", 2500);
    limparEntrada();
  }
}

// função utilitária para limpar o campo de entrada
function limparEntrada() {
  const entradaEl = document.getElementById("entra");
  if (entradaEl) {
    entradaEl.value = "";
    entradaEl.focus();
  }
}


async function buscarProdutoPorControlec(controle) {
  try {
    const res = await fetch(`/produtos/controle/${controle}`);    
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    return null;
  }
}

async function buscarProdutoPorCodBarrasc(codbarras) {
  try {    
    const res = await fetch(`/produtos/codbarras/${codbarras}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    return null;
  }  
  }
}

  async function aumentarEstoque(controle, quantidade) {    
  try {
    const res = await fetch(`/produtos/${controle}/aumentar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade })
    })
    return res.ok
  } catch (err) {
    console.error('Erro ao aumentar estoque:', err)
    return false
  }
}

    function adicionarItemCompra(produto, quantidade) {
    const total = produto.precocusto * quantidade;
    compras.push({    
    controle: produto.controle,
    produto: produto.produto,
    precocusto: produto.precocusto,
    quantidade,
    total
    });
    }
    let totalGeralc = 0;
 function atualizarTabelac() {
  const tbody = document.getElementById('tabela-venda');
  tbody.innerHTML = '';
  totalGeralc = 0;  
  let subtotal = 0;  
  compras.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: left; padding-left: 2px; padding-center: 80%;">${item.produto}</td>      
      <td style="text-align: right; padding-left: 16px; padding-right: 100px;">
        R$ ${parseFloat(item.precocusto).toFixed(2)}
      </td>
      <td>${parseFloat(item.quantidade).toFixed(2)}</td>
      <td style="text-align: right; padding-left: 16px; padding-right: 100px;">
        R$ ${parseFloat(item.total).toFixed(2)}
      </td>
      <td style="text-align: center;">
        <button class="btn-apagar" style="background-color: blue; color: white;">
          🗑️
        </button>
      </td>
    `;
    
    const botao = tr.querySelector('.btn-apagar');
    botao.addEventListener('click', async () => {
      await reverteItemEstoque(item); 
      compras.splice(index, 1);       
      limparcalculos();
      if(compras.length==0)
      {
      zerado = 1
      document.getElementById('subtotal').innerText = '0,00'
      desabilitarControles(true);
      controlarBotoesMenu(true);
      }
      atualizarTabelac();             
    });

    tbody.appendChild(tr);    
    subtotal += item.total;
  });

  const descInput = parseFloat(document.getElementById('desconto').value) || 0;
  const acresInput = parseFloat(document.getElementById('acrescimo').value) || 0;

  const descPorcento = document.getElementById('descontoPorcentagem').checked;
  const acresPorcento = document.getElementById('acrescimoPorcentagem').checked;

  const desconto = descPorcento ? (subtotal * descInput / 100) : descInput;
  const acrescimo = acresPorcento ? (subtotal * acresInput / 100) : acresInput;
  subtotalc = subtotal
  descontoc = desconto
  acrescimoc = acrescimo 

  totalGeralc = subtotal - desconto + acrescimo;
  if ((descPorcento && descInput > 99) || totalGeralc <= 0) {
  if(zerado == 0)
  {
   showToast('Não pode se aplicar esse desconto!', 2500);
  }  
  document.getElementById('desconto').value = '';
  document.getElementById('acrescimo').value = '';
  atualizarTabelac()
  zerado = 0
  return;
}
  document.getElementById('subtotal').innerText = subtotal.toFixed(2);
  document.getElementById('dcto').innerText = desconto.toFixed(2);
  document.getElementById('acres').innerText = acrescimo.toFixed(2);
  document.getElementById('total-geral').innerText = totalGeralc.toFixed(2);
  document.getElementById('falta').value = totalGeralc.toFixed(2);
  desabilitarControles(totalGeralc <= 0);
  controlarBotoesMenu(!(totalGeralc > 0 || compras.length > 0));
}

document.getElementById('desconto').addEventListener('input', () => {
    atualizarTabelac();
    if (dinheiroc>0 || cartaoCreditoc >0 || cartaoCreditoc>0 && swi==0)
    {
      calcularCompra()
    }
});
document.getElementById('descontoPorcentagem').addEventListener('change', () => {  
  atualizarTabelac();
  if (dinheiroc>0 || cartaoCreditoc >0 || cartaoCreditoc>0 && swi==0)
    {
      calcularCompra()
    }
});
document.getElementById('acrescimo').addEventListener('input', () => {  
  atualizarTabelac();
  if (dinheiroc>0 || cartaoCreditoc >0 || cartaoCreditoc>0 && swi==0)
    {
      calcularCompra()
    }
});
document.getElementById('acrescimoPorcentagem').addEventListener('change', () => {  
  atualizarTabelac();
  if (dinheiroc>0 || cartaoCreditoc >0 || cartaoCreditoc>0 && swi==0)
    {
      calcularCompra()
    }
});

    const btnFinaliza = document.getElementById('btnFinalizar');
    btnFinaliza.addEventListener('click', () => {
    finalizarCompra();    
    });

const checkboxParcelado = document.getElementById('parceladoCredito');
const inputCartaoCredito = document.getElementById('cartaoCredito');
const detalhesParcelamento = document.getElementById('detalhesParcelamento');
const inputQtdParcelas = document.getElementById('qtdParcelas');
const inputVencimento = document.getElementById('vencimentoDia');

function atualizarVisibilidadeParcelamento() {
  const parcelado = checkboxParcelado.checked;
  const valorCartao = parseFloat(inputCartaoCredito.value) || 0;
  const mostrar = parcelado && valorCartao > 0;
  detalhesParcelamento.style.display = mostrar ? 'block' : 'none';  
  if (!mostrar) {
    inputQtdParcelas.value = '1';
    inputVencimento.value = '';
  }
}

checkboxParcelado.addEventListener('change', atualizarVisibilidadeParcelamento);
inputCartaoCredito.addEventListener('input', atualizarVisibilidadeParcelamento);

function arredondar(valor) {
  return Number(valor.toFixed(2));
}

function finalizarCompra() {
  dinheiro = arredondar(parseFloat(document.getElementById('dinheiro').value) || 0);
  cartaoDebito = arredondar(parseFloat(document.getElementById('cartaoDebito').value) || 0);
  cartaoCredito = arredondar(parseFloat(document.getElementById('cartaoCredito').value) || 0);

  let total = arredondar(totalGeralc);
  let totalPago = arredondar(dinheiro + cartaoDebito + cartaoCredito);

  const fornecedor_id = controleFornecedorSel;
  if (!fornecedor_id) {
    controleFornecedorSel = 1
    //showToast('Deve selecionar um Fornecedor!', 2500);
    //document.getElementById("selectFornece").focus();
    //return;
  }

  const ehParcelado = document.getElementById('parceladoCredito').checked;
  let parcelas = 1;
  let vencimento = null;
  let tipoCreditoTexto = 'Cartão Crédito (À Vista)';
  let listaParcelas = [];

  if (ehParcelado) {
    parcelas = parseInt(document.getElementById('qtdParcelas').value) || 1;
    vencimento = parseInt(document.getElementById('vencimentoDia').value) || null;

    if (!parcelas) {
      showToast('Informe a quantidade de parcelas válida.', 2500);
      return;
    }

    if (!vencimento || vencimento < 1 || vencimento > 31) {
      showToast('Informe um dia de vencimento válido (1 a 31).', 2500);
      return;
    }

    tipoCreditoTexto = `Cartão Crédito (Parcelado em ${parcelas}x, venc. dia ${vencimento})`;

    const hoje = new Date();
    let ano = hoje.getFullYear();
    let mes = hoje.getMonth();

    for (let i = 1; i <= parcelas; i++) {
      mes++;
      if (mes > 11) {
        mes = 0;
        ano++;
      }

      let data = new Date(ano, mes, vencimento);
      while (data.getDate() !== vencimento) {
        data.setDate(data.getDate() - 1);
      }

      const dia = data.getDate().toString().padStart(2, '0');
      const mesF = (data.getMonth() + 1).toString().padStart(2, '0');
      const vencStr = `${dia}/${mesF}/${data.getFullYear()}`;

      listaParcelas.push(`${i}ª parcela - ${vencStr}`);
    }
  }

  // Validação de pagamento insuficiente
  if (totalPago < total) {
    const falta = total - totalPago;
    document.getElementById('falta').value = falta.toFixed(2);
    document.getElementById('troco').value = "0.00";
    showToast("O valor total não é suficiente. Verifique os pagamentos.", 2500);
    return;
  }

  // Validação de troco quando não há dinheiro
  if (totalPago > total && dinheiro === 0) {
    showToast("O valor total dos cartões excede o valor da compra. Verifique os pagamentos.", 2500);
    return;
  }

  // Troco ou valores exatos
  let troco = 0.00;
  if (totalPago > total) {
    troco = totalPago - total;
    document.getElementById('troco').value = troco.toFixed(2);
    document.getElementById('falta').value = "0.00";
  } else {
    document.getElementById('troco').value = "0.00";
    document.getElementById('falta').value = "0.00";
  }

  // Finalizar compra
  showToast("Nota de compra finalizada com sucesso", 5000);

  if (dinheiro > 0 || cartaoDebito > 0 || cartaoCredito > 0) {
    salvarLancamentosCaixaC();
  }

  if (ehParcelado && cartaoCredito > 0) {
    salvarParcelasPagar();
  }

  imprimirCompra({
    usuario: usuariologadoF,
    fornecedor: nomeFornecedorSel,
    total: total,
    tipoCredito: tipoCreditoTexto,
    parcelas: listaParcelas
  });

  limparCompra();
  setTimeout(() => location.reload(), 2000);
}


  const btnCancelac = document.getElementById('btnCancelarv');
  btnCancelac.addEventListener('click', () => {
  cancelarCompra();    
  });
  //Nocas git push -u origin main
  function calcularCompra() {
  let dinheiro = parseFloat(document.getElementById('dinheiro').value) || 0;
  let cartaoDebito = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  let cartaoCredito = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  let total = totalGeralc;

  dinheiro = arredondar(dinheiro);
  dinheiroc = dinheiro
  cartaoDebito = arredondar(cartaoDebito);
  cartaoDebitoc = cartaoDebito
  cartaoCredito = arredondar(cartaoCredito);
  cartaoCreditoc = cartaoCredito
  total = arredondar(total);

  let totalPago = dinheiro + cartaoDebito + cartaoCredito;
  totalPago = arredondar(totalPago);  
  let desabilitar = dinheiro >= totalGeralc && (cartaoDebito + cartaoCredito)==0 &&swti==0;  
    document.getElementById('cartaoDebito').disabled  = desabilitar;
    document.getElementById('cartaoCredito').disabled = desabilitar;

  if (totalPago < total) {
    const falta = total - totalPago;
    document.getElementById('falta').value = falta.toFixed(2);
    document.getElementById('troco').value = "0.00";
    showToast("O valor total não é suficiente. Verifique os pagamentos.", 2000);
    return;
  }

  if (totalPago > total  && dinheiroc ==0) {
    document.getElementById('troco').value = "0.00";
    document.getElementById('falta').value = "0.00";
    showToast("O valor total dos carões excede do valor da compra. Verifique os pagamentos.", 2500);
    return;
  }

  if (totalPago > total) {
    troco = totalPago - total;    
    document.getElementById('troco').value = troco.toFixed(2);
    document.getElementById('falta').value = "0.00";
    return;
  }  
  document.getElementById('troco').value = "0.00";
  document.getElementById('falta').value = "0.00";
}

function gerarParcelasNaTela(parcelas, diaVencimento, valorCredito) {
  const container = document.getElementById('parcelasGeradas');
  container.innerHTML = '';
  listaParcelasTexto = [];

  const hoje = new Date();
  const valorParcelaBruto = valorCredito / parcelas;
  const valorParcela = Math.floor(valorParcelaBruto * 100) / 100;
  const somaParcial = valorParcela * parcelas;
  const ultimaParcela = valorCredito - somaParcial + valorParcela;

  for (let i = 0; i < parcelas; i++) {   
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, diaVencimento);

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const valor = (i === parcelas - 1 ? ultimaParcela : valorParcela)
      .toFixed(2)
      .replace('.', ',');

    const numeroParcela = `${(i + 1).toString().padStart(2, ' ')}ª:`;
    listaParcelasTexto.push(`${numeroParcela} ${dia}/${mes}/${ano}   R$ ${valor}`);
  }

  container.innerHTML = `<strong>Parcelas:</strong><br>${listaParcelasTexto.join('<br>')}`;
} 

const qtdInput = document.getElementById('qtdParcelas');
const vencInput = document.getElementById('vencimentoDia');

function tentarGerarParcelas() {
  const ehParcelado = document.getElementById('parceladoCredito').checked;
  if (!ehParcelado) {
    document.getElementById('parcelasGeradas').innerHTML = '';
    return;
  }

  const parcelas = parseInt(document.getElementById('qtdParcelas').value);
  const vencimento = parseInt(document.getElementById('vencimentoDia').value);
  const valorCredito = parseFloat(document.getElementById('cartaoCredito').value) || 0;

  if (parcelas >= 1 && vencimento >= 1 && vencimento <= 31 && valorCredito > 0) {
    gerarParcelasNaTela(parcelas, vencimento, valorCredito);
  } else {
    document.getElementById('parcelasGeradas').innerHTML = '';
  }
}

qtdInput.addEventListener('input', tentarGerarParcelas);
vencInput.addEventListener('input', tentarGerarParcelas);


async function salvarParcelasPagar() {
  const funcionario = funcionarioSelecionado;
  const fornecedor_id = controleFornecedorSel;

  if (!fornecedor_id) {
    console.error('Fornecedor não selecionado.');
    return;
  }

  const descricao = 'Nota de Compra';
  const datacadastro = new Date().toISOString().slice(0, 10);

  const valororiginal = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  const totalparcelas = parseInt(document.getElementById('qtdParcelas').value) || 1;
  const vencimentoDia = parseInt(document.getElementById('vencimentoDia').value) || 1;

  const hoje = new Date();
  const valorParcelaBruto = valororiginal / totalparcelas;
  const valorParcela = Math.floor(valorParcelaBruto * 100) / 100;
  const somaParcial = valorParcela * totalparcelas;
  const ultimaParcelaValor = valororiginal - somaParcial + valorParcela;

  const promessas = [];

  for (let i = 0; i < totalparcelas; i++) {
    const numeroParcela = i + 1;
    const valor = (i === totalparcelas - 1) ? ultimaParcelaValor : valorParcela;
    const valorp = parseFloat(valor.toFixed(2));   
    let vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1);
    const ultimoDiaDoMes = new Date(vencimento.getFullYear(), vencimento.getMonth() + 1, 0).getDate();
    vencimento.setDate(Math.min(vencimentoDia, ultimoDiaDoMes));
    const datavencimento = vencimento.toISOString().slice(0, 10);
    const parcela = {
      fornecedor_id,
      funcionario,
      descricao,
      datavencimento,
      datapagamento: '',
      datacadastro,
      valororiginal: valorp,
      valor: valorp,
      valorpago: 0,
      numeroparcela: numeroParcela,
      totalparcelas,
      juros: 0,
      multa: 0,
      status: 'ABERTO'
    };

    const prom = fetch('/pagar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parcela)
    }).then(async res => {
      if (!res.ok) {
        const text = await res.text();
        console.error(`Erro ao salvar parcela ${numeroParcela}: ${text}`);
      }
    }).catch(err => {
      console.error(`Erro ao enviar parcela ${numeroParcela}:`, err);
    });

    promessas.push(prom);
  }

  await Promise.all(promessas);
}

async function salvarLancamentosCaixaC() {  
  const cod_funcionario = codfunciona;
  const funcionario = funcionarioSelecionado;
  const cod_fornecedor = controleFornecedorSel || null;
  let fornecedor = nomeFornecedorSel || 'FORNECEDOR PADRÃO';  
  fornecedor = fornecedor.toUpperCase();
  const descricao = 'Nota de Compra';
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0'); 
  const dia = String(agora.getDate()).padStart(2, '0');
  const datacadastro = `${ano}-${mes}-${dia}`;  
  const valorDinheiro = dinheiro - troco  
  const valorDebito = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  const ehParcelado = document.getElementById('parceladoCredito').checked;  
  const valorCredito = parseFloat(document.getElementById('cartaoCredito').value) || 0;

  if (valorDinheiro === 0 && valorDebito === 0 && valorCredito ===0) {
    alert('Informe um valor em dinheiro ou débito.');
    return;
  }

  const movimentos = [];

  if (valorDinheiro > 0) {
    movimentos.push({
      cod_cliente: null,
      cliente: '',
      cod_funcionario,
      funcionario,
      cod_fornecedor: cod_fornecedor,
      fornecedor: fornecedor,
      descricao: descricao + ' (Dinheiro)',
      datacadastro,
      especies: 'Dinheiro',
      valorentrada: 0,
      valorsaida: valorDinheiro
    });
  }

  if (valorDebito > 0) {
    movimentos.push({
      cod_cliente: null,
      cliente: '',
      cod_funcionario,
      funcionario,
      cod_fornecedor: cod_fornecedor,
      fornecedor: fornecedor,
      descricao: descricao + ' (Débito)',
      datacadastro,
      especies: 'Cartão de Débito',
      valorentrada: 0,
      valorsaida: valorDebito
    });
  }

  if (valorCredito > 0 && !ehParcelado ) {    
    movimentos.push({
      cod_cliente: null,
      cliente: '',
      cod_funcionario,
      funcionario,
      cod_fornecedor: cod_fornecedor,
      fornecedor: fornecedor,
      descricao: descricao + ' (Crédito)',
      datacadastro,
      especies: 'Crédito à Vista',
      valorentrada: 0,
      valorsaida: valorCredito
    });
  }

  for (const movimento of movimentos) {
    try {
      const res = await fetch('/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movimento)
      });

      if (!res.ok) {
        console.error('Erro ao salvar movimento:', await res.text());
      } else {
        console.log('Movimentação salva com sucesso:', movimento.especies);
      }
    } catch (err) {
      console.error('Erro de rede ao enviar movimentação:', err);
    }
  }
}

  async function cancelarCompra() {
  await reverterEstoque(); 
  limparCompra();
  const mostra = 'Nota de compra cancelada com sucesso'
  showToast(mostra, 1000);    
  limparNome();
  location.reload();
  }

  async function reverterEstoque() {
  for (const item of compras) { 
    try {
      await fetch(`/produtos/${item.controle}/diminuir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: item.quantidade })
      });
    } catch (err) {
      console.error(`Erro ao devolver estoque do produto ${item.produto}:`, err);
    }
  }
  }

  async function reverteItemEstoque(item) {
  try {
    await fetch(`/produtos/${item.controle}/diminuir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: item.quantidade })
    });
  } catch (err) {
    console.error(`Erro ao devolver estoque do produto ${item.produto}:`, err);
  }
}

  function imprimirCompra(compraf = {}) {

  const formatarMoeda = (valor) => parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const dataHoraAtual = new Date().toLocaleString('pt-BR');
  const totalCompra = compraf.total || totalGeralc || 0;
  const totalDin = dinheiro || 0;
  const totalTro = troco || 0;
  const totalDeb = cartaoDebito || 0;
  const totalCred = cartaoCredito || 0;
  const subt = subtotalc || 0;
  const dcto = descontoc || 0;
  const acres = acrescimoc || 0;
  const usuarioCompra = compraf.usuario || 'Usuário do Sistema';
  const forneCompra = compraf.fornecedor 

  const gerarItensHTML = () => {
    return compras.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
        <span>${item.produto} X ${item.quantidade}</span>
        <span>${formatarMoeda(item.total)}</span>
      </div>
    `).join('');
  };

  const gerarParcelasHTML = () => {
    if (!window.listaParcelasTexto || !Array.isArray(listaParcelasTexto) || listaParcelasTexto.length === 0) return '';
    return `
      <div style="margin-top: 6px; font-size: 10px; font-family: monospace;">
        <strong>Parcelas:</strong>
        ${listaParcelasTexto.map(parcela => `<div>${parcela}</div>`).join('')}
      </div>
    `;
  };

  
  const gerarCabecalho = () => `
    <div style="text-align: center; line-height: 1.2; font-family: monospace; font-size: 12px; margin-bottom: 4px;">
      <strong>${emitenteNome}</strong><br>
      CNPJ/CPF: ${emitenteDoc}<br>
      TEL/CEL: ${emitenteTelefone} <br>
      <strong>*** COMPROVANTE DE COMPRA ***</strong>
    </div>
  `;

  const gerarCorpoCupom = () => `
    ${gerarCabecalho()}
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    <div style="font-size: 10px; line-height: 1.4; font-family: monospace;">
      <p><strong>Data/Hora:</strong> ${dataHoraAtual}</p>
      <p><strong>Usuário:</strong> ${usuarioCompra}</p>
      <p><strong>Fornecedor:</strong> ${forneCompra}</p>
      <p><strong>Descrição</strong> ─ <strong>Quantidade</strong> ───────────────────────── <strong>Total</strong></p>
    </div>
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    ${gerarItensHTML()}
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    <div style="font-size: 12px; font-weight: bold;">
      <div style="display: flex; justify-content: space-between;">
        <span>DINHEIRO:</span><span>${formatarMoeda(totalDin)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>TROCO:</span><span>${formatarMoeda(totalTro)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>CARTÃO DE DÉBITO:</span><span>${formatarMoeda(totalDeb)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>CARTÃO DE CRÉDITO:</span><span>${formatarMoeda(totalCred)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>SUB TOTAL DA VENDA:</span><span>${formatarMoeda(subt)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>DESCONTO NA VENDA:</span><span>${formatarMoeda(dcto)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>ACRÉSCIMO NA VENDA:</span><span>${formatarMoeda(acres)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>TOTAL:</span><span>${formatarMoeda(totalCompra)}</span>
      </div>
    </div>
    ${gerarParcelasHTML()}
    <br>
    <p style="text-align: center; font-size: 10px;">Obrigado pela preferência!</p>
    <p style="text-align: center; font-size: 10px; margin-top: 10px;">______________________________<br>Assinatura</p>
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
  `;

  const htmlFinal = `
    <html>
      <head>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              width: 80mm;
              font-family: monospace;
            }
          }
          body {
            margin: 0;
            padding: 5px;
            font-family: monospace;
            width: 80mm;
          }
          div, p, span {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        ${gerarCorpoCupom()}
      </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlFinal);
  doc.close();

  iframe.onload = function () {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300);
  };
}

  function limparCompra() {
  compras = []; 
  totalGeralc = 0;  
  const tbody = document.getElementById('tabela-venda');
  tbody.innerHTML = '';      
  const resultado = document.getElementById('resultado');
  if (resultado) {
    resultado.textContent = '';
    resultado.style.display = 'none';
  }
  }

  const camposPagamento = ['dinheiro', 'cartaoDebito', 'cartaoCredito'];

  camposPagamento.forEach(id => {
  const campo = document.getElementById(id);
  if (campo && swti==0) {    
    campo.addEventListener('blur', () => {
      calcularCompra();
      console.log(`Campo ${id} perdeu o foco!`);
    });
    
    campo.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && swti==0) {
        calcularCompra();
        console.log(`Campo ${id} acionado com Enter!`);       
        const index = camposPagamento.indexOf(id);
        const proximoCampo = document.getElementById(camposPagamento[index + 1]);
        if (proximoCampo) {
          proximoCampo.focus();
        }
      }
    });
  }
}); 

  window.addEventListener('beforeunload', () => {
  if (compras.length > 0) {
    const dados = compras.map(item => ({
      controle: item.controle,
      quantidade: item.quantidade
    }));
    const blob = new Blob([JSON.stringify(dados)], {
      type: 'application/json'
    });
    navigator.sendBeacon('/produtos/diminuir-em-lote', blob);
  }
});

  async function apagarRegistro(index) {
  compras.splice(index, 1); 
  await reverterEstoque();
  atualizarTabelac();      
}
}

document.addEventListener('DOMContentLoaded', function () {
  const campos4 = [
    ["qtdParcelas", "vencimentoDia"]    
  ];

  campos4.forEach(([de, para]) => {
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
  const campos10 = [
    ["desconto", "acrescimo"],    
    ["acrescimo", "dinheiro"]    
  ];

  campos10.forEach(([de, para]) => {
    const elemDe = document.getElementById(de);
    const elemPara = document.getElementById(para);
    if (elemDe && elemPara) {
      elemDe.addEventListener("keydown", function (event) {
        if (event.key === "Enter") elemPara.focus();
      });
    }
  });  
});
