let os_vendas = [];
let os_totalGeral = 0;
let os_totalItens = 0;
let os_totalServ = 0;
let os_contServ = 0;
let os_tipoObj = null;
let os_codFuncTecMec = null;
let os_funcSelecionadoTecMec = null;
let totalGeralOsx = 0;
let totalGeralAux = 0;
let itensRemovidos = [];
let swtos = false
let acumiten = 0
let descontosos = 0, acrescimosos = 0, cartados = 0, cartacos =0;   
let trocovi = 0, adiantamentooso = 0
let nosx = 0
let objetoSelecionado
const os_form = document.getElementById('form-ordens');
if (os_form) os_form.onsubmit = handleFormSubmitOs;

async function editordemos(osId) {
  window.scrollTo(0, 0);
  resetOsState();
  bloquearCamposOS(false)
  nosx = osId;
  swti = 6  
  try {
    const os = await fetchJson(`/ordemServico/os/${osId}`);    
    preencherCamposOs(os);
    await preencherClienteEObjeto(os);    
    await carregarItensOs(osId);
  } catch (err) {
    console.error("Erro ao carregar OS:", err);
    showToast("❌ Erro ao carregar dados da OS!", 2500);
  }
}

function resetOsState() {  
  os_vendas = [];
  os_totalGeral = os_totalItens = os_totalServ = os_contServ = 0;
  limparNome();
  limparCamposOsOs();
  carregarFuncionariosos();
  carregarClientesos();
  carregarFuncionariosTecMec();
  carregarStatus();
  tornarDescontoEAcrescimoSomenteLeitura(false); 
  habilitarcontrolesOsOs()  
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar: ${url}`);
  return res.json();
}

function preencherCamposOs(os) {
  document.getElementById('controleod').value = os.id;
  document.getElementById('selectClienteos').value = os.clienteId;
  document.getElementById('selectFuncionarioos').value = os.funcionarioId;
  document.getElementById('descricaoos').value = os.descricao || '';
  document.getElementById('observa').value = os.observacoes || '';
  document.getElementById('laudo').value = os.laudo || '';
  const desconto = parseFloat(os.desconto);
  const acrescimo = parseFloat(os.acrescimo);
  const adiantamento = parseFloat(os.adiantamento);
  document.getElementById('descoso').value = isNaN(desconto) ? '0.00' : desconto.toFixed(2);
  document.getElementById('ascoso').value =  isNaN(acrescimo) ? '0.00' : acrescimo.toFixed(2);
  document.getElementById('adiantamentox').value =  isNaN(adiantamento) ? '0.00' : adiantamento.toFixed(2);
  document.getElementById('totalgeralos').value = (os.valorTotal ?? 0).toFixed(2);  
  descontosos = os.desconto
  acrescimosos = os.acrescimo  
  adiantamentooso = os.adiantamento
  const selecth = document.getElementById('selectClienteos');

if (selecth && selecth.options.length > 0 && selecth.selectedIndex >= 0) {
  nomeclienos = selecth.options[selecth.selectedIndex].text;
} else {
  console.warn("Select de cliente não encontrado ou sem opção selecionada:", selecth);
  nomeclienos = ""; 
}
  const selectx = document.getElementById('selectFuncionarioos');
  funcionarioSelecionadoos = selectx.options[selectx.selectedIndex].text; 

  if (selectObjetos) {
  const objetoId = os.objetoVeiculoId?.toString().trim(); 

  if (objetoId) {    
    const existe = Array.from(selectObjetos.options)
      .some(opt => opt.value === objetoId);

    if (existe) {      
      selectObjetos.value = objetoId;
    } else {      
        const optionTemp = document.createElement('option');
        optionTemp.text = os.objetoNome || `Objeto ${objetoId}`; 
        optionTemp.value = objetoId;
        optionTemp.dataset.temp = "true";
        selectObjetos.appendChild(optionTemp);
        selectObjetos.value = objetoId;
      }    
    objetoSelecionado = objetoId;    
  }
} 
  const selectStatus = document.getElementById('selecstatusos');

if (selectStatus) {
  const status = os.status?.toUpperCase().trim();

  if (status) {    
    const existe = Array.from(selectStatus.options)
      .some(opt => opt.text.toUpperCase() === status);

    if (existe) {      
      const optionExistente = Array.from(selectStatus.options)
        .find(opt => opt.text.toUpperCase() === status);
      selectStatus.value = optionExistente.value;
    } else {      
      const optionTemp = document.createElement('option');
      optionTemp.text = status;
      optionTemp.value = status.toLowerCase();
      optionTemp.dataset.temp = "true";
      selectStatus.appendChild(optionTemp);
      selectStatus.value = optionTemp.value;
    }

    statusSelecionado = status;
  }
  os_totalItens = os.valorTotalItem || 0;
  os_totalServ = os.valorTotalServ || 0;
  os_totalGeral = os.valorTotal || 0;
  atualizarTotaisOs();
}
}

async function preencherClienteEObjeto(os) {
  if (os.clienteId) {
    const cliente = await fetchJson(`/clientes/${os.clienteId}`);
    document.getElementById('cpfos').value = cliente.cpf || cliente.cnpj || '';
    document.getElementById('cepos').value = cliente.cep || '';
    document.getElementById('endos').value = cliente.endereco || '';
    document.getElementById('numcli').value = cliente.numero || '';
    document.getElementById('selectClienteos').value = cliente.controle;
    await carregarObjetosClienteOs(os.clienteId);
  }

  if (os.objetoVeiculoId) {
    const objeto = await fetchJson(`/objetosVeiculos/${os.objetoVeiculoId}`);
    preencherCamposObjetoOs(objeto);
  }
}

function preencherCamposObjetoOs(objeto) {
  const selectp = document.getElementById('selectObjetos');
        let desct = objeto.tipo?.toUpperCase();
        if (desct) {
          desct = objeto.tipo + '-' + objeto.marca + '-' + objeto.placaSerie
          const existe = Array.from(selectp.options).some(opt => opt.value === desct);
          if (!existe) selectp.add(new Option(desct, desct));
            selectp.value = desct;
        }    
  document.getElementById('obtipo').value = objeto.tipo || '';
  document.getElementById('obplaca').value = objeto.placaSerie || '';
  document.getElementById('obmarca').value = objeto.marca || '';
  document.getElementById('obmodelo').value = objeto.modelo || '';
  document.getElementById('obcor').value = objeto.cor || '';
}

async function carregarItensOs(osId) {
  const itens = await fetchJson(`/itensOrdemServico/${osId}`);
  itens.forEach(item => {
    os_vendas.push({
      id: item.id,
      controle: item.produtoId,
      produto: item.descricao,
      precovenda: item.valorUnitario,
      quantidade: item.quantidade,
      total: item.total,
      funcionarioSelecionadoTecMec: item.tecnico || '',
      tipo: item.tipoItem
    });
    if(item.tipoItem=='SERVIÇOS'){
     contserv++;
    }
  });
  atualizarTabelaOsOs();
}

async function handleFormSubmitOs(e) {
  e.preventDefault();
  swtos = true  
  const entrada = e.target.entraos.value.trim();
  let quantidade = 1, controle;

  if (entrada.includes('*')) {
    const [qStr, cStr] = entrada.split('*');
    quantidade = parseFloat(qStr.replace(',', '.'));
    if (!/^\d+$/.test(cStr.trim())) return erroEntrada();
    controle = parseInt(cStr.trim(), 10);
  } else {
    if (!/^\d+$/.test(entrada)) return erroEntrada();
      controle = parseInt(entrada, 10);
  }

  if (isNaN(quantidade) || isNaN(controle) || quantidade <= 0) return erroEntrada();
     await handleEntradaOsOs(controle, quantidade);

  function erroEntrada() {
    showToast("⚠️ Entrada inválida. Ex: 1234 ou 2*1234", 2500);
    document.getElementById("entraos").value = "";
  }
}

async function buscarProdutoPorControleOsOs(controle) {
  try {
    const res = await fetch(`/produtos/controleos/${controle}`);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}
async function handleEntradaOsOs(controle, quantidade = 1) {
  const produto = await buscarProdutoPorControleOsOs(controle);
  if (!produto) {
    document.getElementById("entraos").value = ""; return  showToast("⚠️ Produto inexistente ou desativado!", 2500);   
  }

  if (!Number.isInteger(quantidade) && produto.fracionado !== 'SIM') {
    const msg = produto.aplicacao === 'PRODUTOS'
      ? `🚫 Produto "${produto.produto}" não permite quantidade fracionada!`
      : `🚫 Serviços não podem ser fracionados!`;
    return showToast(msg, 2500);
  }

  if (!verificarEstoqueOsOs(produto, quantidade)) {
    return showToast(`⚠️ Estoque insuficiente!\nDisponível: ${produto.quantidade}`, 2500);
  }

  if ((produto.aplicacao || '').toUpperCase() === 'PRODUTOS') {
    const ok = await diminuirEstoqueOsOs(produto.controle, quantidade);
    if (!ok) return showToast("❌ Erro ao atualizar estoque!", 2500);
  }

  function verificarEstoqueOsOs(produto, quantidade) {
  if (!produto) return false;
  return (produto.aplicacao?.toUpperCase() === 'PRODUTOS')
    ? (produto.quantidade >= quantidade)
    : true;
}

async function diminuirEstoqueOsOs(controle, quantidade) {
  try {
    const res = await fetch(`/produtos/${controle}/diminuir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade })
    });
    return res.ok;
  } catch {
    return false;
  }
}

  adicionarItemVendaOsOs(produto, quantidade);
  atualizarTabelaOsOs();
  document.getElementById("entraos").value = "";
  document.getElementById("entraos").focus();
}

