let paginaAtualParcelas = 1;
let registrosPorPaginaParcelas = 11;
let listaParcelasFiltradas = [];
let valorTotalSelecionado = 0;
let valorTotalCli = 0;
let subtotalSelecionado = 0;
let valorTotalSelCl = 0
let totali = 0;
let swti = 0;
totalGeral = 0
function carregarClientesFiltro() {
  limparNome();
  document.getElementById('formPresenta').style.display = 'none';
  document.getElementById('formListaReceberCliente').style.display = 'block';
  document.getElementById('selectCliFiltro').style.display = 'block';  
  document.getElementById('btnFinalizarFi').style.display = 'none';             
  document.getElementById('btnFinalizarOs').style.display = 'none';             
  document.getElementById('btnFinalizarOsOs').style.display = 'none';  
  document.getElementById('btnCancelaros').style.display = 'none';                 
  document.getElementById('btnFinalizar').style.display = 'none';             
  document.getElementById('btnFinalizarFc').style.display = 'inline-block';             
  RestauraLabel()
  tornarDescontoEAcrescimoSomenteLeitura(false)    
  document.getElementById('btnFinalizarOs').style.display = 'none';
}

function verParcelasDoCliente() {
  document.getElementById('btnFinalizarFi').style.display = 'none';           
  swti = 1
  removerPaginacaoParcelas() 
  const controleCliente = controleSeleCliente;
  if (!controleCliente) {

    return;
  }

  fetch('/receber')
    .then(res => res.json())
    .then(receber => {
      listaParcelasFiltradas = receber.filter(p =>
        String(p.cliente_id) === String(controleCliente) && p.status === 'ABERTO'
      );

      if (listaParcelasFiltradas.length === 0) {
        document.getElementById('tabelaReceberCliente').querySelector('tbody').innerHTML =
          `<tr><td colspan="14" style="text-align: center;">Nenhuma parcela encontrada para o cliente selecionado.</td></tr>`;
        document.getElementById('btnPagarParcelas').style.display = 'none';
        return;
      }
      document.getElementById('btnPagarParcelas').style.display = 'block';
      paginaAtualParcelas = 1;
      renderizarTabelaComPaginacao();
    })
    .catch(err => alert('Erro ao buscar parcelas: ' + err.message));

  const btnPagar = document.getElementById('btnPagarParcelas');
  if (btnPagar) {
    btnPagar.onclick = () => {
      const controleCliente = controleSeleCliente;
      if (!controleCliente) return showToast("Selecione um cliente!", 2500);
      const selecionadas = document.querySelectorAll('.checkParcela:checked');
      if (selecionadas.length === 0) return showToast("Selecione ao menos uma parcela!", 2500);
      pagarParcelas();
    };
  }
}''

const parcelasSelecionadas = new Map(); 

