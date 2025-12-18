function cadastroservicos() {    
  limparNome();   
  limparCamposServico()
  carregarFornecedores()
  document.getElementById('formPresenta').style.display = 'none';      
  document.getElementById('formServicio').style.display = 'block'; 
  document.getElementById('formPainel').style.display = 'block';     
  document.getElementById("servicio").focus();
  document.getElementById('btnSalvarServico').style.display = 'block';
  document.getElementById('btnAlterarServico').style.display = 'none';  
  document.getElementById('ativoser').style.display = 'none';
  document.querySelector('label[for="ativoser"]').style.display = 'none';
  const msgi = window.document.getElementById('tituloser');
  msgi.innerHTML = `Cadastro de Serviços`;     
  deshabilitaitens(false)   
  fetch('/produtos/servico/max')
  .then(res => res.json())
  .then(data => {    
    let maxControle = data.maxControle;        
    let proximoControle = (maxControle !== null) ? maxControle + 1 : 1;    
    document.getElementById('controleser').value = proximoControle;
  })
  .catch(err => {
    console.error('Erro ao buscar controle máximo:', err);
    alert('Erro ao buscar controle máximo');
  }); 
}

  function SalvarServico() {
  const servicio = document.getElementById('servicio').value.trim().toUpperCase();
  const precoservico = parseFloat(document.getElementById('precoservico').value);
  const duracaoDecimal = document.getElementById('duracao').value.trim();
  const duracao = converterHoraParaDecimal(duracaoDecimal); 
  const datahoracadastro = new Date().toISOString();
  const aplicacao = 'SERVIÇOS';
  const ativoser = "SIM";  
  
  if (!servicio) {
    showToast("⚠️ Informe o nome do serviço!", 2500);
    document.getElementById("servicio").focus();
    return;
  }

  if (!precoservico || isNaN(precoservico) || precoservico <= 0) {
    showToast("⚠️ O preço do serviço deve ser maior que zero!", 2500);
    document.getElementById("precoservico").focus();
    return;
  }

  const novoServico = {
    produto: servicio,        
    codbarras: '',             
    fornecedor: '',            
    grupoestoque: '',          
    subgrupoestoque: '',
    marca: '',
    precocusto: 0,
    perclucro: 0,    
    precovenda: precoservico,
    precorevenda: 0,
    precoatacado: 0,
    quantidade: 0,
    quantidademin: 0,
    quantidademax: 0,
    datahoracadastro,
    ativop: ativoser,  
    fracionado: 0,
    aplicacao,  
    duracao
  };
  fetch('/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoServico)
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.json();
    })
    .then(() => {
      showToast("💼 Serviço cadastrado com sucesso!", 2500);
      limparNome();
      limparCamposServico();
    })
    .catch(err => {
      alert('Erro ao cadastrar serviço: ' + err.message);
    });
}

function converterHoraParaDecimal(horaStr) {
  if (!horaStr) return 0;
  const [h, m] = horaStr.split(':').map(Number);
  return h + (m / 60);
}

function limparCamposServico() {
  document.getElementById('servicio').value = '';
  document.getElementById('precoservico').value = '';
  document.getElementById('duracao').value = '';
} 

  document.addEventListener('DOMContentLoaded', function () {
  const campos = [
    ["servicio", "precoservico"],    
    ["precoservico", "duracao"],
    ["duracao", "btnSalvarServico"]    
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
 
});