function adicionarItemVendaOsOs(produto, quantidade) {
  quantidade = parseFloat(quantidade) || 0;
  if (quantidade <= 0) {
    showToastl("⚠️ Quantidade inválida", 2000);
    return;
  }
  const precoVenda = parseFloat(produto.precovenda) || 0;
  const total = precoVenda * quantidade;
  const aplica = produto.aplicacao
    if (aplica === 'SERVIÇOS') {      
      contserv++;
  }     
  
  const novoItem = {
    controle: produto.controle,
    produto: produto.produto,
    precovenda: precoVenda,
    quantidade,
    total,
    codFuncionarioTecMec,
    funcionarioSelecionadoTecMec,
    tipo: produto.aplicacao
  };  
  os_vendas.push(novoItem); 
  atualizarTotaisOs();
}

function atualizarTabelaOsOs() {
  const tbody = document.getElementById('tabela-vendaos');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (os_vendas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhum item adicionado</td></tr>`;
    return atualizarTotaisOs();
  }

  os_vendas.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.produto}</td>
      <td style="text-align: right;">${Number(item.precovenda).toFixed(2)}</td>
      <td style="text-align: right;">${Number(item.quantidade).toFixed(2)}</td>
      <td style="text-align: right;">${Number(item.total).toFixed(2)}</td>
      <td>${item.codFuncionarioTecMec || ''}</td>
      <td>${item.funcionarioSelecionadoTecMec || ''}</td>
      <td><button class="btn-apagaros" data-index="${index}">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-apagaros').forEach(btn => {
    btn.addEventListener('click', () => apagarItemOs(btn.dataset.index));
  });
  atualizarTotaisOs();
}

function  apagarItemOs(index) {
  index = parseInt(index);
  if (isNaN(index)) return;
  const item = os_vendas[index];
  if(item.tipo=='PRODUTOS')
        {
          reverterItemEstoqueOsOs(item);
        }     
        else
        {
          if(contserv>0)
          {
            contserv--
          }
        }  
const odescx = parseFloat(document.getElementById('descoso')?.value) || 0; 
const ototax = parseFloat(document.getElementById('totalgeralos')?.value) || 0; 
if (odescx >= ototax) {
  document.getElementById('descoso').value = '';
}
      
  if (!item) return;
  if (item.id && !itensRemovidos.includes(item.id)) itensRemovidos.push(item.id);
  os_vendas.splice(index, 1);  
  atualizarTabelaOsOs();
  atualizarTotaisOs();
  if (os_vendas.length ==0) {
    document.getElementById('descoso').value = '';  
    document.getElementById('ascoso').value = '';
    document.getElementById('totalgeralos').value = '';
  }
}

function atualizarTotaisOs() {
  let totalItens = 0, totalServ = 0; 
  for (const item of os_vendas) {
    if (!item || isNaN(Number(item.total))) continue;

    const tipo = (item.tipo || '').toUpperCase();
    if (tipo === 'PRODUTOS') totalItens += Number(item.total);
    else if (tipo === 'SERVIÇOS') totalServ += Number(item.total);
  }
  
  os_totalItens = totalItens;
  os_totalServ = totalServ;
  os_totalGeral = totalItens + totalServ;
  totalGeralOsx = os_totalGeral;  
  document.getElementById('totitemos').value = totalItens.toFixed(2);
  document.getElementById('totservos').value = totalServ.toFixed(2);  
  const desconto = parseFloat(document.getElementById('descoso')?.value) || 0;
  const acrescimo = parseFloat(document.getElementById('ascoso')?.value) || 0;  
  const adiantamento = parseFloat(document.getElementById('adiantamentox')?.value) || 0;  
  descontosos = desconto
  acrescimosos = acrescimo    
  adiantamentooso = adiantamento
  let totalFinal = os_totalGeral - desconto - adiantamento + acrescimo;
  if (totalFinal < 0) totalFinal = 0;  
  document.getElementById('totalgeralos').value = totalFinal.toFixed(2);  
}

function alterarOrdem()
{
  if (os_vendas.length === 0) {
    showToastl("⚠️ Impossível salvar a Ordem de Serviço sem itens", 2500);
    document.getElementById("entraos").focus();
    return;
  }
  if (statusSelecionado === 'CANCELADA') {      
     cancelarOrdemOsOs()
     return
  }

  if(statusSelecionado=='FINALIZADA')
    {
        if(contserv<=0){
          showToastl("⚠️Não é posível finalizar a Ordem de Serviço sem serviços cadastrados", 2500);       
          document.getElementById("entraos").focus()          
          return
        }
        else{
        atualizarOrdemServico()
        pagarOrdemOsOs()               
        }        
    }
    else{       
      atualizarOrdemServico()     
    }    
}

function cancelarOrdemOsOs() {
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
  texto.textContent = 'Deseja cancelar essa Ordem de Serviço?';
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
    cancelarVendaOsOs(); 
  async function cancelarVendaOsOs() {
     atualizarOrdemServico()     
     await reverterEstoqueOsOs();        
     document.getElementById('formPainel').style.display = 'none';
     document.getElementById('formCalculos').style.display = 'none'; 
     document.getElementById('btnLisos').click();      
     showToast('Ordem de Serviço cancelada com sucesso!', 1500);       
     console.log('OS cancelada e estoque revertido. Página não recarregada.');
     return
   }
  };
  btnCancelar.onclick = () => {
    document.body.removeChild(modal);    
    limparNome()
    document.getElementById('formPainel').style.display = 'none';
    document.getElementById('formCalculos').style.display = 'none'; 
    document.getElementById('btnLisos').click();      
    return
  };
}

async function atualizarOrdemServico() {
  if (os_vendas.length === 0) {
    showToastl("⚠️ Impossível salvar a Ordem de Serviço sem itens", 2500);
    document.getElementById("entraos").focus();
    return;
  }

  try {
    const ordemServico = coletarDadosOrdem();
    const res = await fetch(`/ordemServico/${ordemServico.numeroOS}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ordemServico)
    });
    if (!res.ok) throw new Error("Erro ao atualizar OS");

    await atualizarItensOs(ordemServico.numeroOS);
    await deletarItensRemovidos();
    showToast("✅ Ordem de Serviço atualizada com sucesso!", 2500);
    swtos = false    
    if (statusSelecionado != "FINALIZADA") {  
      document.getElementById('btnLisos').click();
    }
  } catch (err) {
    console.error("Erro ao atualizar Ordem de Serviço:", err);
    showToast("❌ Erro ao atualizar Ordem de Serviço!", 2500);
  }
  
}