function renderizarTabelaComPaginacao() {
  const tabela = document.getElementById('tabelaReceberCliente');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';
  const inicio = (paginaAtualParcelas - 1) * registrosPorPaginaParcelas;
  const fim = inicio + registrosPorPaginaParcelas;
  const parcelasPagina = listaParcelasFiltradas.slice(inicio, fim);
  let totalAberto = 0;
  parcelasPagina.forEach(parcela => {
    const valorAberto = parseFloat(parcela.valororiginal || 0) +
                        parseFloat(parcela.multa || 0) +
                        parseFloat(parcela.juros || 0) -
                        parseFloat(parcela.valorpago || 0);
    totalAberto += valorAberto;
    const controle = String(parcela.controle);
    const checked = parcelasSelecionadas.has(controle) ? 'checked' : '';
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td style="border:1px solid #ccc;;text-align: center"><input type="checkbox" class="checkParcela" value="${controle}" data-valor="${valorAberto.toFixed(2)}" ${checked}></td>
      <td style="border:1px solid #ccc;text-align: center;">${controle}</td>
      <td style="border:1px solid #ccc;">${parcela.funcionario}</td>
      <td style="border:1px solid #ccc;">${parcela.nomecliente}</td>
      <td style="border:1px solid #ccc;text-align: right;">R$ ${parseFloat(parcela.valororiginal).toFixed(2)}</td>
      <td style="border:1px solid #ccc;text-align: right;">R$ ${parseFloat(parcela.valorpago).toFixed(2)}</td>
      <td style="border:1px solid #ccc;text-align: center;">${parcela.numeroparcela}</td>
      <td style="border:1px solid #ccc;text-align: center;">${parcela.totalparcelas}</td>
      <td style="border:1px solid #ccc;text-align: center;">${formatarDataBRL(parcela.datacadastro)}</td>
      <td style="border:1px solid #ccc;text-align: center;">${formatarDataBRL(parcela.datavencimento)}</td>      
      <td style="border:1px solid #ccc;text-align: right;">R$ ${parseFloat(parcela.multa).toFixed(2)}</td>
      <td style="border:1px solid #ccc;text-align: right;">R$ ${parseFloat(parcela.juros).toFixed(2)}</td>
      <td style="border:1px solid #ccc;text-align: center;">${parcela.status}</td>
      <td style="border:1px solid #ccc;"><button class="btnExcluirrec" data-controle="${controle}">🗑️</button></td>
    `;
    tbody.appendChild(linha);
  });

  tbody.innerHTML += `
    <tr>
      <td colspan="14" style="text-align: right; font-weight: bold; padding-top: 10px;">
        TOTAL EM ABERTO: R$ ${totalAberto.toFixed(2)}
      </td>
    </tr>
    <tr>
      <td colspan="14" style="text-align: right; font-weight: bold;" id="totalSelecionadas">
        TOTAL DE SELECIONADAS: R$ ${valorTotalSelecionado.toFixed(2)}
      </td>
    </tr>
  `;
  
  configurarBotoesExcluirReceberC()
  
  const atualizarTotalSelecionadas = () => {
    document.querySelectorAll('.checkParcela').forEach(cb => {
      const controle = cb.value;
      const valor = parseFloat(cb.getAttribute('data-valor') || 0);

      if (cb.checked) {
        parcelasSelecionadas.set(controle, valor);
      } else {
        parcelasSelecionadas.delete(controle);
      }
    });

    let total = 0;
    parcelasSelecionadas.forEach(v => total += v);
    valorTotalSelecionado = total;
    subtotalSelecionado = total.toFixed(2);
    valorTotalSelCl = valorTotalSelecionado
    document.getElementById('totalSelecionadas').innerText =
      `TOTAL DE SELECIONADAS: R$ ${total.toFixed(2)}`;
  };
  
  document.querySelectorAll('.checkParcela').forEach(cb =>
    cb.addEventListener('change', atualizarTotalSelecionadas)
  );
  
  const checkTodos = document.getElementById('checkTodos');
  if (checkTodos) {
    checkTodos.checked = false;
    checkTodos.onchange = () => {
      document.querySelectorAll('.checkParcela').forEach(cb => {
        cb.checked = checkTodos.checked;
      });
      atualizarTotalSelecionadas();
    };
  }
  renderizarControlesPaginacao();
}

function configurarBotoesExcluirReceberC() {
  document.querySelectorAll('.btnExcluirrec').forEach(botao => {
    const controle = botao.getAttribute('data-controle');
    if (!controle) return;
    Object.assign(botao.style, {
      backgroundColor: '#f1ab13',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'inline-block'
    });
    botao.disabled = false;    
    const pai = botao.parentElement;
    if (pai) {
      pai.style.textAlign = 'center';
    }
    botao.removeEventListener('click', botao._handlerExcluir);
    const handler = () => removerReceberC(controle);
    botao.addEventListener('click', handler);
    botao._handlerExcluir = handler;
  });
}

function renderizarControlesPaginacao() {
  let container = document.getElementById('paginacaoParcelas');
  if (!container) {
    container = document.createElement('div');
    container.id = 'paginacaoParcelas';
    container.style = 'margin-top: 10px; text-align: center;';
    document.getElementById('tabelaReceberCliente').after(container);
  }
  const totalPaginas = Math.ceil(listaParcelasFiltradas.length / registrosPorPaginaParcelas);
  container.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.style = `
      margin: 0 4px; padding: 6px 12px;
      ${i === paginaAtualParcelas ? 'font-weight: bold; background-color: #f1ab13; color: white;' : ''}
    `;
    btn.onclick = () => {
      paginaAtualParcelas = i;
      renderizarTabelaComPaginacao();
    };
    container.appendChild(btn);
  }
}

function removerPaginacaoParcelas() {
  const container = document.getElementById('paginacaoParcelas');
  if (container) {
    container.remove(); 
  }
}

function removerReceberC(controle) {    
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.5); display: flex;
        align-items: center; justify-content: center; z-index: 1000;
      `;
    
      const caixa = document.createElement('div');
      caixa.style.cssText = `
        background: white; padding: 20px; border-radius: 10px;
        text-align: center; max-width: 320px; width: 90%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2); overflow: hidden;
        font-family: sans-serif;
      `;
    
      const franja = document.createElement('div');
      franja.style.cssText = `
        height: 6px; background-color: #f1ab13; width: 100%;
        margin: -20px -20px 10px -20px; border-top-left-radius: 10px; border-top-right-radius: 10px;
      `;
    
      const imagem = document.createElement('img');
      imagem.src = 'https://cdn-icons-png.flaticon.com/512/564/564619.png';
      imagem.alt = 'Advertência';
      imagem.style.cssText = 'width: 50px; margin-bottom: 10px;';
    
      const texto = document.createElement('p');
      texto.textContent = 'Deseja realmente cancelar essa Parcela?';
      texto.style.marginBottom = '15px';
    
      const btnSim = document.createElement('button');
      btnSim.textContent = 'Sim';
      btnSim.style.cssText = `
        margin-right: 10px; padding: 8px 16px;
        background-color: #dc3545; color: white;
        border: none; border-radius: 5px; cursor: pointer;
      `;
    
      const btnCancelar = document.createElement('button');
      btnCancelar.textContent = 'Cancelar';
      btnCancelar.style.cssText = `
        padding: 8px 16px; background-color: #6c757d;
        color: white; border: none; border-radius: 5px;
        cursor: pointer;
      `;        
      caixa.appendChild(franja);
      caixa.appendChild(imagem);
      caixa.appendChild(texto);
      caixa.appendChild(btnSim);
      caixa.appendChild(btnCancelar);
      modal.appendChild(caixa);
      document.body.appendChild(modal);                  
      btnSim.onclick = () => {
        document.body.removeChild(modal);
    
        fetch(`/receber/cancelar/${controle}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
        })
          .then(res => {
            if (!res.ok) throw new Error();
            result = "Parcela cancelada com sucesso!";  
            showToast(result, 2500);                                                             
            resultado.style.color = "green";                
            resultado.style.display = "block";  
            esperar();         
            limparNome();
            document.getElementById('formPresenta').style.display = 'none'; 
            document.getElementById('formListaReceberCliente').style.display = 'none';
            document.getElementById('btnReCli').click();
            document.getElementById('btnReCliB').click();
          })
          .catch()  ;
      };              
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
    } 
  const btnPagar = document.getElementById('btnPagarParcelas');
if (btnPagar) {
  btnPagar.onclick = () => {
    const controleCliente = controleSeleCliente;

    if (!controleCliente) {
      const result = "Selecione um cliente!";
      showToast(result, 2500);
      return;
    }
    const selecionadas = document.querySelectorAll('.checkParcela:checked');
    if (selecionadas.length === 0) {
      const result = "Selecione ao menos uma parcela!";
      showToast(result, 2500);
      return;
    }
    pagarParcelas();
  };
}

   function pagarParcelas() {
    const modal = document.createElement('div');
    modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.5); display: flex;
    align-items: center; justify-content: center; z-index: 1000;
  `;

  const caixa = document.createElement('div');
  caixa.style.cssText = `
    background: white; padding: 20px; border-radius: 10px;
    text-align: center; max-width: 320px; width: 90%;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2); overflow: hidden;
    font-family: sans-serif;
  `;

  const franja = document.createElement('div');
  franja.style.cssText = `
    height: 6px; background-color: #007BFF; width: 100%;
    margin: -20px -20px 10px -20px; border-top-left-radius: 10px; border-top-right-radius: 10px;
  `;

  const imagem = document.createElement('img');
  imagem.src = 'https://cdn-icons-png.flaticon.com/512/564/564619.png';
  imagem.alt = 'Advertência';
  imagem.style.cssText = 'width: 50px; margin-bottom: 10px;';

  const texto = document.createElement('p');
  texto.textContent = 'Tem certeza de que deseja quitar estas parcelas?';
  texto.style.marginBottom = '15px';

  const btnSim = document.createElement('button');
  btnSim.textContent = 'Sim';
  btnSim.style.cssText = `
    margin-right: 10px; padding: 8px 16px;
    background-color: #dc3545; color: white;
    border: none; border-radius: 5px; cursor: pointer;
  `;

  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.style.cssText = `
    padding: 8px 16px; background-color: #6c757d;
    color: white; border: none; border-radius: 5px;
    cursor: pointer;
  `;

  caixa.appendChild(franja);
  caixa.appendChild(imagem);
  caixa.appendChild(texto);
  caixa.appendChild(btnSim);
  caixa.appendChild(btnCancelar);
  modal.appendChild(caixa);
  document.body.appendChild(modal);

  btnSim.onclick = () => {
    document.body.removeChild(modal);        
    FinalizarOperacao();        
  };

  btnCancelar.onclick = () => {
    document.body.removeChild(modal);
  };
}

function pagarParcelasSelecionadas() {
  const controleCliente = controleSeleCliente;
  if (!controleCliente) {
    showToast("Selecione um Cliente!", 2500);
    return;
  }
  if (parcelasSelecionadas.size === 0) {
    showToast("Selecione ao menos uma parcela!", 2500);
    document.getElementById('btnPagarParcelas').style.display = 'block';
    return;
  }
  const parcelasIds = Array.from(parcelasSelecionadas.keys());
  let valorAbono = 0;

  parcelasSelecionadas.forEach(valor => {
    valorAbono += valor;
  });

  fetch(`/${controleCliente}/pagar-parcelas`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parcelasIds, valorAbono })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        showToast(`Erro: ${data.error}`, 2500);
      } else {      
        parcelasSelecionadas.clear();
        valorTotalSelecionado = 0;
        subtotalSelecionado = 0;
        verParcelasDoCliente(); 
      }
    })
    .catch(err => {
      console.error('Erro ao pagar parcelas:', err);
      alert('Erro ao processar pagamento.');
    });
}

