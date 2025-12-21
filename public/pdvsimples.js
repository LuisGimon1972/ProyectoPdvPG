let dinheirov=0, trocov=0, cartaoDebitov=0, cartaoCreditov=0, descontov, acrescimov, subtotalv
let limitec = null, deuda = null, disponible = null;
let tipoBusca = ''
let qtde = 0
let zerado = 0
function cadvendapdv()
{
    limparNome();  
    limparcalculos();
    carregarFuncionarios()
    carregarClientes()    
    desabilitarControles(true)
    RestauraLabel()
    tornarDescontoEAcrescimoSomenteLeitura(false)        
    document.getElementById('btnFinalizarOs').style.display = 'none';
    document.getElementById('btnFinalizarOsOs').style.display = 'none';
    document.getElementById('btnCancelaros').style.display = 'none';    
    swti = 0;
    document.getElementById('formPresenta').style.display = 'none';    
    document.getElementById('formPdv').style.display = 'block';   
    document.getElementById('formPainel').style.display = 'block';   
    document.getElementById('formCalculos').style.display = 'block';      
    document.getElementById("entra").focus(); 
    document.getElementById('troco').disabled = true;
    document.getElementById('falta').disabled = true;
    document.getElementById('titulomod').innerText = 'Ponto de Venda';
    document.getElementById('selectCliente').style.display = 'block';
    document.getElementById('clien').style.display = 'block';
    document.getElementById('selectFornece').style.display = 'none';
    document.getElementById('forno').style.display = 'none';
    document.getElementById('cartaoCredito').style.display = 'block';
    document.getElementById('btnCancelar').style.display = 'none';      
    document.getElementById('btnCancelarv').style.display = 'inline-block';      
    document.getElementById('btnFinalizarFi').style.display = 'none';    
    document.getElementById('btnFinalizar').style.display = 'inline-block';         
    document.getElementById('btnFinalizarFc').style.display = 'none';             
    document.querySelector('label[for="cartaoCredito"]').style.display = 'block';
    document.getElementById('parceladoCredito').parentElement.style.display = 'block';
    window.scrollTo(0, 0);
    descontov = document.getElementById('desconto');
    acrescimov = document.getElementById('acrescimo');
    const checkDesconto = document.getElementById('descontoPorcentagem');
    const checkAcrescimo = document.getElementById('acrescimoPorcentagem');
    checkDesconto.addEventListener('change', () => {
     desconto.placeholder = checkDesconto.checked ? "0%" : "R$ 0,00";
    });
    checkAcrescimo.addEventListener('change', () => {
    acrescimo.placeholder = checkAcrescimo.checked ? "0%" : "R$ 0,00";
    });
    carregarTiposPdv(1);    
    tipoBusca = ''
    async function carregarTiposPdv(controle) {
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
    
    let vendas = [];    
    document.getElementById('form-venda').addEventListener('submit', handleFormSubmit);
    async function handleFormSubmit(e) {
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
    await handleEntrada(controle, tipoBusca, quantidade);

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
    await handleEntrada(controle, tipoBusca, quantidade);
}

  
    if (isNaN(quantidade) || isNaN(controle) || quantidade <= 0) {
      resultado = "⚠️Entrada inválida. Exemplo: 2*1234 ou 1234";            
      showToast(resultado, 2500);       
      document.getElementById("entra").value = "";    
      return;
    }

async function buscarProduto(tipo, valor) {
  if (tipo === 'controle') { return await buscarProdutoPorControle(valor); }
  if (tipo === 'codbarras'){ return await buscarProdutoPorCodBarras(valor);}
  throw new Error("Tipo de busca inválido: " + tipo);
}


async function handleEntrada(valor, tipoBusca, quantidade = 1) {  
  const produto = await buscarProduto(tipoBusca, valor);

  if (!produto) {
    showToast("⚠️Produto inexistente ou desativado!", 2500);
    document.getElementById("entra").value = "";
    return;
  }
  
  if (!Number.isInteger(quantidade) && produto.fracionado !== 'SIM') {
    showToast(`🚫 Produto "${produto.produto}" não permite quantidade fracionada!`, 2500);
    document.getElementById("entra").value = "";
    return;
  }

  if (!verificarEstoque(produto, quantidade)) {
    showToast("⚠️ Estoque insuficiente!\nDisponível: " + qtde.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),  2500);
    document.getElementById("entra").value = "";
    return;
  }

  const estoqueAtualizado = await diminuirEstoque(produto.controle, quantidade);
  if (!estoqueAtualizado) {
    showToast("❌ Erro ao atualizar estoque!", 2500);
    document.getElementById("entra").value = "";
    return;
  }  

  adicionarItemVenda(produto, quantidade);
  atualizarTabela();  
  document.getElementById("entra").value = "";
  document.getElementById("entra").focus();
}

async function buscarProdutoPorControle(controle) {
  try {
    const res = await fetch(`/produtos/controle/${controle}`);    
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    return null;
  }
}

async function buscarProdutoPorCodBarras(codbarras) {
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

  function verificarEstoque(produto, quantidade) {
    qtde = produto.quantidade
    return produto.quantidade >= quantidade;
}

  async function diminuirEstoque(controle, quantidade) {    
  try {
    const res = await fetch(`/produtos/${controle}/diminuir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade })
    });
    return res.ok;
  } catch (err) {
    console.error('Erro ao diminuir estoque:', err);
    return false;
  }
  }

  function adicionarItemVenda(produto, quantidade) {
    const total = produto.precovenda * quantidade;
    vendas.push({    
    controle: produto.controle,
    produto: produto.produto,    
    precovenda: produto.precovenda,
    quantidade,
    total
    });
  }

 let totalGeral=0;
 function atualizarTabela() {
  const tbody = document.getElementById('tabela-venda');
  tbody.innerHTML = '';
  totalGeral = 0;
  let subtotal = 0;
  vendas.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: left; padding-left: 2px; padding-center: 80%;">${item.produto}</td>      
      <td style="text-align: right; padding-left: 16px; padding-right: 100px;">
        R$ ${parseFloat(item.precovenda).toFixed(2)}
      </td>
      <td>${parseFloat(item.quantidade).toFixed(2)}</td>
      <td style="text-align: right; padding-left: 16px; padding-right: 100px;">
        R$ ${parseFloat(item.total).toFixed(2)}
      </td>
      <td style="text-align: center;">
        <button class="btn-apagar" style="background-color: #f1ab13; color: white; border: none; padding: 4px 8px; cursor: pointer;">
          🗑️
        </button>
      </td>
    `;

    const botao = tr.querySelector('.btn-apagar');
    botao.addEventListener('click', async () => {
      await reverterItemEstoque(item);
      vendas.splice(index, 1);
      limparcalculos()
      if(vendas.length==0)
      {
      zerado = 1
      document.getElementById('subtotal').innerText = '0,00'
      desabilitarControles(true);
      controlarBotoesMenu(true);
      }
      atualizarTabela();
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
  totalGeral = subtotal - desconto + acrescimo;
  descontov = desconto;
  acrescimov = acrescimo;
  subtotalv = subtotal;
  
  if ((descPorcento && descInput > 99) || totalGeral <= 0) {
    if(zerado == 0)
    {
    showToast('Não pode se aplicar esse desconto!', 2500);
    }
    document.getElementById('desconto').value = '';
    document.getElementById('acrescimo').value = '';
    atualizarTabela()
    zerado = 0
    return;
  }
  document.getElementById('subtotal').innerText = subtotal.toFixed(2);
  document.getElementById('dcto').innerText = desconto.toFixed(2);
  document.getElementById('acres').innerText = acrescimo.toFixed(2);
  document.getElementById('total-geral').innerText = totalGeral.toFixed(2);
  document.getElementById('falta').value = totalGeral.toFixed(2);
  desabilitarControles(totalGeral <= 0);
  controlarBotoesMenu(!(totalGeral > 0 || vendas.length > 0));
}

document.getElementById('desconto').addEventListener('input', () => {
    atualizarTabela();
    if (dinheirov>0 || cartaoDebitov >0 || cartaoCreditov >0 && swti==0 )
    {
      calcularVenda()
    }
});
document.getElementById('descontoPorcentagem').addEventListener('change', () => {  
  atualizarTabela();
  if (dinheirov>0 || cartaoDebitov >0 || cartaoCreditov >0 && swti==0)
    {
      calcularVenda()
    }

});
document.getElementById('acrescimo').addEventListener('input', () => {  
  atualizarTabela();
  if (dinheirov>0 || cartaoDebitov >0 || cartaoCreditov >0 && swti==0)
    {
      calcularVenda()
    }
});
document.getElementById('acrescimoPorcentagem').addEventListener('change', () => {  
  atualizarTabela();
  if (dinheirov>0 || cartaoDebitov >0 || cartaoCreditov >0 && swti==0)
    {
      calcularVenda()
    }
});  

  const btnFinaliza = document.getElementById('btnFinalizar');
  btnFinaliza.addEventListener('click', () => {
  finalizarVenda();    
  });

const checkboxParcelado = document.getElementById('parceladoCredito');
const inputCartaoCredito = document.getElementById('cartaoCredito');
const detalhesParcelamento = document.getElementById('detalhesParcelamento');
const inputQtdParcelas = document.getElementById('qtdParcelas');
const inputVencimento = document.getElementById('vencimentoDia');

async function atualizarVisibilidadeParcelamento() {
  const parcelado = checkboxParcelado.checked;
  const valorCartao = parseFloat(inputCartaoCredito.value) || 0;  
  if (parcelado && valorCartao > 0 && controleSelecionado!=1) {
  await mostrarParcelasAbertas(controleSelecionado);
  await buscarLimiteCliente(controleSelecionado) ;  
  
  const disponi = (await calcularDisponibilidade(controleSelecionado)).toFixed(2);  
  if (valorCartao > disponi)
  {
    showToast(`Excedido o crédito disponível do cliente! Limite: R$ ${limitec.toFixed(2)}, Dívida: R$ ${deuda.toFixed(2)}, Disponível: R$ ${disponi}`,3500
    );
    return
  }
  }  
  
  const mostrar = parcelado && valorCartao > 0;
  detalhesParcelamento.style.display = mostrar ? 'block' : 'none';  
  if (!mostrar) {
    inputQtdParcelas.value = '1';
    inputVencimento.value = '';
  }
}

checkboxParcelado.addEventListener('change', atualizarVisibilidadeParcelamento);
inputCartaoCredito.addEventListener('input', atualizarVisibilidadeParcelamento);

function finalizarVenda() {
  let dinheirov = parseFloat(document.getElementById('dinheiro').value) || 0;
  let cartaoDebitov = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  let cartaoCreditov = parseFloat(document.getElementById('cartaoCredito').value) || 0;

  dinheirov = arredondar(dinheirov);  
  cartaoDebitov = arredondar(cartaoDebitov);
  cartaoCreditov = arredondar(cartaoCreditov);    

  let total = arredondar(totalGeral);
  let totalPago = arredondar(dinheirov + cartaoDebitov + cartaoCreditov);

  if (totalPago < total) {
    const falta = arredondar(total - totalPago);
    document.getElementById('falta').value = falta.toFixed(2);
    document.getElementById('troco').value = "0.00";
    showToast("O valor total não é suficiente. Verifique os pagamentos.", 2500);    
    return;    
  }
 
  if (totalPago > total && dinheirov === 0) {
    showToast("O valor total dos cartões excede o valor da venda. Verifique os pagamentos.", 2500);
    return;
  }
 
  let troco = 0;
  if (dinheirov > 0) {
    const excessoDinheiro = arredondar(dinheirov - (total - cartaoDebitov - cartaoCreditov));
    if (excessoDinheiro > 0) {
      troco = excessoDinheiro;
      trocov = troco
    }
  }

  document.getElementById('troco').value = troco.toFixed(2);
  document.getElementById('falta').value = "0.00";
  showToast("Fatura finalizada com sucesso", 5000);  
  if (dinheirov > 0 || cartaoDebitov > 0 || cartaoCreditov > 0) {
    salvarLancamentosCaixa();
  }  
  const ehParcelado = document.getElementById('parceladoCredito').checked;
  if (ehParcelado && cartaoCreditov > 0) {
    salvarParcelasReceber();
  }
    
  let vendaImpressa = false
  if (vendaImpressa) return
  else{
  vendaImpressa = true
  imprimirVenda({
    usuario: usuariologadoF,
    cliente: nomeclien,
    total: total
  })
  }


  limparVenda();

  setTimeout(() => {
    location.reload();
  }, 2000);
}

function arredondar(valor) {
  return Number(valor.toFixed(2));
}

function calcularVenda() {
  let dinheiro1 = parseFloat(document.getElementById('dinheiro').value) || 0;
  let cartaoDebito1 = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  let cartaoCredito1 = parseFloat(document.getElementById('cartaoCredito').value) || 0;    
  let total1 = totalGeral;

  dinheiro1 = arredondar(dinheiro1);
  dinheirov = dinheiro1
  cartaoDebito1 = arredondar(cartaoDebito1);
  cartaoDebitov = cartaoDebito1
  cartaoCredito1 = arredondar(cartaoCredito1);  
  cartaoCreditov = cartaoCredito1
  total1 = arredondar(total1);

  let totalPago1 = arredondar(dinheiro1 + cartaoDebito1 + cartaoCredito1);  
  
  let desabilitar = dinheiro1 >= totalGeral && (cartaoDebito1 + cartaoCredito1)==0 && swti ==0 ;  
    document.getElementById('cartaoDebito').disabled  = desabilitar;
    document.getElementById('cartaoCredito').disabled = desabilitar;
  
  if (totalPago1 < total1) {
    const falta1 = arredondar(total1 - totalPago1);
    document.getElementById('falta').value = falta1.toFixed(2);
    document.getElementById('troco').value = "0.00";    
    showToast(`O valor total não é suficiente. Verifique os pagamentos. Total: R$ ${total1.toFixed(2)} | Pago: R$ ${totalPago1.toFixed(2)}`, 2000);
    return;
  } 

  if (totalPago1 > total1 && dinheiro1 ==0) {
    document.getElementById('falta').value = "0.00";
    document.getElementById('troco').value = "0.00";
    showToast("O valor total dos cartões excede do valor da venda. Verifique os pagamentos.", 2500);
    return;
  }

  if (totalPago1 > total1) {
    const troco1 = arredondar(totalPago1 - total1);    
    document.getElementById('troco').value = troco1.toFixed(2);
    document.getElementById('falta').value = "0.00";
    return;
  } 
  document.getElementById('troco').value = "0.00";
  document.getElementById('falta').value = "0.00";
}


function gerarParcelasNaTela(parcelas, diaVencimento, valorCredito) {
  const container = document.getElementById('parcelasGeradas');
  container.innerHTML = '';
  window.listaParcelasTextoVenda = []; 

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
    listaParcelasTextoVenda.push(`${numeroParcela} ${dia}/${mes}/${ano}   R$ ${valor}`);
  }
  container.innerHTML = `<strong>Parcelas:</strong><br>${listaParcelasTextoVenda.join('<br>')}`;
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

async function salvarParcelasReceber() {
  const funcionario = funcionarioSelecionado;
  const cliente_id = controleSelecionado || 1;
  const descricao = 'Venda no PDV';
  const datacadastro = new Date().toISOString().slice(0, 10);

  const valororiginal = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  const totalparcelas = parseInt(document.getElementById('qtdParcelas').value) || 1;
  const vencimentoDia = parseInt(document.getElementById('vencimentoDia').value) || 1;

  // Trabalhar com centavos para evitar erros de arredondamento
  const valorTotalCentavos = Math.round(valororiginal * 100);
  const valorParcelaCentavos = Math.floor(valorTotalCentavos / totalparcelas);
  const ultimaParcelaCentavos = valorTotalCentavos - (valorParcelaCentavos * (totalparcelas - 1));

  const hoje = new Date();
  const promessas = [];

  for (let i = 0; i < totalparcelas; i++) {
    const numeroParcela = i + 1;
    const valorp = (i === totalparcelas - 1 ? ultimaParcelaCentavos : valorParcelaCentavos) / 100;

    // Calcula a data de vencimento
    const vencimentoBase = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1);
    const diasNoMes = new Date(vencimentoBase.getFullYear(), vencimentoBase.getMonth() + 1, 0).getDate();
    vencimentoBase.setDate(Math.min(vencimentoDia, diasNoMes));
    const datavencimento = vencimentoBase.toISOString().slice(0, 10);

    const parcela = {
      cliente_id,
      funcionario,
      descricao,
      datavencimento,
      datapagamento: null, // Parcelas abertas devem ser NULL
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

    const prom = fetch('/receber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parcela)
    }).then(async res => {
      if (!res.ok) {
        const textoErro = await res.text();
        console.error(`Erro ao salvar parcela ${numeroParcela}:`, textoErro);
      }
    }).catch(err => {
      console.error(`Erro ao enviar parcela ${numeroParcela}:`, err);
    });

    promessas.push(prom);
  }

  await Promise.all(promessas);
  console.log('Todas as parcelas foram enviadas.');
}


async function salvarLancamentosCaixa() {  
  const cod_funcionario = codfunciona;
  const funcionario = funcionarioSelecionado;
  const cod_cliente = controleSelecionado || 1;  
  const cliente = nomeclien;
  const descricao = 'Venda no PDV';
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0'); 
  const dia = String(agora.getDate()).padStart(2, '0');
  const datacadastro = `${ano}-${mes}-${dia}`; 
  const valorDinheiro = (dinheirov - trocov) 
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
      cod_cliente,
      cliente,
      cod_funcionario,
      funcionario,
      cod_fornecedor: null,
      fornecedor: '',
      descricao: descricao + ' (Dinheiro)',
      datacadastro,
      especies: 'Dinheiro',
      valorentrada: valorDinheiro,
      valorsaida: 0
    });
  }

  if (valorDebito > 0) {
    movimentos.push({
      cod_cliente,
      cliente,
      cod_funcionario,
      funcionario,
      cod_fornecedor: null,
      fornecedor: '',
      descricao: descricao + ' (Débito)',
      datacadastro,
      especies: 'Cartão de Débito',
      valorentrada: valorDebito,
      valorsaida: 0
    });
  }
  
  if (valorCredito > 0 && !ehParcelado ) {
    movimentos.push({
      cod_cliente,
      cliente,
      cod_funcionario,
      funcionario,
      cod_fornecedor: null,
      fornecedor: '',
      descricao: descricao + ' (Crédito)',
      datacadastro,
      especies: 'Crédito à vista',
      valorentrada: valorCredito,
      valorsaida: 0
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
    const btnCancela = document.getElementById('btnCancelarv');
    btnCancela.addEventListener('click', () => {
    cancelarVenda();    
    });
    async function cancelarVenda() {
    await reverterEstoque();   
    limparVenda();
    const cance = 'Fatura cancelada com sucesso'
    showToast(cance, 1000);      
    limparNome();
    location.reload();
  }

  async function reverterEstoque() {
  for (const item of vendas) {
    try {
      await fetch(`/produtos/${item.controle}/aumentar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: item.quantidade })
      });
    } catch (err) {
      console.error(`Erro ao devolver estoque do produto ${item.produto}:`, err);
    }
  }
  }

  async function reverterItemEstoque(item) {
  try {
    await fetch(`/produtos/${item.controle}/aumentar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: item.quantidade })
    });
  } catch (err) {
    console.error(`Erro ao devolver estoque do produto ${item.produto}:`, err);
  }
}

function imprimirVenda(venda = {}) {
  const formatarMoeda = (valor) =>
    parseFloat(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const dataHoraAtual = new Date().toLocaleString('pt-BR');
  const totalCompra = venda.total || totalGeral || 0;
  const totalDin = dinheirov || 0;
  const totalTro = trocov || 0;
  const totalDeb = cartaoDebitov || 0;
  const totalCred = cartaoCreditov || 0;
  const subt = subtotalv || 0;
  const dcto = descontov || 0;
  const acres = acrescimov || 0;

  const usuarioVenda = venda.usuario || 'Usuário do Sistema';
  const clienteVenda = venda.cliente || 'Usuário do Sistema';
  const itensVenda = Array.isArray(vendas) ? vendas : [];

  const listaParcelas = (typeof listaParcelasTextoVenda !== 'undefined' && Array.isArray(listaParcelasTextoVenda))
  ? listaParcelasTextoVenda
  : [];

  const gerarCabecalho = () => `
    <div style="text-align: center; line-height: 1.2; font-family: monospace; font-size: 12px; margin-bottom: 4px;">
      <strong>${emitenteNome}</strong><br>
      CNPJ/CPF: ${emitenteDoc}<br>
      TEL/CEL: ${emitenteTelefone} <br>
      <strong>*** COMPROVANTE DE VENDA ***</strong>
    </div>
  `;

  const gerarItensHTML = () => itensVenda.map(item => `
    <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
      <span>${item.produto} X ${item.quantidade}</span>
      <span>${formatarMoeda(item.total)}</span>
    </div>
  `).join('');

  const gerarTotaisHTML = () => `
    <div style="font-size: 12px; font-weight: bold;">
      <div style="display: flex; justify-content: space-between;"><span>DINHEIRO:</span> <span>${formatarMoeda(totalDin)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>TROCO:</span> <span>${formatarMoeda(totalTro)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>CARTÃO DE DÉBITO:</span> <span>${formatarMoeda(totalDeb)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>CARTÃO DE CRÉDITO:</span> <span>${formatarMoeda(totalCred)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>SUB TOTAL DA VENDA:</span> <span>${formatarMoeda(subt)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>DESCONTO NA VENDA:</span> <span>${formatarMoeda(dcto)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>ACRÉSCIMO NA VENDA:</span> <span>${formatarMoeda(acres)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>TOTAL:</span> <span>${formatarMoeda(totalCompra)}</span></div>
    </div>
  `;

  const gerarParcelasHTML = () => {
  if (!listaParcelas.length) return ''; 
  return `
    <div style="margin-top: 6px; font-size: 10px; font-family: monospace;">
      <strong>Parcelas:</strong>
      ${listaParcelas.map(parcela => `<div>${parcela}</div>`).join('')}
    </div>
  `;
};


  const gerarCorpoCupom = () => `
    ${gerarCabecalho()}
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    <div style="font-size: 10px; line-height: 1.4; font-family: monospace;">
      <p><strong>Data/Hora:</strong> ${dataHoraAtual}</p>
      <p><strong>Usuário:</strong> ${usuarioVenda}</p>
      <p><strong>Cliente:</strong> ${clienteVenda}</p>
      <p><strong>Descrição</strong> ─ <strong>Quantidade</strong> ───────────────────────── <strong>Total</strong></p>
    </div>
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    ${gerarItensHTML()}
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    ${gerarTotaisHTML()}
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
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0'
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlFinal);
  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300);
  };
}
 
  function limparVenda() {
  vendas = []; 
  totalGeral = 0;  
  const tbody = document.getElementById('tabela-venda');
  tbody.innerHTML = '';   
  
  const resultado = document.getElementById('resultado');
  if (resultado) {
    resultado.textContent = '';
    resultado.style.display = 'none';
  }
  }

window.addEventListener('beforeunload', () => {
  if (vendas.length > 0) {
    const dados = vendas.map(item => ({
      controle: item.controle,
      quantidade: item.quantidade
    }));
    const blob = new Blob([JSON.stringify(dados)], {
      type: 'application/json'
    });
    navigator.sendBeacon('/produtos/repor-em-lote', blob);
  }
});

const camposVenda = ['dinheiro', 'cartaoDebito', 'cartaoCredito'];

camposVenda.forEach((id, index) => {
  const campo = document.getElementById(id);
  if (campo && swti==0) {
    campo.addEventListener('blur', () => {
      calcularVenda();
      console.log(`Campo ${id} perdeu o foco!`);
    });    
    campo.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && swti==0) {
        calcularVenda();
        console.log(`Campo ${id} acionado com Enter!`);       
        const proximoCampo = document.getElementById(camposVenda[index + 1]);
        if (proximoCampo) {
          proximoCampo.focus();
        }
      }
    });
  }
});
}

document.addEventListener('DOMContentLoaded', function () {
  const campos5 = [
    ["qtdParcelas", "vencimentoDia"]    
  ];

  campos5.forEach(([de, para]) => {
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
  const campos11 = [
    ["desconto", "acrescimo"],    
    ["acrescimo", "dinheiro"]    
  ];

  campos11.forEach(([de, para]) => {
    const elemDe = document.getElementById(de);
    const elemPara = document.getElementById(para);
    if (elemDe && elemPara) {
      elemDe.addEventListener("keydown", function (event) {
        if (event.key === "Enter") elemPara.focus();
      });
    }
  });  
});

function mostrarParcelasAbertas(clienteId) {
  fetch(`/clientes/${clienteId}/total-aberto`)
    .then(res => res.json())
    .then(data => {      
      deuda = parseFloat(data.total_aberto) || 0;
      if (isNaN(deuda)) {
        alert('Valor inválido nas parcelas abertas');
        deuda = null;
      } else {      
      }
    })
    .catch(err => {
      alert('Erro ao buscar parcelas em aberto: ' + err.message);
      deuda = null;
    });
}

async function buscarLimiteCliente(controle) {
  try {
    const res = await fetch(`/clientes/${controle}/limite`);
    if (!res.ok) throw new Error('Cliente não encontrado');
    const { limite } = await res.json();
    limitec = parseFloat(limite ?? 0);   
    if (isNaN(limitec)) throw new Error('Limite inválido recebido do servidor');
    
  } catch (err) {
    alert('Erro: ' + err.message);
    limitec = null;
  }
}

async function calcularDisponibilidade(clienteId) {
  await mostrarParcelasAbertas(clienteId);
  await buscarLimiteCliente(clienteId);
  if (deuda !== null && limitec !== null) {
    const disponibilidade = limitec - deuda;    
    console.log("Disponibilidade calculada:", disponibilidade);
    return disponibilidade;
  } else {    
    return null;
  }
}