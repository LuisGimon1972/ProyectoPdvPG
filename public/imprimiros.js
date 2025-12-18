async function imprimirOSPorId(osId) {
  try {
    const os = await fetchJsonv(`/ordemServico/os/${osId}`);    
    const itens = await fetchJsonv(`/itensOrdemServico/${osId}`);    
    let clienteNome = 'Cliente não informado';

if (os.clienteId) {
  try {
    const clienteResponse = await fetchJsonv(`/clientes/nome/${os.clienteId}`);    
    clienteNome = clienteResponse.cliente || 'Cliente não informado';   
  } catch (err) {
    console.warn("⚠️ Erro ao buscar cliente:", err);
  }
}

let funcionarioNome = 'Funcionário não informado';

if (os.funcionarioId) {
  try {
    const funcionarioResponse = await fetchJsonv(`/funcionarios/nome/${os.funcionarioId}`);
    funcionarioNome = funcionarioResponse.funcionariof || 'Funcionário não informado';   
  } catch (err) {
    console.warn("⚠️ Erro ao buscar funcionário:", err);
  }
}
    let objetoDescricao = '';
    let objetoPlaca = '';
    if (os.objetoVeiculoId) {
      const obj = await fetchJsonv(`/objetosVeiculos/${os.objetoVeiculoId}`);
      objetoDescricao = obj.modelo || obj.tipo || '';
      objetoPlaca = obj.placaSerie || '';
    }
 
    const dadosOS = {
      id: os.id,
      numeroOS: os.numeroOS,
      clienteNome,
      funcionario: funcionarioNome || '---',
      objetoDescricao,
      objetoPlaca,
      status: os.status,
      laudo: os.laudo,
      descricao: os.descricao,
      observacoes: os.observacoes,
      desconto: os.desconto,
      adiantamento: os.adiantamento,
      acrescimo: os.acrescimo,
      valorTotalItem: os.valorTotalItem,
      valorTotalServ: os.valorTotalServ,
      valorTotal: os.valorTotal,
      itens: itens
    };    
    imprimirOrdemServico(dadosOS);

  } catch (err) {
    console.error("Erro ao imprimir OS:", err);
    showToast("❌ Erro ao imprimir OS!", 2500);
  }
}

function imprimirOrdemServico(os = {}) {
  const formatarMoeda = (valor) =>
  parseFloat(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const dataHoraAtual = new Date().toLocaleString('pt-BR');
  const usuario = os.funcionario || 'Funcionário não informado';
  const cliente = os.clienteNome || 'Cliente não informado';
  const veiculo = os.objetoDescricao || '---';
  const placa = os.objetoPlaca || '';
  const status = os.status || '---';
  const laudo = os.laudo || '';
  const descricao = os.descricao || '';
  const observacoes = os.observacoes || '';
  const desconto = os.desconto || 0;
  const acrescimo = os.acrescimo || 0;
  const adiantamento = os.adiantamento || 0;
  const totalItens = os.valorTotalItem || 0;
  const totalServ = os.valorTotalServ || 0;
  const totalGeral = os.valorTotal || (totalItens + totalServ - desconto + acrescimo - adiantamento);
  const itens = Array.isArray(os.itens) ? os.itens : [];

  const gerarCabecalho = () => `
    <div style="text-align: center; line-height: 1.3; font-family: monospace; font-size: 12px; margin-bottom: 4px;">
      <strong>${emitenteNome}</strong><br>
      CNPJ/CPF: ${emitenteDoc}<br>
      TEL/CEL: ${emitenteTelefone}<br>
      <strong>*** ORDEM DE SERVIÇO ***</strong>
    </div>
  `;

  const gerarDadosOS = () => `
    <div style="font-size: 13px; font-family: monospace; line-height: 1.4;">
      <p><strong>Nº OS:</strong> ${os.numeroOS || os.id || '---'}</p>
      <p><strong>Data/Hora:</strong> ${dataHoraAtual}</p>
      <p><strong>Status:</strong> ${status}</p>      
      <p><strong>Funcionário:</strong> ${usuario}</p>
      <p><strong>Cliente:</strong> ${cliente}</p>
      <p><strong>Veículo/Objeto:</strong> ${veiculo} ${placa ? `- Placa/Série: ${placa}` : ''}</p>
      
    </div>
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    <p><strong>Serviços/Produtos</strong> ─ <strong>Qtd</strong> ─────────── <strong>Total</strong></p>
  `;

  const gerarItensHTML = () => {
    if (!itens.length) return `<p style="font-size:10px;">Nenhum item cadastrado.</p>`;
    return itens.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
        <span>${item.tipoItem}: ${item.produto || item.descricao} (${item.quantidade}x)</span>
        <span>${formatarMoeda(item.total)}</span>
      </div>
    `).join('');
  };

  const gerarTotaisHTML = () => `
    <div style="font-size: 12px; font-weight: bold;">
      <div style="display: flex; justify-content: space-between;"><span>PRODUTOS:</span> <span>${formatarMoeda(totalItens)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>SERVIÇOS:</span> <span>${formatarMoeda(totalServ)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>DESCONTO:</span> <span>${formatarMoeda(desconto)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>ACRÉSCIMO:</span> <span>${formatarMoeda(acrescimo)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>ADIANTAMENTO:</span> <span>${formatarMoeda(adiantamento)}</span></div>
      <div style="display: flex; justify-content: space-between; border-top:1px dashed #000; margin-top:4px;"><span>TOTAL GERAL:</span> <span>${formatarMoeda(totalGeral)}</span></div>
    </div>
  `;

  const gerarDescricaoLaudoObs = () => `
    <div style="font-size:10px; font-family:monospace; margin-top:6px;">
      ${descricao ? `<p><strong>Descrição:</strong> ${descricao}</p>` : ''}
      ${laudo ? `<p><strong>Laudo Técnico:</strong> ${laudo}</p>` : ''}
      ${observacoes ? `<p><strong>Observações:</strong> ${observacoes}</p>` : ''}
    </div>
  `;

  const gerarRodape = () => `
    <br>
    <p style="text-align: center; font-size: 10px;">Obrigado pela preferência!</p>
    <p style="text-align: center; font-size: 10px; margin-top: 10px;">______________________________<br>Assinatura do Cliente</p>
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
        ${gerarCabecalho()}
        <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
        ${gerarDadosOS()}
        <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
        ${gerarItensHTML()}
        <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
        ${gerarTotaisHTML()}
        ${gerarDescricaoLaudoObs()}
        ${gerarRodape()}
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