async function salvarLancamentosCaixaReceber() {  
  const cod_funcionario = codfuncionaR;
  const funcionario = funcionarioSelecionadoR;
  const cod_cliente = controleSeleCliente || 1;
  const cliente = nomeclienSele;
  const descricao = 'Recebimento Parcelas';
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0'); 
  const dia = String(agora.getDate()).padStart(2, '0');
  const datacadastro = `${ano}-${mes}-${dia}`;  
  const valorDinheiro = arredondar(totalGeral)
  const debitoInput = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  const creditoInput = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  let especies = [];

  if (dinheirov > 0) especies.push("Dinheiro");
  if (debitoInput > 0) especies.push("Cartão Débito");
  if (creditoInput > 0) especies.push("Crédito à Vista");
  especies = especies.join(" + ") || "Nenhuma forma de pagamento selecionada";      
    
  if (valorDinheiro === 0) {
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
      descricao: descricao,
      datacadastro,
      especies: especies,
      valorentrada: valorDinheiro,
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
        limparoperacao();   
        removerPaginacaoParcelas()          
      }
    } catch (err) {
      console.error('Erro de rede ao enviar movimentação:', err);
    }
  }
}

function FinalizarOperacao() {  
  window.scrollTo(0, 0);
  limparcalculos();
  desabilitarControles(false)
  document.getElementById('btnFinalizar').style.display = 'none';         
  document.getElementById('formPainel').style.display = 'block';   
  document.getElementById('formCalculos').style.display = 'block';      
  document.getElementById("dinheiro").focus(); 
  document.getElementById('cartaoCredito').style.display = 'block';
  document.getElementById('btnCancelar').style.display = 'none';      
  document.getElementById('btnFinalizarFc').style.display = 'inline-block';             
  document.querySelector('label[for="cartaoCredito"]').style.display = 'block';
  document.getElementById('parceladoCredito').parentElement.style.display = 'none';
  descontov = document.getElementById('desconto');
  acrescimov = document.getElementById('acrescimo');
  const checkDesconto = document.getElementById('descontoPorcentagem');
  const checkAcrescimo = document.getElementById('acrescimoPorcentagem');
  const inputDesconto = document.getElementById('desconto');
  const inputAcrescimo = document.getElementById('acrescimo');
  checkDesconto.addEventListener('change', () => {
    inputDesconto.placeholder = checkDesconto.checked ? "0%" : "R$ 0,00";
  });

  checkAcrescimo.addEventListener('change', () => {
    inputAcrescimo.placeholder = checkAcrescimo.checked ? "0%" : "R$ 0,00";
  });
  CalcularDescAcres();  
}

