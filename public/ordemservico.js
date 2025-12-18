let vendasos = [];    
let totalGeralOs = 0, totalGeralItensOs = 0, totalGeralServOs = 0, descontoos = 0, nos, tiposer = '', contserv = 0     
let acrescimoos = 0, adiantamentoos =0, montodeb = 0, montocred = 0, subTotalOs=0, trocoos = 0, totalx = 0;   
function cadordemos() {
  window.scrollTo(0, 0);
  vendasos = [];  
  contserv = 0
  swtoss = 1
  limparNome();      
  limparCamposOs()
  carregarFuncionariosos();
  carregarClientesos();
  carregarFuncionariosTecMec();
  carregarStatus();
  tornarDescontoEAcrescimoSomenteLeitura(true)
  bloquearCamposOS(false)  
  habilitarcontrolesOs()
  swti = 5
  fetch('/ordemServico/max')
  .then(res => res.json())
  .then(data => {    
    let maxId = data.maxId;    
    let proximoId = (maxId !== null) ? maxId + 1 : 1;        
    document.getElementById('controleod').value = proximoId;    
    nos = proximoId;
  })
  .catch(err => {
    console.error('Erro ao buscar controle máximo:', err);
    alert('Erro ao buscar controle máximo');
  });   
  nos = document.getElementById('controleod').value

  const form = document.getElementById('form-ordens');
  if (!form) return;
  form.onsubmit = handleFormSubmite;

  async function handleFormSubmite(e) {
    e.preventDefault();

    if(!tipoos)
    {
      showToastl("⚠️Deve selecionar um objeto/veículo na Ordem de Serviço para continuar", 2500);       
      document.getElementById("entraos").value = ''
      document.getElementById("objetosos").focus()
      return
    }

    const entrada = e.target.entraos.value.trim();        
    let quantidade, controle;    

    if (entrada.includes('*')) {    
      const [quantidadeStr, controleStr] = entrada.split('*');       
      quantidade = parseFloat(quantidadeStr.trim().replace(',', '.'));             

      if (!/^\d+$/.test(controleStr.trim())) {                     
        showToast("⚠️Entrada inválida. Exemplo: 2*1234", 2500);       
        document.getElementById("entraos").value = "";               
        return;
      }

      controle = parseInt(controleStr.trim(), 10);    
      await handleEntradaOs(controle, quantidade);
    } else {    
      quantidade = 1;
      if (!/^\d+$/.test(entrada.trim())) {        
        showToast("⚠️Entrada inválida. Exemplo: 1234", 2500);            
        document.getElementById("entraos").value = "";                         
        return;
      }
      controle = parseInt(entrada.trim(), 10);    
      await handleEntradaOs(controle, quantidade);
    }

    if (isNaN(quantidade) || isNaN(controle) || quantidade <= 0) {
      showToast("⚠️Entrada inválida. Exemplo: 2*1234 ou 1234", 2500);       
      document.getElementById("entraos").value = "";    
      return;
    }
  }
  
  async function buscarProdutoPorControleOs(controle) {
    try {
      const res = await fetch(`/produtos/controleos/${controle}`);    
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("Erro ao buscar produto:", err);
      return null;
    }
  }

  async function handleEntradaOs(valor, quantidade = 1) {  
    const produto = await buscarProdutoPorControleOs(valor);

    if (!produto) {
      showToast("⚠️Produto inexistente ou desativado!", 2500);
      document.getElementById("entraos").value = "";
      return;
    }
    
    if (!Number.isInteger(quantidade) && produto.fracionado !== 'SIM') {
      if(produto.aplicacao=='PRODUTOS')
      {
      showToast(`🚫 Produto "${produto.produto}" não permite quantidade fracionada!`, 2500);
      document.getElementById("entraos").value = "";
      }
      else
      {
      showToast(`🚫 Nenhum serviço não podem ser fracionado!`, 2500);
      document.getElementById("entraos").value = "";
      }
      return;
    }

    if (!verificarEstoqueOs(produto, quantidade)) {
      showToast("⚠️ Estoque insuficiente!\nDisponível: " + produto.quantidade.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),  2500);
      document.getElementById("entraos").value = "";
      return;
    }

  const aplicaca = (produto.aplicacao || '').toUpperCase(); 
  if (aplicaca === 'PRODUTOS') {        
    const estoqueAtualizado = await diminuirEstoqueOs(produto.controle, quantidade);
    if (!estoqueAtualizado) {
      showToast("❌ Erro ao atualizar estoque!", 2500);
      document.getElementById("entraos").value = "";
      return;
    }  
  }
    adicionarItemVendaOs(produto, quantidade);
    atualizarTabelaOs();  
    document.getElementById("entraos").value = "";
    document.getElementById("entraos").focus();
  }

  function verificarEstoqueOs(produto, quantidade) {
  if (!produto) return false;
  const aplicacao = (produto.aplicacao || '').toUpperCase();
  tiposer = aplicacao
  const estoqueAtual = Number(produto.quantidade) || 0;
  const qtd = Number(quantidade) || 0;
  if (aplicacao === 'PRODUTOS') {    
    return estoqueAtual >= qtd;
  } else {    
    return estoqueAtual <= qtd;
  }
}

  async function diminuirEstoqueOs(controle, quantidade) {    
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
  
  function adicionarItemVendaOs(produto, quantidade) {
    const total = produto.precovenda * quantidade;
    const aplica = produto.aplicacao
    if (aplica === 'PRODUTOS') {    
      totalGeralItensOs+= total    
  } else {   
      totalGeralServOs+= total       
      contserv++;
  } 
    totalGeralOs += total
    document.getElementById('selectClienteos').disabled = true;
    document.getElementById('selectObjetos').disabled = true;
    document.getElementById('totalgeralos').value = totalGeralOs.toFixed(2);
    document.getElementById('totitemos').value = totalGeralItensOs.toFixed(2);
    document.getElementById('totservos').value = totalGeralServOs.toFixed(2);      
    const selectFunc = document.getElementById('selectFuncionarioos');
    const funcionarioSelecionado = selectFunc?.options[selectFunc.selectedIndex]?.text || 'FUNCIONÁRIO PADRÃO';

    vendasos.push({    
      controle: produto.controle,
      produto: produto.produto,    
      precovenda: produto.precovenda,
      quantidade,
      total,
      codFuncionarioTecMec,
      funcionarioSelecionadoTecMec,
      tipo: produto.aplicacao
    });
  }

  function atualizarTabelaOs() {
    const tbody = document.getElementById('tabela-vendaos');
    if (!tbody) return;
    tbody.innerHTML = '';

    totalGeralOs = 0;
    let subtotalOs = 0;

    vendasos.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:left;">${item.produto}</td>              
        <td style="text-align:right;">R$ ${item.precovenda.toFixed(2)}</td>
        <td style="text-align:center;">${item.quantidade.toFixed(2)}</td>
        <td style="text-align:right;">R$ ${item.total.toFixed(2)}</td>
        <td style="text-align:center;">${item.codFuncionarioTecMec}</td>              
        <td style="text-align:left;">${item.funcionarioSelecionadoTecMec}</td>      
        <td style="text-align:center;">
          <button class="btn-apagaros" style="background-color:blue; color:white; border:none; padding:4px 8px; cursor:pointer;">🗑️</button>
        </td>
      `;

      const botao = tr.querySelector('.btn-apagaros');
      botao.addEventListener('click', async () => {        
        if(item.tipo=='PRODUTOS')
        {
          await reverterItemEstoqueOs(item);
        }     
        else
        {
          if(contserv>0)
          {
            contserv--
          }
        }
        vendasos.splice(index, 1);
        limparcalculos();
        if (vendasos.length == 0) {
          document.getElementById('totalgeralos').value = '0,00';
          desabilitarControles(true);
          controlarBotoesMenu(true);
        }
        atualizarTabelaOs();
      });

      tbody.appendChild(tr);
      subtotalOs += item.total;
      totalGeralOs = subtotalOs
      document.getElementById('totalgeralos').value = totalGeralOs.toFixed(2);
    });
  }
}   

function recalcularTotalOs() {
  const totalBase = parseFloat(totalGeralOs) || 0;
  const descontoInput = document.getElementById('descos');
  const acrescimoInput = document.getElementById('ascos');
  const adiantamentoInput = document.getElementById('adiantamento');
  const totalGeralInput = document.getElementById('totalgeralos');  
   
  let desconto = parseFloat(descontoInput.value) || 0;
  let acrescimo = parseFloat(acrescimoInput.value) || 0;
  let adiantamentos = parseFloat(adiantamentoInput.value) || 0;
  descontoos = desconto
  acrescimoos = acrescimo  
  adiantamentoos = adiantamentos

  if (desconto >= totalBase) {    
    showToastl("⚠️ O desconto não pode ser maior que o total da Ordem de Serviço!", 2500);    
    totalGeralInput.value = totalBase.toFixed(2);    
    descontoInput.style.border = "2px solid red";    
    setTimeout(() => {
      descontoInput.value = '';
      descontoInput.style.border = '';
      const totalFinal = totalBase - 0 + acrescimo;
      totalGeralInput.value = totalFinal.toFixed(2);
    }, 2500);

    return;
  }    
  if (adiantamentos >= totalBase) {    
    showToastl("⚠️ O adiantamento não pode ser maior que o total da Ordem de Serviço!", 2500);    
    totalGeralInput.value = totalBase.toFixed(2);    
    adiantamentoInput.style.border = "2px solid red";    
    setTimeout(() => {
      adiantamentoInput.value = '';
      adiantamentoInput.style.border = '';
      const totalFinal = totalBase - 0 + acrescimo;
      totalGeralInput.value = totalFinal.toFixed(2);
    }, 2500);

    return;
  }    

  const totalFinal = totalBase - desconto - adiantamentos + acrescimo;
  subTotalOs = totalBase
  totalGeralInput.value = totalFinal.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
  const descontoEl = document.getElementById('descos');
  const acrescimoEl = document.getElementById('ascos');
  const adiantamentoEL = document.getElementById('adiantamento');

  if (descontoEl) descontoEl.addEventListener('input', recalcularTotalOs);
  if (acrescimoEl) acrescimoEl.addEventListener('input', recalcularTotalOs);
  if (adiantamentoEL) adiantamentoEL.addEventListener('input', recalcularTotalOs);
});


function cancelarOrdem()
{
  dialogCancelar();
}


function salvarOrdem()
{
  if(statusSelecionado=='FINALIZADA')
    {
        if(contserv<=0){
          showToastl("⚠️Não é posível finalizar a Ordem de Serviço sem serviços cadastrados", 2500);       
          document.getElementById("entraos").focus()          
          return
        }
        else{        
        salvarOrdemServicoFi()  
        pagarOrdemOs()        
        }        
    }
    else
    {
      salvarOrdemServico()     
    }
}

async function salvarOrdemServico() {  
  try {    
    if(!nomeclienos)
    {
      showToastl("⚠️Deve selecionar um cliente na Ordem de Serviço para continuar", 2500);             
      document.getElementById("selectClienteos").focus()      
      return
    }

    if(!tipoos)
    {
      showToastl("⚠️Deve selecionar um objeto/veículo na Ordem de Serviço para continuar", 2500);       
      document.getElementById("entraos").value = ''
      document.getElementById("objetosos").focus()      
      return
    }
    if (vendasos.length === 0) {
      showToastl("⚠️Impossível salvar a Ordem de Serviço sem itens", 2500);       
      document.getElementById("entraos").focus()      
      return;
    }    
    
    const numeroOS = document.getElementById("controleod").value.trim();
    const clienteId = document.getElementById("selectClienteos").value;
    const objetoVeiculoId = tobid;
    const funcionarioId = document.getElementById("selectFuncionarioos").value;
    const laudo = document.getElementById("laudo").value.trim();
    const descricao = document.getElementById("descricaoos").value.trim();
    const observacoes = document.getElementById("observa").value.trim();
    const formaPagamento = 'Dinheiro'
    const desconto = descontoos
    const acrescimo = acrescimoos
    const valorTotalItem = totalGeralItensOs
    const valorTotalServ = totalGeralServOs
    const valorTotal = totalGeralOs + acrescimoos - descontoos
    const adiantamento = adiantamentoos
    const ordemServico = {
      numeroOS,
      clienteId,
      objetoVeiculoId,
      funcionarioId,
      laudo,
      dataAbertura: new Date().toISOString(),
      status: statusSelecionado,
      descricao,
      observacoes,
      formaPagamento,
      desconto,
      acrescimo,
      valorTotalItem,
      valorTotalServ,
      valorTotal,
      adiantamento
    };
    
    const res = await fetch("/ordemServico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ordemServico)
    });

    if (!res.ok) throw new Error("Erro ao salvar Ordem de Serviço");
    const data = await res.json();
    const ordemServicoId = data.id; 
    
    for (const item of vendasos) {
      const itemOS = {
        ordemServicoId,
        produtoId: item.controle,
        descricao: item.produto,
        tipoItem: item.tipo,
        quantidade: item.quantidade,
        valorUnitario: item.precovenda,
        total: item.total,
        tecnico: item.funcionarioSelecionadoTecMec
      };

      const itemRes = await fetch("/itensOrdemServico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemOS)
      });

      if (!itemRes.ok) {
        throw new Error(`Erro ao salvar item: ${item.produto}`);
      }
    }

    showToast("✅ Ordem de Serviço salva com sucesso!", 2500);   
    if(statusSelecionado!='FINALIZADA') {
      limparCamposOs()
      limparNome()
      setTimeout(() => {
      location.reload();
      }, 1000);
    }
    
    
  } catch (err) {
    console.error("Erro ao salvar Ordem de Serviço:", err);
    showToast("❌ Erro ao salvar Ordem de Serviço!", 2500);
  }
}

async function salvarOrdemServicoFi() {  
  try {    
    if(!nomeclienos)
    {
      showToastl("⚠️Deve selecionar um cliente na Ordem de Serviço para continuar", 2500);             
      document.getElementById("selectClienteos").focus()      
      return
    }

    if(!tipoos)
    {
      showToastl("⚠️Deve selecionar um objeto/veículo na Ordem de Serviço para continuar", 2500);       
      document.getElementById("entraos").value = ''
      document.getElementById("objetosos").focus()      
      return
    }
    if (vendasos.length === 0) {
      showToastl("⚠️Impossível salvar a Ordem de Serviço sem itens", 2500);       
      document.getElementById("entraos").focus()      
      return;
    }    
    
    const numeroOS = document.getElementById("controleod").value.trim();
    const clienteId = document.getElementById("selectClienteos").value;
    const objetoVeiculoId = tobid;
    const funcionarioId = document.getElementById("selectFuncionarioos").value;
    const laudo = document.getElementById("laudo").value.trim();
    const descricao = document.getElementById("descricaoos").value.trim();
    const observacoes = document.getElementById("observa").value.trim();
    const formaPagamento = 'Dinheiro'
    const desconto = descontoos
    const acrescimo = acrescimoos
    const valorTotalItem = totalGeralItensOs
    const valorTotalServ = totalGeralServOs
    const valorTotal = totalGeralOs + acrescimoos - descontoos
    const adiantamento = adiantamentoos
    
    const ordemServico = {
      numeroOS,
      clienteId,
      objetoVeiculoId,
      funcionarioId,
      laudo,
      dataAbertura: new Date().toISOString(),
      status: statusSelecionado,
      descricao,
      observacoes,
      formaPagamento,
      desconto,
      acrescimo,
      valorTotalItem,
      valorTotalServ,
      valorTotal,
      adiantamento
    };
    
    const res = await fetch("/ordemServico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ordemServico)
    });

    if (!res.ok) throw new Error("Erro ao salvar Ordem de Serviço");
    const data = await res.json();
    const ordemServicoId = data.id; 
    
    for (const item of vendasos) {
      const itemOS = {
        ordemServicoId,
        produtoId: item.controle,
        descricao: item.produto,
        tipoItem: item.tipo,
        quantidade: item.quantidade,
        valorUnitario: item.precovenda,
        total: item.total,
        tecnico: item.funcionarioSelecionadoTecMec
      };

      const itemRes = await fetch("/itensOrdemServico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemOS)
      });

      if (!itemRes.ok) {
        throw new Error(`Erro ao salvar item: ${item.produto}`);
      }
    }

    showToast("✅ Ordem de Serviço salva com sucesso!", 2500);   
    if(statusSelecionado!='FINALIZADA') {
      limparCamposOs()
      limparNome()      
    }
    
    
  } catch (err) {
    console.error("Erro ao salvar Ordem de Serviço:", err);
    showToast("❌ Erro ao salvar Ordem de Serviço!", 2500);
  }
}

  function pagarOrdemOs() {
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
  texto.textContent = 'Deseja faturar essa Ordem de Serviço?';
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
    document.getElementById('btnCancelarOrdem').disabled = true;
    document.getElementById('btnSalvarOrdem').disabled = true; 
    bloquearCamposOS(true)
    FinalizarOperacaoOs();        
  };
  btnCancelar.onclick = () => {
    document.body.removeChild(modal);    
    limparCamposOs()
    limparNome()
  };
}

function dialogCancelar() {
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
  texto.textContent = 'Deseja cancelar a edicão da OS?';
  texto.style.marginBottom = '15px';
  const btnSim = document.createElement('button');
  btnSim.textContent = 'Sim';
  btnSim.style.cssText = `
    margin-right: 10px; padding: 8px 16px;
    background-color: #dc3545; color: white;
    border: none; border-radius: 5px; cursor: pointer;
  `;
  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = 'Não';
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
    limparCamposOs()
    limparNome()
  };
  btnCancelar.onclick = () => {
    document.body.removeChild(modal);
    
  };
}

function limparCamposOs() {
  
  const container = document.getElementById('form-ordens')?.parentElement || document;  
  container.querySelectorAll('input').forEach(input => {
    if (!['button', 'submit', 'reset', 'hidden'].includes(input.type)) {
      input.value = '';
    }
  });  
  container.querySelectorAll('select').forEach(select => {
    select.selectedIndex = 0;
  });  
  
  container.querySelectorAll('textarea').forEach(textarea => {
    textarea.value = '';
  });
  
  const tabelaVenda = document.getElementById('tabela-vendaos');
  if (tabelaVenda) tabelaVenda.innerHTML = '';

  const titulo = document.getElementById('tituloos');
  if (titulo) titulo.textContent = 'Ordem de Serviço';

  const primeiroCampo = container.querySelector('input, select, textarea');
  if (primeiroCampo) primeiroCampo.focus();

  console.log('✅ Todos os campos da OS foram limpos com sucesso.');
}

function FinalizarOperacaoOs() {  
  window.scrollTo(0, 0);
  limparcalculos();
  desabilitarControles(false)  
  document.getElementById('formPainel').style.display = 'block';   
  document.getElementById('formCalculos').style.display = 'block';      
  document.getElementById("dinheiro").focus(); 
  document.getElementById('cartaoCredito').style.display = 'block';  
  document.querySelector('label[for="cartaoCredito"]').style.display = 'block';
  document.getElementById('parceladoCredito').parentElement.style.display = 'none'; 
  document.getElementById('descontoPorcentagem').style.display = 'none';
  document.getElementById('acrescimoPorcentagem').style.display = 'none';
  document.getElementById('descontoPorcentagem').parentElement.innerHTML = `
  <input type="checkbox" id="descontoPorcentagem" style="display:none;"> R$
`;
document.getElementById('acrescimoPorcentagem').parentElement.innerHTML = `
  <input type="checkbox" id="acrescimoPorcentagem" style="display:none;"> R$
`;
  
  totalx = parseFloat(document.getElementById('totalgeralos').value || 0).toFixed(2);  
  document.getElementById('subtotal').innerText = subTotalOs.toFixed(2);           
  document.getElementById('desconto').value = descontoos.toFixed(2);;
  document.getElementById('acrescimo').value = acrescimoos.toFixed(2);; 
  if (adiantamentoos > 0) {
    const campo = document.getElementById('dinheiro');
    campo.value = adiantamentoos.toFixed(2);    
    const eventEnter = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
    });
    campo.dispatchEvent(eventEnter);
}
  document.getElementById('dcto').innerText = descontoos.toFixed(2);
  document.getElementById('acres').innerText = acrescimoos.toFixed(2);     
  document.getElementById('total-geral').innerText = totalx;  
}

function calcularOperacaoOs() {  
  const dinheiroInput = parseFloat(document.getElementById('dinheiro').value) || 0;
  const debitoInput = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  const creditoInput = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  const total = totalx; 
  let dinheiro = arredondar(dinheiroInput);
  const debito = arredondar(debitoInput);
  const credito = arredondar(creditoInput);
  montocred = creditoInput
  montodeb = debitoInput 

  if(adiantamentoos>0 && dinheiro<adiantamentoos){
    showToast(`O monto do dinhiero não pode ser menor que o adiantamento. Adiantamento: R$ ${adiantamentoos.toFixed(2)}`,
      2000
    );
    document.getElementById('dinheiro').value = adiantamentoos.toFixed(2); 
    document.getElementById('dinheiro').focus()
    return;
  }
  
  if (adiantamentoos > 0 && dinheiro >= adiantamentoos){
    dinheiro = dinheiro - adiantamentoos   
  }
  
  const totalPago = arredondar(dinheiro + debito + credito);
  dinheirov = dinheiro; 
  const desabilitar = dinheiro >= total && debito === 0 && credito === 0;
  document.getElementById('cartaoDebito').disabled = desabilitar;
  document.getElementById('cartaoCredito').disabled = desabilitar;
  const faltaEl = document.getElementById('falta');
  const trocoEl = document.getElementById('troco');  

  if (totalPago < total) {
    const falta = arredondar(total - totalPago);
    faltaEl.value = falta.toFixed(2);
    trocoEl.value = "0.00";
    showToast(
      `O valor total não é suficiente. Verifique os pagamentos. Total: R$ ${total} | Pago: R$ ${totalPago.toFixed(2)}`,
      2000
    );    
    return;
  }

  if (totalPago > total && dinheiro === 0) {
    faltaEl.value = "0.00";
    trocoEl.value = "0.00";
    showToast("O valor total dos cartões excede o valor da venda. Verifique os pagamentos.", 2500);
    return;
  }

  if (totalPago >= total) {
    const troco = arredondar(totalPago - total);
    trocoEl.value = troco.toFixed(2);
    trocoos = troco
    faltaEl.value = "0.00";
  }
}

document.getElementById('falta').value = "0.00";
const camposPagamento2 = ['dinheiro', 'cartaoDebito', 'cartaoCredito'];

function processarCampoOs(id) {
  if (swti == 5) {
    calcularOperacaoOs();
  }
  console.log(`Campo ${id} processado!`);
}

camposPagamento2.forEach((id, index) => {
  const campo = document.getElementById(id);
  if (!campo) {
    console.warn(`Campo ${id} não encontrado no DOM`);
    return;
  }
  
  campo.addEventListener('blur', () => {
    processarCampoOs(id);
  });
  
  campo.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      processarCampoOs(id);

      const proximoCampo = document.getElementById(camposPagamento2[index + 1]);
      if (proximoCampo) {
        proximoCampo.focus();
      } else {
        campo.blur();
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btnFinaliza100 = document.getElementById('btnFinalizarOs'); 
  if (btnFinaliza100) {
    btnFinaliza100.addEventListener('click', () => {
      console.log('✅ Clique detectado no botão Finalizar OS');
      FinalOperacaoOs(); 
    });
  } else {
    console.error('❌ Botão com id="btnFinalizarFc" não encontrado.');
  }
});

function FinalOperacaoOs() {
  let dinheiro = arredondar(parseFloat(document.getElementById('dinheiro').value) || 0);
  const debito = arredondar(parseFloat(document.getElementById('cartaoDebito').value) || 0);
  const credito = arredondar(parseFloat(document.getElementById('cartaoCredito').value) || 0);
  const total = totalx;   
  dinheirov = dinheiro;
  if (adiantamentoos > 0 && dinheiro >= adiantamentoos){
    dinheiro = dinheiro - adiantamentoos
  }
  const faltaEl = document.getElementById('falta');
  const trocoEl = document.getElementById('troco');
  const totalPago = arredondar(dinheiro + debito + credito);

  if (totalPago < total) {
    const falta = arredondar(total - totalPago);
    faltaEl.value = falta.toFixed(2);
    trocoEl.value = "0.00";
    showToast(`Pagamento insuficiente. Total: R$ ${total} | Pago: R$ ${totalPago.toFixed(2)}`, 2000);
    return;
  }

  if (totalPago > total && dinheiro === 0) {
    faltaEl.value = "0.00";
    trocoEl.value = "0.00";
    showToast("O valor total dos cartões excede o valor da venda. Verifique os pagamentos.", 2500);
    return;
  }
  
  if (totalPago >= total) {
    const troco = arredondar(totalPago - total);
    trocoEl.value = troco.toFixed(2);
    trocoos = troco
    faltaEl.value = "0.00";
  }
  showToast("Ordem de Serviço finalizada com sucesso!", 2500);
  salvarLancamentosCaixaOs(); 
  finalizarOrdemServicoF(nos)
  imprimirVendaOSCad({ usuario: usuariologadoF, cliente: nomeclien, total: total });
  limparCamposOs()
  limparNome()    
  document.getElementById('formPainel').style.display = 'none';
  document.getElementById('formCalculos').style.display = 'none'; 
  setTimeout(() => {
    location.reload();
  }, 1000);
}

async function salvarLancamentosCaixaOs() {  
  const cod_funcionario = codfuncionaos;
  const funcionario = funcionarioSelecionadoos;
  const cod_cliente = controleSelecionadoos || 1;  
  const cliente = nomeclienos;
  const descricao = 'ORDEM DE SERVIÇO Nº:' + ' ' + nos; 
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0'); 
  const dia = String(agora.getDate()).padStart(2, '0');
  const datacadastro = `${ano}-${mes}-${dia}`; 
  const valorDinheiro = (dinheirov - trocoos) 
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

async function reverterItemEstoqueOs(item) {
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

const btnCancela2026 = document.getElementById('btnCancelaros');
btnCancela2026.addEventListener('click', () => cancelarVendaOss());

function cancelarVendaOss() {
  showToast('Fatura da OS cancelada com sucesso. Nenhum pagamento foi recebido!', 2000);
  limparNome();    
  setTimeout(() => {
      location.reload();
      }, 1000);
  console.log('Módulo reiniciado');
}

document.addEventListener('DOMContentLoaded', function () {  
  const camposOs = [    
    ["controleod", "selecstatusos"],
    ["selecstatusos", "selectFuncionarioos"],
    ["selectFuncionarioos", "selectClienteos"],
    ["selectClienteos", "selectObjetos"],    
    ["selectObjetos", "descricaoos"],    
    ["descricaoos", "laudo"],    
    ["laudo", "observa"],
    ["observa", "descos"],        
    ["descos", "ascos"],
    ["ascos", "btnSalvarOrdem"]    
  ];

  camposOs.forEach(([de, para]) => {
    const elemDe = document.getElementById(de);
    const elemPara = document.getElementById(para);

    if (elemDe && elemPara) {
      elemDe.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault(); 
          elemPara.focus();
        }
      });
    }
  });
});

function imprimirVendaOSCad(venda = {}) {
  const formatarMoeda = (valor) =>
    parseFloat(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const dataHoraAtual = new Date().toLocaleString('pt-BR');  
  const dcto = descontoos || 0;
  const acres = acrescimoos || 0;  
  const adianta = adiantamentoos || 0;  
  const totalCompra = totalGeralOs - dcto + acres || 0;
  const totalDin = dinheirov || 0;
  const totalTro = trocoos || 0;
  const totalDeb = montodeb || 0;
  const totalCred = montocred || 0;   
  const subt = totalGeralOs || 0;
  const usuarioVenda = venda.usuario || 'Usuário do Sistema';
  const clienteVenda = nomeclienos || 'Cliente não informado';
  const numeroOS = nos || 'S/N';
  const itensVenda = Array.isArray(vendasos) ? vendasos : [];  
  const especies = [];
  if (totalDin > 0) especies.push({ nome: 'Dinheiro', valor: totalDin });
  if (totalDeb > 0) especies.push({ nome: 'Cartão Débito', valor: totalDeb });
  if (totalCred > 0) especies.push({ nome: 'Cartão Crédito', valor: totalCred });
  if (especies.length === 0) especies.push({ nome: 'Forma não informada', valor: 0 });  
  const gerarCabecalho = () => `
    <div style="text-align: center; line-height: 1.2; font-family: monospace; font-size: 12px; margin-bottom: 4px;">
      <strong>${emitenteNome}</strong><br>
      CNPJ/CPF: ${emitenteDoc}<br>
      TEL/CEL: ${emitenteTelefone}<br>
      <strong>*** FATURA DA ORDEM DE SERVIÇO ***</strong><br>
      Nº ${numeroOS}
    </div>
  `;  
  const gerarItensHTML = () => itensVenda.map(item => `
    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
      <span>${item.produto} x ${item.quantidade}</span>
      <span>${formatarMoeda(item.total)}</span>
    </div>
  `).join('');  
  const gerarEspeciesHTML = () => `
    <div style="margin-top: 6px; font-size: 12px;">
      <strong>Espécies do Pagamento:</strong>
      ${especies.map(e => `
        <div style="display: flex; justify-content: space-between;">
          <span>${e.nome}:</span>
          <span>${formatarMoeda(e.valor)}</span>
        </div>
      `).join('')}
      <div style="display: flex; justify-content: space-between;">
        <span>Troco:</span> <span>${formatarMoeda(trocoos)}</span>
      </div>
    </div>
  `;
  
  const gerarTotaisHTML = () => `
    <div style="margin-top: 5px; font-size: 11px; font-weight: bold;">
      <div style="display: flex; justify-content: space-between;"><span>Sub Total:</span> <span>${formatarMoeda(subt)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>Desconto:</span> <span>${formatarMoeda(dcto)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>Acréscimo:</span> <span>${formatarMoeda(acres)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>Adiantamento:</span> <span>${formatarMoeda(adianta)}</span></div>
      <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>TOTAL GERAL:</span> <span>${formatarMoeda(totalCompra)}</span>
      </div>
    </div>
  `;

  const gerarCorpoCupom = () => `
    ${gerarCabecalho()}
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    <div style="font-size: 12px; line-height: 1.4; font-family: monospace;">
      <p><strong>Data/Hora:</strong> ${dataHoraAtual}</p>
      <p><strong>Usuário:</strong> ${usuarioVenda}</p>
      <p><strong>Cliente:</strong> ${clienteVenda}</p>      
    </div>
    <div style="font-size: 10px; line-height: 1.4; font-family: monospace;">
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    <p><strong>Serviços/Produtos</strong> ── <strong>Qtd</strong> ─────────────────────── <strong>Total</strong></p>
    </div>
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    ${gerarItensHTML()}
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    ${gerarTotaisHTML()}
    ${gerarEspeciesHTML()}
    <br>
    <p style="text-align: center; font-size: 10px;">Obrigado pela preferência!</p>
    <p style="text-align: center; font-size: 10px; margin-top: 10px;">
      ______________________________<br>Assinatura do Cliente
    </p>
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
  `;
  
  const htmlFinal = `
    <html>
      <head>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; padding: 0; width: 80mm; font-family: monospace; }
          }
          body { margin: 0; padding: 5px; font-family: monospace; width: 80mm; }
          div, p, span { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${gerarCorpoCupom()}
      </body>
    </html>
  `;
  
  const iframe = document.createElement('iframe');
  Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
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

function habilitarcontrolesOs()
  {
  document.getElementById('formPresenta').style.display = 'none';        
  document.getElementById('formPainel').style.display = 'block';   
  document.getElementById('formCalculos').style.display = 'none';     
  document.getElementById('formOs').style.display = 'block';         
  document.getElementById("entraos").focus();   
  document.getElementById("controleod").readOnly = true;      
  document.getElementById("totitemos").readOnly = true;
  document.getElementById("totservos").readOnly = true;
  document.getElementById("totalgeralos").readOnly = true;
  document.getElementById('btnFinalizarFi').style.display = 'none';
  document.getElementById('btnFinalizarFc').style.display = 'none';
  document.getElementById('btnFinalizar').style.display = 'none';
  document.getElementById('btnFinalizarOs').style.display = 'inline-block';  
  document.getElementById('btnFinalizarOsOs').style.display = 'none';    
  document.getElementById('btnSalvarOrdem').style.display = 'inline-block';
  document.getElementById('btnAltOrdem').style.display = 'none';
  document.getElementById('btnCancelarOrdem').disabled = false;
  document.getElementById('btnSalvarOrdem').disabled = false; 
  document.getElementById('btnCancelarOrdem').style.display = 'inline-block';
  document.getElementById('btnCancelarOrdemAlt').style.display = 'none';
  document.getElementById('btnCancelarVer').style.display = 'none';  
  document.getElementById('btnCancelar').style.display = 'none';  
  document.getElementById('btnCancelarv').style.display = 'none';  
  document.getElementById('btnCancelaros').style.display = 'inline-block';    
  document.getElementById('ladescos').style.display = 'inline-block';
  document.getElementById('laascos').style.display = 'inline-block';
  document.getElementById('descos').style.display = 'inline-block';
  document.getElementById('ascos').style.display = 'inline-block';
  document.getElementById('ladiantamento').style.display = 'inline-block';
  document.getElementById('adiantamento').style.display = 'inline-block';
  document.getElementById('ladescoso').style.display = 'none';
  document.getElementById('descoso').style.display = 'none';
  document.getElementById('laascoso').style.display = 'none';
  document.getElementById('ascoso').style.display = 'none';
  document.getElementById('ladiantamentox').style.display = 'none';
  document.getElementById('adiantamentox').style.display = 'none';
  }