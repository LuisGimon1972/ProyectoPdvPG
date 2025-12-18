async function verordemos(osId) {
  window.scrollTo(0, 0);
  resetOsStatev();
  bloquearCamposOS(true)
  nosx = osId;
  swti = 6
  try {
    const os = await fetchJsonv(`/ordemServico/os/${osId}`);    
    preencherCamposOsv(os);
    await preencherClienteEObjetov(os);    
    await carregarItensOsv(osId);
    const selObj = document.getElementById('selectObjetos');
    if (selObj) selObj.disabled = true;
  } catch (err) {
    console.error("Erro ao carregar OS:", err);
    showToast("❌ Erro ao carregar dados da OS!", 2500);
  }
}

function resetOsStatev() {  
  os_vendas = [];
  os_totalGeral = os_totalItens = os_totalServ = os_contServ = 0;
  limparNome();
  limparCamposOs();
  carregarFuncionariosos();
  carregarClientesos();
  carregarFuncionariosTecMec();
  carregarStatus();
  tornarDescontoEAcrescimoSomenteLeitura(false);   
  habilitarcontroleveros()  
}

async function fetchJsonv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar: ${url}`);
  return res.json();
}

function preencherCamposOsv(os) {
  document.getElementById('controleod').value = os.id;
  document.getElementById('selectClienteos').value = os.clienteId;
  document.getElementById('selectFuncionarioos').value = os.funcionarioId;
  document.getElementById('descricaoos').value = os.descricao || '';
  document.getElementById('observa').value = os.observacoes || '';
  document.getElementById('laudo').value = os.laudo || '';
  const desconto = parseFloat(os.desconto);
  const acrescimo = parseFloat(os.acrescimo);
  const adiantamento = parseFloat(os.adiantamento);
  document.getElementById('descoso').value = 
  isNaN(desconto) ? '0.00' : desconto.toFixed(2);
  document.getElementById('ascoso').value = 
  isNaN(acrescimo) ? '0.00' : acrescimo.toFixed(2);
  document.getElementById('adiantamentox').value = 
  isNaN(adiantamento) ? '0.00' : adiantamento.toFixed(2);
  document.getElementById('totalgeralos').value = (os.valorTotal ?? 0).toFixed(2);  
  descontosos = os.desconto
  acrescimosos = os.acrescimo  
  const select = document.getElementById('selectClienteos');
  nomeclienos = select.options[select.selectedIndex].text||'';

  const selectx = document.getElementById('selectFuncionarioos');
  funcionarioSelecionadoos = selectx.options[selectx.selectedIndex].text;
  
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
  atualizarTotaisOsv();
}
}

async function preencherClienteEObjetov(os) {
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
    preencherCamposObjetoOsv(objeto);
  }
}

function preencherCamposObjetoOsv(objeto) {
  const selectp = document.getElementById('selectObjetos');
        let desct = objeto.tipo?.toUpperCase();
        if (desct) {
          desct = objeto.tipo + '-' + objeto.marca + '-' + objeto.placaSerie
          const existe = Array.from(selectp.options).some(opt => opt.value === desct);
          if (!existe) selectp.add(new Option(desct, desct));
            selectp.value = desct;            
        }    
  selectp.disabled = true      
  document.getElementById('obtipo').value = objeto.tipo || '';
  document.getElementById('obplaca').value = objeto.placaSerie || '';
  document.getElementById('obmarca').value = objeto.marca || '';
  document.getElementById('obmodelo').value = objeto.modelo || '';
  document.getElementById('obcor').value = objeto.cor || '';  
}

async function carregarItensOsv(osId) {
  const itens = await fetchJsonv(`/itensOrdemServico/${osId}`);
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
  atualizarTabelaOsOsv();
}

function atualizarTabelaOsOsv() {
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
  atualizarTotaisOsv();
}

function atualizarTotaisOsv() {
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
  let totalFinal = os_totalGeral - desconto + acrescimo - adiantamento;
  if (totalFinal < 0) totalFinal = 0;  
  document.getElementById('totalgeralos').value = totalFinal.toFixed(2);  
}

function coletarDadosOrdemv() {
  const idOS = document.getElementById("controleod").value.trim();
  const clienteId = document.getElementById("selectClienteos").value;
  const objetoVeiculoId = tobid;
  const funcionarioId = document.getElementById("selectFuncionarioos").value;
  const laudo = document.getElementById("laudo").value.trim();
  const descricao = document.getElementById("descricaoos").value.trim();
  const observacoes = document.getElementById("observa").value.trim();
  const desconto = parseFloat(document.getElementById('descoso').value)||0;
  const acrescimo = parseFloat(document.getElementById('ascoso').value)||0;   

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
    valorTotal: os_totalGeral - desconto + acrescimo
  };
}

async function atualizarItensOsv(osId) {
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

function recalcularTotalOsOsv() {
  const descontoInput = document.getElementById('descoso');
  const acrescimoInput = document.getElementById('ascoso');
  const totalGeralInput = document.getElementById('totalgeralos');
  let desconto = parseFloat(descontoInput.value) || 0;
  let acrescimo = parseFloat(acrescimoInput.value) || 0;
  descontoos = desconto;
  acrescimoos = acrescimo;

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
  totalGeralInput.value = (totalGeralOsx - desconto + acrescimo).toFixed(2);
  document.getElementById('desconto').value = desconto.toFixed(2);
  document.getElementById('acrescimo').value = acrescimo.toFixed(2);       
  document.getElementById('total-geral').value = Number(totalGeralInput).toFixed(2);  
}


function bloquearCamposOS(bloquear) {
  const form = document.getElementById("formOs");
  if (!form) return;

  const campos = form.querySelectorAll("input, select, textarea, button");
  
  campos.forEach(el => {
    el.disabled = bloquear;
  });

  const btnCancelar = document.getElementById("btnCancelarVer");
  if (btnCancelar) btnCancelar.disabled = false;
}

function cancelarVer(){   
   limparCamposOs()
   limparNome()
   document.getElementById('btnLisos').click();
   }

  function habilitarcontroleveros(){
    ['formPresenta', 'formCalculos'].forEach(id => document.getElementById(id).style.display = 'none');
    ['formPainel', 'formOs'].forEach(id => document.getElementById(id).style.display = 'block');
    document.getElementById('btnFinalizarOs').style.display = 'none';
    document.getElementById('btnFinalizarOsOs').style.display = 'none';
    document.getElementById('btnFinalizarFi').style.display = 'none';
    document.getElementById('btnFinalizarFc').style.display = 'none';
    document.getElementById('btnFinalizar').style.display = 'none';
    document.getElementById('btnFinalizarOs').style.display = 'none';  
    document.getElementById('btnSalvarOrdem').style.display = 'none';
    document.getElementById('btnCancelarOrdem').style.display = 'none';
    document.getElementById('btnCancelarOrdemAlt').style.display = 'none';
    document.getElementById('btnCancelarVer').style.display = 'inline-block';  
    document.getElementById('btnAltOrdem').style.display = 'none';
    document.getElementById("controleod").readOnly = true;  
    ['ladescos','descos','laascos','ascos','ladiantamento','adiantamento'].forEach(id => document.getElementById(id).style.display = 'none');
    ['ladescoso','descoso','laascoso','ascoso'].forEach(id => document.getElementById(id).style.display = 'inline-block');
  } 