function CalcularDescAcres() {  
  const subtotal = valorTotalSelCl;    
  const descInput = parseFloat(document.getElementById('desconto').value) || 0;
  const acresInput = parseFloat(document.getElementById('acrescimo').value) || 0;
  const descPorcento = document.getElementById('descontoPorcentagem').checked;
  const acresPorcento = document.getElementById('acrescimoPorcentagem').checked;
  const desconto = descPorcento ? (subtotal * descInput / 100) : descInput;  
  const acrescimo = acresPorcento ? (subtotal * acresInput / 100) : acresInput;  
  totalGeral = valorTotalSelCl - desconto + acrescimo;
  document.getElementById('total-geral').innerText = totalGeral.toFixed(2);  
  descontov = desconto;
  acrescimov = acrescimo;
  subtotalv = subtotal;
  if ((descPorcento && descInput > 99) || totalGeral <= 0) {
    showToast('Desconto inválido: excede 99% ou resulta em total zerado.', 2500);
    document.getElementById('desconto').value = '';
    document.getElementById('acrescimo').value = '';
    CalcularDescAcres(); 
    return;
  }
  document.getElementById('subtotal').innerText = subtotal.toFixed(2);
  document.getElementById('dcto').innerText = desconto.toFixed(2);
  document.getElementById('acres').innerText = acrescimo.toFixed(2);
  document.getElementById('total-geral').innerText = totalGeral.toFixed(2);
  document.getElementById('falta').value = totalGeral.toFixed(2);  
} 

