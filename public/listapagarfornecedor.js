let paginaAtualParcelasF = 1;
let registrosPorPaginaParcelasF = 11;
let listaParcelasFiltradasF = [];
let valorTotalSelecionadoF = 0;
let valorTotalF = 0;
let = totalGeral = 0;

function carregarFornecedorFiltro() {
  limparNome();
  document.getElementById('formPresenta').style.display = 'none';
  document.getElementById('formListaPagarFornecedor').style.display = 'block';
  document.getElementById('formPainel').style.display = 'none';         
  document.getElementById('selectForFiltro').style.display = 'block';  
  document.getElementById('btnPagarParcelasFornecedor').style.display = 'block';
  document.getElementById('btnFinalizarFc').style.display = 'none';           
  document.getElementById('btnFinalizarOs').style.display = 'none';             
  document.getElementById('btnFinalizarOsOs').style.display = 'none';             
  document.getElementById('btnCancelaros').style.display = 'none';               
  RestauraLabel()
  tornarDescontoEAcrescimoSomenteLeitura(false)      
  document.getElementById('btnFinalizarOs').style.display = 'none';
}

function verParcelasDoFornecedor() {  
  swti=1  
  valorTotalSelecionadoF = 0;
  paginaAtualParcelasF = 1;
  removerPaginacaoParcelasF();
  const controleFornecedor = controleFornecedorSelecionadoP;
  if (!controleFornecedor) {    
    result = "Selecione um fornecedor!";  
    showToast(result, 2500);    
    return;
  }
  fetch('/pagar')
    .then(res => res.json())
    .then(pagar => {
      listaParcelasFiltradasF = pagar.filter(p =>
        String(p.fornecedor_id) === String(controleFornecedor) && p.status === 'ABERTO'
      );
      const tbody = document.querySelector('#tabelaPagarFornecedor tbody');
      if (listaParcelasFiltradasF.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="14" style="text-align: center;">
              Nenhuma parcela encontrada para o fornecedor selecionado.
            </td>
          </tr>`;
        document.getElementById('btnPagarParcelasFornecedor').style.display = 'none';
        return;
      }
      document.getElementById('btnPagarParcelasFornecedor').style.display = 'block';
      paginaAtualParcelasF = 1;
      renderizarTabelaFornecedorComPaginacao();
      const btnPagar = document.getElementById('btnPagarParcelasFornecedor');
      if (btnPagar) {
        btnPagar.onclick = () => {
          const selecionadas = document.querySelectorAll('.checkParcelaF:checked');
          if (selecionadas.length === 0) {
            return showToast("Selecione ao menos uma parcela!", 2500);
          }
          pagarParcelasFornecedor();
        };
      }
    })
    .catch(err => {
      console.error('Erro ao buscar parcelas:', err);
      alert('Erro ao buscar parcelas: ' + err.message);
    });
}
const parcelasSelecionadasF = new Map();

function renderizarTabelaFornecedorComPaginacao() {
  const tabela = document.getElementById('tabelaPagarFornecedor');
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';
  const inicio = (paginaAtualParcelasF - 1) * registrosPorPaginaParcelasF;
  const fim = inicio + registrosPorPaginaParcelasF;
  const parcelasPagina = listaParcelasFiltradasF.slice(inicio, fim);
  let totalAberto = 0;
  parcelasPagina.forEach(p => {
    const valorOriginal = parseFloat(p.valororiginal) || 0;
    const valorPago = parseFloat(p.valorpago) || 0;
    const multa = parseFloat(p.multa) || 0;
    const juros = parseFloat(p.juros) || 0;
    const valorAberto = valorOriginal + multa + juros - valorPago;
    totalAberto += valorAberto;
    const controle = String(p.controle);
    const checked = parcelasSelecionadasF.has(controle) ? 'checked' : '';
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td style="border:1px solid #ccc;text-align: center;"><input type="checkbox" class="checkParcelaF" value="${controle}" data-valor="${valorAberto.toFixed(2)}" ${checked}></td>
      <td style="border:1px solid #ccc;text-align: center;">${p.controle}</td>
      <td style="border:1px solid #ccc;">${p.funcionario}</td>
      <td style="border:1px solid #ccc;">${p.nomefornecedor}</td>
      <td style="border:1px solid #ccc;text-align: right;">R$ ${valorOriginal.toFixed(2)}</td>
      <td style="border:1px solid #ccc;text-align: right;">R$ ${valorPago.toFixed(2)}</td>
      <td style="border:1px solid #ccc;text-align: center;">${p.numeroparcela}</td>
      <td style="border:1px solid #ccc;text-align: center;">${p.totalparcelas}</td>
      <td style="border:1px solid #ccc;text-align: center;">${formatarDataBRL(p.datacadastro)}</td>
      <td style="border:1px solid #ccc;text-align: center;">${formatarDataBRL(p.datavencimento)}</td>      
      <td style="border:1px solid #ccc;text-align: right;">R$ ${multa.toFixed(2)}</td>
      <td style="border:1px solid #ccc;text-align: right;">R$ ${juros.toFixed(2)}</td>
      <td style="border:1px solid #ccc;text-align: center;">${p.status}</td>
      <td><button class="btnExcluirPag1" data-controle="${controle}">🗑️</button></td>
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
      <td colspan="14" style="text-align: right; font-weight: bold;" id="totalSelecionadasF">
        TOTAL DE SELECIONADAS: R$ ${valorTotalSelecionadoF.toFixed(2)}
      </td>
    </tr>
  `;
  configurarBotoesExcluirPagarF()
  atualizarTotalSelecionadasF();
  document.querySelectorAll('.checkParcelaF').forEach(cb =>
    cb.addEventListener('change', atualizarTotalSelecionadasF)
  );
  const checkTodosF = document.getElementById('checkTodos1');
  if (checkTodosF) {
    checkTodosF.checked = false;
    checkTodosF.onchange = () => {
      document.querySelectorAll('.checkParcelaF').forEach(cb => {
        cb.checked = checkTodosF.checked;
      });
      atualizarTotalSelecionadasF();
    };
  }
  renderizarControlesPaginacaoF();
}

function configurarBotoesExcluirPagarF() {
  document.querySelectorAll('.btnExcluirPag1').forEach(botao => {
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

    // Garante centralização no td
    const pai = botao.parentElement;
    if (pai) {
      pai.style.textAlign = 'center';
    }

    botao.removeEventListener('click', botao._handlerExcluir);
    const handler = () => removerPagarC(controle);
    botao.addEventListener('click', handler);
    botao._handlerExcluir = handler;
  });
}

function atualizarTotalSelecionadasF() {
  
  document.querySelectorAll('.checkParcelaF').forEach(cb => {
    const controle = cb.value;
    const valor = parseFloat(cb.getAttribute('data-valor') || 0);

    if (cb.checked) {
      parcelasSelecionadasF.set(controle, valor);
    } else {
      parcelasSelecionadasF.delete(controle);
    }
  });

  let total = 0;
  parcelasSelecionadasF.forEach(v => total += v);
  valorTotalSelecionadoF = total;
  valorTotalF = valorTotalSelecionadoF

  document.getElementById('totalSelecionadasF').innerText =
    `TOTAL DE SELECIONADAS: R$ ${total.toFixed(2)}`;
}

function renderizarControlesPaginacaoF() {
  let container = document.getElementById('paginacaoParcelasF');

  if (!container) {
    container = document.createElement('div');
    container.id = 'paginacaoParcelasF';
    container.style = 'margin-top: 10px; display: flex; justify-content: center; flex-wrap: wrap; gap: 6px;';
    document.getElementById('formListaPagarFornecedor').appendChild(container);
  } else {
    container.innerHTML = '';
  }

  const totalPaginas = Math.ceil(listaParcelasFiltradasF.length / registrosPorPaginaParcelasF);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.style = `
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background-color: ${i === paginaAtualParcelasF ? '#f1ab13' : '#e0e0e0'};
      color: ${i === paginaAtualParcelasF ? 'white' : 'black'};
    `;
    btn.onclick = () => {
      paginaAtualParcelasF = i;
      renderizarTabelaFornecedorComPaginacao();
    };
    container.appendChild(btn);
  }
}

function removerPaginacaoParcelasF() {
  const container = document.getElementById('paginacaoParcelasF');
  if (container) container.remove();
}

function pagarParcelasFornecedor(controle) 
   {    
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
        FinalizarOperacaoF();                
      };        
      
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
  
 async function pagarParcelasSelecionadasF() {
  const controleFornecedor = controleFornecedorSelecionadoP;

  if (!controleFornecedor) {
    return showToast("Selecione um Fornecedor!", 2500);
  }

  if (!parcelasSelecionadasF || parcelasSelecionadasF.size === 0) {
    showToast("Selecione ao menos uma parcela!", 2500);
    document.getElementById('btnPagarParcelasFornecedor').style.display = 'block';
    return;
  }

  const parcelasIds = Array.from(parcelasSelecionadasF.keys());
  const valorAbono = Array.from(parcelasSelecionadasF.values())
    .reduce((total, valor) => total + valor, 0);

  try {
    const response = await fetch(`/${controleFornecedor}/pagarparcelas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parcelasIds, valorAbono })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return showToast(`Erro: ${data.error || 'Falha ao processar pagamento'}`, 2500);
    }

    showToast("Parcelas pagas com sucesso!", 2500);
    
    parcelasSelecionadasF.clear();
    valorTotalSelecionadoFornecedor = 0;
    subtotalFornecedorSelecionado = 0;
    verParcelasDoFornecedor();

  } catch (err) {
    console.error('Erro ao pagar parcelas:', err);
    alert('Erro ao processar pagamento.');
  }
}
        
}

async function pagarParcelasSelecionadasF() {
  const controleFornecedor = controleFornecedorSelecionadoP;

  if (!controleFornecedor) {
    return showToast("Selecione um Fornecedor!", 2500);
  }

  if (!parcelasSelecionadasF || parcelasSelecionadasF.size === 0) {
    showToast("Selecione ao menos uma parcela!", 2500);
    document.getElementById('btnPagarParcelasFornecedor').style.display = 'block';
    return;
  }

  const parcelasIds = Array.from(parcelasSelecionadasF.keys());
  const valorAbono = Array.from(parcelasSelecionadasF.values())
    .reduce((total, valor) => total + valor, 0);

  try {
    const response = await fetch(`/${controleFornecedor}/pagarparcelas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parcelasIds, valorAbono })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return showToast(`Erro: ${data.error || 'Falha ao processar pagamento'}`, 2500);
    }

    showToast("Parcelas pagas com sucesso!", 2500);

    // Resetar seleção e valores
    parcelasSelecionadasF.clear();
    valorTotalSelecionadoFornecedor = 0;
    subtotalFornecedorSelecionado = 0;

    verParcelasDoFornecedor();

  } catch (err) {
    console.error('Erro ao pagar parcelas:', err);
    alert('Erro ao processar pagamento.');
  }
}