function coletarDadosOrdem() {
  const idOS = document.getElementById("controleod").value.trim();
  const clienteId = document.getElementById("selectClienteos").value;  
  const objetoVeiculoId = (tobid === null || tobid === 0) ? objetoSelecionado : tobid;    
  const funcionarioId = document.getElementById("selectFuncionarioos").value;  
  const laudo = document.getElementById("laudo").value.trim();
  const descricao = document.getElementById("descricaoos").value.trim();
  const observacoes = document.getElementById("observa").value.trim();
  const desconto = parseFloat(document.getElementById('descoso').value)||0;
  const acrescimo = parseFloat(document.getElementById('ascoso').value)||0;  
  const adiantamento = parseFloat(document.getElementById('adiantamento').value)||0;  
  return {
    numeroOS: idOS,
    clienteId,
    objetoVeiculoId,
    funcionarioId,
    laudo,
    dataAbertura: new Date().toISOString(),
    status: statusSelecionado,
    descricao,
    observacoes,
    formaPagamento: "Dinheiro",
    desconto,
    acrescimo,
    valorTotalItem: os_totalItens,
    valorTotalServ: os_totalServ,
    valorTotal: os_totalGeral - desconto + acrescimo,
    adiantamento
  };
}

async function atualizarItensOs(osId) {
  for (const item of os_vendas) {
    const itemOS = {
      ordemServicoId: osId,
      produtoId: item.controle,
      descricao: item.produto,
      tipoItem: item.tipo,
      quantidade: item.quantidade,
      valorUnitario: item.precovenda,
      total: item.total,
      tecnico: item.funcionarioSelecionadoTecMec
    };

    if (item.id && item.id !== 0 && item.id !== null) {
      const res = await fetch(`/itensOrdemServico/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemOS)
      });
      if (!res.ok) throw new Error(`Erro ao atualizar item: ${item.produto}`);
    } else {
      const res = await fetch("/itensOrdemServico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemOS)
      });
      if (!res.ok) throw new Error(`Erro ao salvar novo item: ${item.produto}`);
      const novoItem = await res.json();
      item.id = novoItem.id;
    }
  }
}

async function deletarItensRemovidos() {
  for (const idItem of itensRemovidos) {
    try {
      console.log("Tentando deletar item do banco:", idItem);
      const res = await fetch(`/itensOrdemServico/${idItem}`, { method: "DELETE" });
      if (!res.ok) console.warn(`Falha ao deletar item id ${idItem}`);
      else console.log(`Item ${idItem} deletado com sucesso`);
    } catch (err) {
      console.error(`Erro ao deletar item id ${idItem}:`, err);
    }
  }
  itensRemovidos = [];
}

function recalcularTotalOsOs() {
  const descontoInput = document.getElementById('descoso');
  const acrescimoInput = document.getElementById('ascoso');
  const adiantamentoInput = document.getElementById('adiantamentox');
  const totalGeralInput = document.getElementById('totalgeralos');  
  let desconto = parseFloat(descontoInput.value) || 0;
  let acrescimo = parseFloat(acrescimoInput.value) || 0;
  let adiantamentos = parseFloat(adiantamentoInput.value) || 0;
  descontoos = desconto;
  acrescimoos = acrescimo;
  adiantamentooso = adiantamentos  
  if (desconto >= totalGeralOsx) {
    showToastl("⚠️ O desconto não pode ser maior que o total da Ordem de Serviço!", 2500);
    totalGeralInput.value = totalGeralOsx.toFixed(2);
    descontoInput.style.border = "2px solid red";
    setTimeout(() => {
      descontoInput.value = '';
      descontoInput.style.border = '';
      totalGeralInput.value = (totalGeralOsx + acrescimo).toFixed(2);
    }, 2500);
    return;
  }

  if (adiantamentos >= totalGeralOsx) {    
    showToastl("⚠️ O adiantamento não pode ser maior que o total da Ordem de Serviço!", 2500);    
    totalGeralInput.value = totalBase.toFixed(2);    
    adiantamentoInput.style.border = "2px solid red";    
    setTimeout(() => {
      adiantamentoInput.value = '';
      adiantamentoInput.style.border = '';
      const totalFinal = totalGeralOsx + acrescimo;
      totalGeralInput.value = totalFinal.toFixed(2);
    }, 2500);

    return;
  }

  totalGeralInput.value = (totalGeralOsx - desconto - adiantamentos + acrescimo).toFixed(2);
  document.getElementById('desconto').value = desconto.toFixed(2);
  document.getElementById('acrescimo').value = acrescimo.toFixed(2);       
  document.getElementById('total-geral').value = Number(totalGeralInput).toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
  const descontoEl = document.getElementById('descoso');
  const acrescimoEl = document.getElementById('ascoso');
  const adiantamentoEL = document.getElementById('adiantamentox');
  if (descontoEl) descontoEl.addEventListener('input', recalcularTotalOsOs);
  if (acrescimoEl) acrescimoEl.addEventListener('input', recalcularTotalOsOs);
  if (adiantamentoEL) adiantamentoEL.addEventListener('input', recalcularTotalOsOs);
});

function pagarOrdemOsOs() {
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
    document.getElementById('btnCancelarOrdemAlt').disabled = true;
    document.getElementById('btnAltOrdem').disabled = true;    
    bloquearCamposOS(true)  
    FinalizarOperacaoOsOs();        
  };
  btnCancelar.onclick = () => {
    document.body.removeChild(modal);    
    limparNome()
    document.getElementById('formPainel').style.display = 'none';
    document.getElementById('formCalculos').style.display = 'none'; 
    document.getElementById('btnLisos').click();      
  };
}

function FinalizarOperacaoOsOs() {  
  window.scrollTo(0, 0);
  limparcalculos();
  desabilitarControles(false)  
  document.getElementById('formPainel').style.display = 'block';   
  document.getElementById('formCalculos').style.display = 'block';      
  document.getElementById("dinheiro").focus(); 
  document.getElementById('cartaoCredito').style.display = 'block';
  document.getElementById('btnCancelar').style.display = 'inline-block';        
  document.getElementById('btnCancelarv').style.display = 'none';        
  document.querySelector('label[for="cartaoCredito"]').style.display = 'block';
  document.getElementById('parceladoCredito').parentElement.style.display = 'none'; 
  if (adiantamentooso > 0) {
    const campo = document.getElementById('dinheiro');
    campo.value = adiantamentooso.toFixed(2);    
    const eventEnter = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
    });
    campo.dispatchEvent(eventEnter);
}

  document.getElementById('descontoPorcentagem').style.display = 'none';
  document.getElementById('acrescimoPorcentagem').style.display = 'none';
  document.getElementById('descontoPorcentagem').parentElement.innerHTML = `
  <input type="checkbox" id="descontoPorcentagem" style="display:none;"> R$
`;
document.getElementById('acrescimoPorcentagem').parentElement.innerHTML = `
  <input type="checkbox" id="acrescimoPorcentagem" style="display:none;"> R$
`;  
  descontosos = parseFloat(document.getElementById('descoso')?.value) || 0;
  acrescimosos = parseFloat(document.getElementById('ascoso')?.value) || 0;           
  document.getElementById('subtotal').innerText = os_totalGeral.toFixed(2);         
  os_totalGeral = os_totalGeral + acrescimosos - adiantamentooso - descontosos
  document.getElementById('desconto').value = descontosos.toFixed(2);
  document.getElementById('acrescimo').value = acrescimosos.toFixed(2);     
  document.getElementById('dcto').innerText = descontosos.toFixed(2);
  document.getElementById('acres').innerText = acrescimosos.toFixed(2);     
  document.getElementById('total-geral').innerText = os_totalGeral.toFixed(2);  
}

function calcularOperacaoOsOs() {
  const dinheiroInput = parseFloat(document.getElementById('dinheiro').value) || 0;
  const debitoInput = parseFloat(document.getElementById('cartaoDebito').value) || 0;
  const creditoInput = parseFloat(document.getElementById('cartaoCredito').value) || 0;
  const total = parseFloat(document.getElementById('totalgeralos').value) || 0;    
  let dinheiro = arredondar(dinheiroInput);
  const debito = arredondar(debitoInput);
  const credito = arredondar(creditoInput);
  montocred = creditoInput
  montodeb = debitoInput 
  cartados = montodeb
  cartacos = montocred

  if(adiantamentooso>0 && dinheiro<adiantamentooso){
    showToast(`O monto do dinhiero não pode ser menor que o adiantamento. Adiantamento: R$ ${adiantamentoos.toFixed(2)}`,
      2000
    );
    document.getElementById('dinheiro').value = adiantamentooso.toFixed(2); 
    document.getElementById('dinheiro').focus()
    return;
  }
  
  if (adiantamentooso > 0 && dinheiro >= adiantamentooso){
    dinheiro = dinheiro - adiantamentooso   
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

const camposPagamento3 = ['dinheiro', 'cartaoDebito', 'cartaoCredito'];

function processarCampoOsOs(id) {
  if (swti == 6) {    
    calcularOperacaoOsOs();
  }
  console.log(`Campo ${id} processado!`);
}

camposPagamento3.forEach((id, index) => {
  const campo = document.getElementById(id);
  if (!campo) {
    console.warn(`Campo ${id} não encontrado no DOM`);
    return;
  }
  
  campo.addEventListener('blur', () => {
    processarCampoOsOs(id);
  });
  
  campo.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      processarCampoOsOs(id);

      const proximoCampo = document.getElementById(camposPagamento3[index + 1]);
      if (proximoCampo) {
        proximoCampo.focus();
      } else {
        campo.blur();
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btnFinaliza1000 = document.getElementById('btnFinalizarOsOs'); 
  if (btnFinaliza1000) {
    btnFinaliza1000.addEventListener('click', () => {
      console.log('✅ Clique detectado no botão Finalizar OS');
      FinalOperacaoOsOs(); 
    });
  } else {
    console.error('❌ Botão com id="btnFinalizarFc" não encontrado.');
  }
});

function FinalOperacaoOsOs() {    
  let dinheiro = arredondar(parseFloat(document.getElementById('dinheiro').value) || 0);
  const debito = arredondar(parseFloat(document.getElementById('cartaoDebito').value) || 0);
  const credito = arredondar(parseFloat(document.getElementById('cartaoCredito').value) || 0);
  const total = parseFloat(document.getElementById('totalgeralos').value) || 0;    
  dinheirov = dinheiro;
  if (adiantamentooso > 0 && dinheiro >= adiantamentooso){
    dinheiro = dinheiro - adiantamentooso
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
  showToast("Ordem de Serviço finalizada com sucesso!", 3500);  
  salvarLancamentosCaixaOsOs();     
  finalizarOrdemServicoF(nosx)
  imprimirVendaOS({ usuario: usuariologadoF, cliente: nomeclien, total: total });
  limparCamposOs()  
  document.getElementById('formPainel').style.display = 'none';
  document.getElementById('formCalculos').style.display = 'none'; 
  document.getElementById('btnLisos').click(); 
}

async function salvarLancamentosCaixaOsOs() {  
  const cod_funcionario = codfuncionaos;
  const funcionario = funcionarioSelecionadoos;
  const cod_cliente = controleSelecionadoos || 1;  
  const cliente = nomeclienos;
  nosx= document.getElementById('controleod').value
  const descricao = 'ORDEM DE SERVIÇO Nº:' + ' ' + nosx; 
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0'); 
  const dia = String(agora.getDate()).padStart(2, '0');
  const datacadastro = `${ano}-${mes}-${dia}`; 
  const valorDinheiro = (dinheirov - trocovi) 
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

async function finalizarOrdemServicoF(idOS) {
  try {
    const resposta = await fetch(`/ordemServico/${idOS}/finalizar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao finalizar OS");
    }

    const dados = await resposta.json();    
    limparCamposOs()
    //limparNome()  
    document.getElementById('formPainel').style.display = 'none';
    document.getElementById('formCalculos').style.display = 'none'; 
    
    console.log("Data de finalização:", dados.dataFinalizacao);

  } catch (err) {
    console.error("Erro ao finalizar OS:", err);
    showToast("❌ Erro ao finalizar OS!", 2500);
  }
}

function limparCamposOsOs() {
  
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

function cancelarOrdemAlt()
{
  dialogCancelarOs();
}

function dialogCancelarOs() {
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
    //limparCamposOs()
    limparNome()
    document.getElementById('formPainel').style.display = 'none';
    document.getElementById('formCalculos').style.display = 'none'; 
    document.getElementById('btnLisos').click();      
  };
  btnCancelar.onclick = () => {
    document.body.removeChild(modal);
    
  };
}

const btnCancela2025 = document.getElementById('btnCancelar');
btnCancela2025.addEventListener('click', () => cancelarVendaOs());

function cancelarVendaOs() {
  showToast('Fatura da OS cancelada com sucesso. Nenhum pagamento foi recebido!', 2000);
  limparNome();    
  const container = document.getElementById('form-ordens');
  const camposVenda = container.querySelectorAll('input, select, textarea');

  camposVenda.forEach(el => {
    const id = el.id.toLowerCase();
    
    if (id.includes('usuario') || id.includes('login') || id.includes('funcionario')) return;
    
    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = false;
    } else {
      el.value = '';
    }
  });
 
  os_vendas = [];
  os_totalGeral = 0;
  os_totalItens = 0;
  os_totalServ = 0;
  os_contServ = 0;
  os_tipoObj = null;
  os_codFuncTecMec = null;
  os_funcSelecionadoTecMec = null;

  console.log('Venda da OS cancelada. Usuário logado mantido.');
}