function arredondar(valor) {
  return Number(valor.toFixed(2));
}

function calcularOperacao() {
  const dinheiroInput = parseFloat(document.getElementById('dinheiro').value) || 0;
  const debitoInput = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  const cartaoCreditov = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  const total = arredondar(totalGeral);  
  const dinheiro = arredondar(dinheiroInput);
  const debito = arredondar(debitoInput);
  const credito = arredondar(cartaoCreditov);
  const totalPago = arredondar(dinheiro + debito + credito);
  dinheirov = dinheiro;

  let desabilitar = dinheiro >= total && debito==0 && credito==0;  
    document.getElementById('cartaoDebito').disabled  = desabilitar;
    document.getElementById('cartaoCredito').disabled  = desabilitar;
    
  const faltaEl = document.getElementById('falta');
  const trocoEl = document.getElementById('troco');  
  if (totalPago < total) {
    const falta = arredondar(total - totalPago);
    faltaEl.value = falta.toFixed(2);
    trocoEl.value = "0.00";
    showToast(`O valor total não é suficiente. Verifique os pagamentos. Total: R$ ${total.toFixed(2)} | Pago: R$ ${totalPago.toFixed(2)}`, 2000);
    return;
  }  
if (totalPago > total && dinheiro ==0) {
    document.getElementById('falta').value = "0.00";
    document.getElementById('troco').value = "0.00";
    showToast("O valor total dos cartões excede do valor da venda. Verifique os pagamentos.", 2500);
    return;
  }

  if (totalPago >= total) {
    const troco = arredondar(totalPago - total);    
    document.getElementById('troco').value = troco.toFixed(2);
    document.getElementById('falta').value = "0.00";        
  }  
}
document.getElementById('falta').value = "0.00";        

const camposPagamento1 = ['dinheiro', 'cartaoDebito', 'cartaoCredito'];

function processarCampo(id) {
  if (swti === 1) {
    calcularOperacao();
  }
  console.log(`Campo ${id} processado!`);
}