async function salvarLancamentosCaixaPagar() {
  const cod_funcionario = codfuncionaPagar;
  const funcionario = funcionarioSelecionadoPagar;
  const cod_fornecedor = controleFornecedorSelecionadoP || 1;
  const fornecedor = nomeFornecedorSelecionadoP;
  const descricaoBase = 'Pagamento de Parcelas';
  const datacadastro = new Date().toISOString().slice(0, 10);
  const valorDinheiro1 = arredondarF(totalGeral)
  const debitoInput = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  const dinInput = parseFloat(document.getElementById('dinheiro').value) || 0;  
  const creditoInput = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  let especies = [];
  if (dinInput > 0) especies.push("Dinheiro");
  if (debitoInput > 0) especies.push("Cartão Débito");
  if (creditoInput > 0) especies.push("Crédito à Vista");
  especies = especies.join(" + ") || "Nenhuma forma de pagamento selecionada";        
  
  if (typeof valorDinheiro1 !== 'number' || isNaN(valorDinheiro1) || valorDinheiro1 <= 0) {
    alert('dsfsdfsdfsdfdsaaaaa')
    alert('Informe um valor válido em dinheiro.');
    return;
  }  

  const movimentos = [{
    cod_cliente: null,
    cliente: '',
    cod_funcionario,
    funcionario,
    cod_fornecedor,
    fornecedor,
    descricao: `${descricaoBase}`,
    datacadastro,
    especies: especies,
    valorentrada: 0,
    valorsaida: valorDinheiro1
  }];

  for (const movimento of movimentos) {
    try {
      const res = await fetch('/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movimento)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erro ao salvar movimento:', errorText);
      } else {
        console.log('Movimentação salva com sucesso:', movimento.especies);
        limparoperacao();         
        removerPaginacaoParcelasF()        
      }
    } catch (err) {
      console.error('Erro de rede ao enviar movimentação:', err);
    }
  }
}

  function removerPagarC(controle) {    
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
      texto.textContent = 'Deseja realmente excluir essa Parcela?';
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
    
        fetch(`/pagar/${controle}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error();
            result = "Parcela removida com sucesso!";  
            showToast(result, 2500);                                                             
            resultado.style.color = "green";                
            resultado.style.display = "block";  
            esperar();         
            limparNome();
            document.getElementById('formPresenta').style.display = 'none'; 
            document.getElementById('formListaPagarFornecedor').style.display = 'none';
            document.getElementById('btnPagFor').click();                        
            document.getElementById('btnReCliPagar').click();            
          })
          .catch()  ;
      };        
      
      btnCancelar.onclick = () => {
        document.body.removeChild(modal);
      };
  } 

function limparFormularioPagarFornecedor() {
  window.scrollTo(0, 0);
  const tabela = document.getElementById('tabelaPagarFornecedor');
  const tbody = tabela.querySelector('tbody');
  document.getElementById('btnPagarParcelasFornecedor').style.display = 'none';    
  if (tbody) tbody.innerHTML = '';  
  const checkTodos = document.getElementById('checkTodosPagar');
  if (checkTodos) checkTodos.checked = false;
  
  ValorTotalAberto1 = 0;
  const linhaTotal = document.createElement('tr');
  linhaTotal.innerHTML = `
    <td colspan="14" style="text-align: right; font-weight: bold;">
      TOTAL EM ABERTO: R$ 0.00
    </td>
  `;
  tbody.appendChild(linhaTotal);
  const linhaSelecionadas = document.createElement('tr');
  linhaSelecionadas.innerHTML = `
    <td colspan="14" style="text-align: right; font-weight: bold;" id="totalSelecionadas">
      TOTAL DE SELECIONADAS: R$ 0.00
    </td>
  `;
  tbody.appendChild(linhaSelecionadas);  
 const selectFornecedor = document.getElementById('selectForFiltro');
  if (selectFornecedor) selectFornecedor.value = '';  
  const selectFuncionario = document.getElementById('selectFuncionarioPagar');
  if (selectFuncionario) selectFuncionario.value = '';
}


function FinalizarOperacaoF() {    
  window.scrollTo(0, 0);
  limparcalculos();
  document.getElementById('formPainel').style.display = 'block';   
  document.getElementById('formCalculos').style.display = 'block';      
  document.getElementById("dinheiro").focus(); 
  document.getElementById('cartaoCredito').style.display = 'block';
  document.getElementById('btnCancelar').style.display = 'none';      
  document.getElementById('btnFinalizar').style.display = 'none';    
  document.getElementById('btnFinalizarFc').style.display = 'none';               
  document.getElementById('btnFinalizar').style.display = 'none';               
  document.getElementById('btnFinalizarFi').style.display = 'inline-block';               
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
  CalcularDescAcresF();  
}

function CalcularDescAcresF() {
  desabilitarControles(false)
  const subtotal1 = valorTotalSelecionadoF;  
  const descInput = parseFloat(document.getElementById('desconto').value) || 0;
  const acresInput = parseFloat(document.getElementById('acrescimo').value) || 0;
  const descPorcento = document.getElementById('descontoPorcentagem').checked;
  const acresPorcento = document.getElementById('acrescimoPorcentagem').checked;
  const desconto = descPorcento ? (subtotal1 * descInput / 100) : descInput;  
  const acrescimo = acresPorcento ? (subtotal1 * acresInput / 100) : acresInput;  
  totalGeral = valorTotalSelecionadoF - desconto + acrescimo;
  document.getElementById('total-geral').innerText = totalGeral.toFixed(2);  
  descontov = desconto;
  acrescimov = acrescimo;
  subtotalv = subtotal1;
  if ((descPorcento && descInput > 99) || totalGeral <= 0) {
    showToast('Desconto inválido: excede 99% ou resulta em total zerado.', 2500);
    document.getElementById('desconto').value = '';
    document.getElementById('acrescimo').value = '';
    CalcularDescAcresF();
    return;
  }
  document.getElementById('subtotal').innerText = subtotal1.toFixed(2);
  document.getElementById('dcto').innerText = desconto.toFixed(2);
  document.getElementById('acres').innerText = acrescimo.toFixed(2);
  document.getElementById('total-geral').innerText = totalGeral.toFixed(2);
  document.getElementById('falta').value = totalGeral.toFixed(2);  
}

function arredondarF(valor) {
  return Number(valor.toFixed(2));
}

function calcularOperacaoF() {
  const dinheiroInput = parseFloat(document.getElementById('dinheiro').value) || 0;
  const debitoInput = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  const cartaoCredito = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  const total = arredondarF(totalGeral);  
  const dinheiro = arredondarF(dinheiroInput);
  const debito = arredondarF(debitoInput);
  const credito = arredondarF(cartaoCredito);
  const totalPago = arredondarF(dinheiro + debito + credito);
  dinheirov = dinheiro;
  const faltaEl = document.getElementById('falta');
  const trocoEl = document.getElementById('troco');  

  let desabilitar = dinheiro >= total && debito==0 && credito==0;  
    document.getElementById('cartaoDebito').disabled  = desabilitar;
    document.getElementById('cartaoCredito').disabled  = desabilitar;

  if (totalPago < total) {
    const falta = arredondarF(total - totalPago);
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

const camposPagamento1F = ['dinheiro', 'cartaoDebito', 'cartaoCredito'];

camposPagamento1F.forEach(id => {
  const campo1F = document.getElementById(id);
  if (campo1F) {
    campo1F.addEventListener('blur', () => {
      if (swti === 1) {
        calcularOperacaoF();
      }
      console.log(`Campo ${id} perdeu o foco!`);
    });

    campo1F.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        if (swti === 1) {
          calcularOperacaoF();
        }
        console.log(`Campo ${id} acionado com Enter!`);
 
        const index = camposPagamento1F.indexOf(id);
        const proximoCampo1 = document.getElementById(camposPagamento1F[index + 1]);
        if (proximoCampo1) {
          proximoCampo1.focus();
        }
      }
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const botaoFinalizarFi = document.getElementById('btnFinalizarFi');

  if (botaoFinalizarFi) {
    botaoFinalizarFi.addEventListener('click', () => {
      console.log('✅ Clique detectado no botão Finalizar FI');
      FinalOperacaoF(); 
    });
  } else {
    console.error('❌ Botão com id="btnFinalizarFi" não encontrado.');
  }
});

  function FinalOperacaoF() {  
  const dinheiro = arredondarF(parseFloat(document.getElementById('dinheiro').value) || 0);
  const debito = arredondarF(parseFloat(document.getElementById('cartaoDebito').value) || 0);
  const cartaoCredito = arredondarF(parseFloat(document.getElementById('cartaoCredito').value) || 0);
  const total = arredondarF(totalGeral);
  const totalPago = arredondarF(dinheiro + debito + cartaoCredito);
  dinheirov = dinheiro;
  const faltaEl = document.getElementById('falta');
  const trocoEl = document.getElementById('troco');
  if (totalPago < total) {
    const falta = arredondarF(total - totalPago);
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

  if (totalPago > total) {
    const troco = arredondar(totalPago - total);    
    document.getElementById('troco').value = troco.toFixed(2);
    document.getElementById('falta').value = "0.00";          
  }  
  
  result = "Pacelas quitadas com sucesso!";  
  showToast(result, 2500);    
  pagarParcelasSelecionadasF()
  salvarLancamentosCaixaPagar()        
  document.getElementById('paginacaoParcelasF').innerHTML = '';  
  document.getElementById('formPainel').style.display = 'none';   
  document.getElementById('formCalculos').style.display = 'none';    
  resetarModuloParcelasf()  
}

function removerPaginacaoParcelasF() {
  const container = document.getElementById('paginacaoParcelasF');
  if (container) {
    container.remove(); 
  }
}

function resetarModuloParcelasf() {
  resetarVariaveisGlobaisf();
  resetarInterfaceUsuariof();  
  console.log('🔁 Módulo de parcelas reiniciado com sucesso.');
}

function resetarVariaveisGlobaisf() {
  paginaAtualParcelas = 1;
  registrosPorPaginaParcelas = 11;
  listaParcelasFiltradas = [];

  if (parcelasSelecionadas instanceof Map) {
    parcelasSelecionadas.clear();
  } else {
    parcelasSelecionadas = [];
  }

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
}

function resetarInterfaceUsuariof() {
  limparoperacao();
  removerPaginacaoParcelas(); 
  atualizarExibicaof('formPresenta', false);    
  atualizarTexto('paginacaoParcelas', '', false);
  atualizarExibicaof('btnPagarParcelas', false);
  atualizarTexto('totalSelecionadas', "TOTAL DE SELECIONADAS: R$ 0.00");

  const checkTodos = document.getElementById('checkTodos');
  if (checkTodos) checkTodos.checked = false;
}

function atualizarTexto(id, texto, limparHTML = false) {
  const el = document.getElementById(id);
  if (el) {
    if (limparHTML) {
      el.innerHTML = texto;
    } else {
      el.textContent = texto;
    }
  }
}

function atualizarExibicaof(id, mostrar) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = mostrar ? 'block' : 'none';
  }
}