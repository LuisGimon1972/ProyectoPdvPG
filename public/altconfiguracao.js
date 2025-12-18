function configura() {
  limparNome();       
  document.getElementById('formPresenta').style.display = 'none';   
  document.getElementById('formConfig').style.display = 'block';  
  document.getElementById('formPainel').style.display = 'block';            
  carregarTipos(1)  
}

async function carregarTipos(controle) {  
  try {
    const emitente = await fetch(`/emitente/${controle}`).then(r => r.json());    
    const tipo = emitente.tipodebusca.toUpperCase();    
    const valorRadio = tipo === "CONTROLE" ? "controle" : "codbarras";
    document.querySelector(`input[name="tipoBuscag"][value="${valorRadio}"]`).checked = true;
  } catch (err) {
    console.error("Erro ao carregar emitente:", err);
  }
}

document.getElementById("btnAlterarConfig").addEventListener("click", async () => {
  try {    
    const valorSelecionado = document.querySelector('input[name="tipoBuscag"]:checked').value;    
    const tipodebusca = valorSelecionado === "controle" ? "CONTROLE" : "BARRAS";          
    const controleEmitente = 1; 
    const resp = await fetch(`/emitente/tipobusca/${controleEmitente}`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipodebusca })
    });

    if (!resp.ok) throw new Error("Erro ao atualizar configuração");    
    showToast("Configuração alterada com sucesso!", 2500);           
    setTimeout(() => {
      location.reload();
    }, 500);

  } catch (err) {
    console.error(err);
    alert("Falha ao alterar configuração!");
  }  
});