camposPagamento1.forEach((id, index) => {
  const campo = document.getElementById(id);
  if (!campo) return;  
  campo.addEventListener('blur', () => {
    processarCampo(id);
  });  
  campo.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      processarCampo(id);
      const proximoCampo = document.getElementById(camposPagamento1[index + 1]);
      if (proximoCampo) {
        proximoCampo.focus();
      }
    }
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const btnFinaliza1 = document.getElementById('btnFinalizarFc');

  if (btnFinaliza1) {
    btnFinaliza1.addEventListener('click', () => {
      console.log('✅ Clique detectado no botão Finalizar FI');      
      FinalOperacao(); 
    });
  } else {
    console.error('❌ Botão com id="btnFinalizarFi" não encontrado.');
  }
});

  function FinalOperacao() {
  const dinheiro = arredondar(parseFloat(document.getElementById('dinheiro').value) || 0);
  const debito = arredondar(parseFloat(document.getElementById('cartaoDebito').value) || 0);
  const cartaoCreditov = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  const total = arredondar(totalGeral);
  const totalPago = arredondar(dinheiro + debito + cartaoCreditov);
  dinheirov = dinheiro;
  const faltaEl = document.getElementById('falta');
  const trocoEl = document.getElementById('troco');
  if (totalPago < total) {
    const falta = arredondar(total - totalPago);
    faltaEl.value = falta.toFixed(2);
    trocoEl.value = "0.00";
    showToast(`Pagamento insuficiente. Total: R$ ${total.toFixed(2)} | Pago: R$ ${totalPago.toFixed(2)}`, 2000);
    return;
  }

  if (totalPago > total && dinheiro ==0) {
    document.getElementById('falta').value = "0.00";
    document.getElementById('troco').value = "0.00";
    showToast("O valor total dos cartões excede do valor da venda. Verifique os pagamentos.", 2500);
    return;
  }

  if (totalPago >= total) {
    const troco = arredondar(totalPago - total);    
    document.getElementById('troco').value = troco.toFixed(2);
    document.getElementById('falta').value = "0.00";        
  }    

  result = "Pacelas quitadas com sucesso!";  
  showToast(result, 2500);  
  salvarLancamentosCaixaReceber(); 
  pagarParcelasSelecionadas();        
  document.getElementById('paginacaoParcelas').innerHTML = '';  
  document.getElementById('formPainel').style.display = 'none';   
  document.getElementById('formCalculos').style.display = 'none';      
  resetarModuloParcelas()   
}

function limparoperacao(){
    document.getElementById('troco').value = '0.00'
    document.getElementById('total-geral').innerText = '0.00';
    document.getElementById('dinheiro').value = ''
    document.getElementById('cartaoDebito').value = ''
    document.getElementById('cartaoCredito').value = ''
    document.getElementById('falta').value = '0.00';  
    document.getElementById('desconto').value = ''
    document.getElementById('acrescimo').value = ''
    document.getElementById('subtotal').textContent = '0.00';
    document.getElementById('dcto').textContent = '0.00';
    document.getElementById('acres').textContent = '0.00';
    document.getElementById('formPainel').style.display = 'none';   
    document.getElementById('formCalculos').style.display = 'none';      
    document.getElementById('btnCancelar').style.display = 'inline-block';                
}

function reiniciarModulo() {
  document.getElementById('formListaReceberCliente').style.display = 'none';
  document.getElementById('formPresenta').style.display = 'block';   
  document.getElementById('nomeClienteSelecionado').textContent = '';
  document.getElementById('paginacaoParcelas').innerHTML = '';
  paginaAtualParcelas = 1;
  parcelasSelecionadas = [];
  listaParcelasFiltradas = [];
  document.getElementById('btnReCli').click();
}

function resetarModuloParcelas() {
  resetarVariaveisGlobais();
  resetarUI();  
  const btn = document.getElementById('btnReCli');
  if (btn) {
  btn.click();
  }
  console.log('🔁 Módulo de parcelas reiniciado com sucesso.');
}

function resetarVariaveisGlobais() {  
  paginaAtualParcelas = 1;
  registrosPorPaginaParcelas = 11;
  listaParcelasFiltradas = [];
  parcelasSelecionadas.clear();
  valorTotalSelecionado = 0;
  valorTotalCli = 0;
  subtotalSelecionado = 0;
  valorTotalSelCl = 0;
  totali = 0;
  swti = 0;
  totalGeral = 0;
  dinheirov = 0;
  descontov = 0;
  acrescimov = 0;
  subtotalv = 0;  
  if (parcelasSelecionadas instanceof Map) {
    parcelasSelecionadas.clear();
  }
}

function resetarUI() {  
  limparoperacao();
  removerPaginacaoParcelas();  
  document.getElementById('formListaReceberCliente').style.display = 'none';
  document.getElementById('formPresenta').style.display = 'block';  
  document.getElementById('btnPagarParcelas').style.display = 'none';  
  document.getElementById('totalSelecionadas').innerText = "TOTAL DE SELECIONADAS: R$ 0.00";  
  const checkTodos = document.getElementById('checkTodos');
  if (checkTodos) checkTodos.checked = false;
}