async function reverterItemEstoqueOsOs(item) {
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

async function reverterEstoqueOsOs() {
  for (const item of os_vendas) {    
    if ((item.tipo || '').toUpperCase() === 'PRODUTOS') {
      try {
        await fetch(`/produtos/${item.controle}/aumentar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantidade: item.quantidade })
        });
        console.log(`Estoque revertido: ${item.produto} (+${item.quantidade})`);
      } catch (err) {
        console.error(`Erro ao devolver estoque do produto ${item.produto}:`, err);
      }
    }
  }
  console.log('Reversão de estoque concluída.');
}

const btnCancela202 = document.getElementById('btnCancelar');
btnCancela202.addEventListener('click', () => cancelarVendaOsOs());

function cancelarVendaOsOs() {
  showToast('⚠️ Fatura da OS cancelada com sucesso. Nenhum pagamento foi recebido!', 2500);
  const container = document.getElementById('form-ordens');
  if (!container) {
    console.error('Elemento #form-ordens não encontrado.');
    return;
  }  
  const novoModulo = container.cloneNode(true);
  container.parentNode.replaceChild(novoModulo, container);
  console.log('✅ Módulo OS reiniciado sem reload.');  
  setTimeout(() => {
    const btnListar = document.getElementById('btnLisos');
    if (btnListar) {
      btnListar.click();
      console.log('🔁 Retornando à listagem de OS...');
    } else {
      console.warn('⚠️ Botão btnLisos não encontrado após reinício.');
    }
  }, 100); 
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
    ["observa", "descoso"],        
    ["descoso", "ascoso"],
    ["ascoso", "btnAltOrdem"]    
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

function imprimirVendaOS(venda = {}) {
  const formatarMoeda = (valor) =>
    parseFloat(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const dataHoraAtual = new Date().toLocaleString('pt-BR');  
  const totalCompra = venda.total || os_totalGeral || 0;
  const totalDin = dinheirov || 0;
  const totalTro = trocovi || 0;
  const totalDeb = cartados || 0;
  const totalCred = cartacos || 0;  
  const dcto = descontosos || 0;
  const acres = acrescimosos || 0;
  const adianta = adiantamentooso || 0;  
  const subt = totalCompra + dcto - acres || 0;  
  const usuarioVenda = venda.usuario || 'Usuário do Sistema';
  const clienteVenda = nomeclienos || 'Cliente não informado';
  const numeroOS = nosx || 'S/N';
  const itensVenda = Array.isArray(os_vendas) ? os_vendas : [];  
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
        <span>Troco:</span> <span>${formatarMoeda(totalTro)}</span>
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

function habilitarcontrolesOsOs(){
  ['formPresenta', 'formCalculos'].forEach(id => document.getElementById(id).style.display = 'none');
  ['formPainel', 'formOs'].forEach(id => document.getElementById(id).style.display = 'block');
  document.getElementById('btnFinalizarOs').style.display = 'none';
  document.getElementById('btnFinalizarOsOs').style.display = 'inline-block';
  document.getElementById('btnFinalizarFi').style.display = 'none';
  document.getElementById('btnFinalizarFc').style.display = 'none';
  document.getElementById('btnFinalizar').style.display = 'none';
  document.getElementById('btnFinalizarOs').style.display = 'none';  
  document.getElementById('btnSalvarOrdem').style.display = 'none';
  document.getElementById('btnCancelarOrdem').style.display = 'none';
  document.getElementById('btnCancelarOrdemAlt').style.display = 'inline-block';
  document.getElementById('btnCancelarVer').style.display = 'none';  
  document.getElementById('btnCancelarOrdemAlt').disabled = false;
  document.getElementById('btnAltOrdem').disabled = false;
  document.getElementById('btnCancelaros').style.display = 'none';  
  document.getElementById('btnAltOrdem').style.display = 'inline-block';
  document.getElementById("controleod").readOnly = true;  
  ['ladescos','descos','laascos','ascos','ladiantamento','adiantamento'].forEach(id => document.getElementById(id).style.display = 'none');
  ['ladescoso','descoso','laascoso','ascoso','ladiantamentox','adiantamentox'].forEach(id => document.getElementById(id).style.display = 'inline-block');
  }