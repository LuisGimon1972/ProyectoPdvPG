async function carregarEmitente(controle) {
  try {
    
    const emitente = await fetchJson(`/emitente/${controle}`);
    document.querySelector('input[name="radtipe"][value="fisica"]').disabled = true;
    document.querySelector('input[name="radtipe"][value="juridica"]').disabled = true;       
    setInputValue('emitente', emitente.emitente);
    setInputValue('ciudade', emitente.cidade);
    setInputValue('cepe', emitente.cep);
    setInputValue('logradouroe', emitente.endereco);
    setInputValue('bairroe', emitente.bairro);
    setInputValue('numeroe', emitente.numero);
    setInputValue('paise', emitente.pais);
    setInputValue('estadoe', emitente.uf);
    setInputValue('estadose', emitente.uf);
    setInputValue('telefoneemite', emitente.telefone);
    setInputValue('celulari', emitente.celular);
    setInputValue('datanascimentoe', formatarParaInputDate(emitente.datanascimento));
    setInputValue('naturalidadee', emitente.naturalidade);
    setInputValue('nacionalidadee', emitente.nacionalidade);
    setInputValue('rge', emitente.rg);
    setInputValue('cpfe', emitente.cpf);
    setInputValue('cnpje', emitente.cnpj);
    setInputValue('e_maile', emitente.e_mail);
    setInputValue('fantasiae', emitente.fantasia);
    setInputValue('iee', emitente.ie);
    setInputValue('ime', emitente.im);
    setInputValue('suframa', emitente.suframa);    
    
    const selectpp = document.getElementById('paise');
        const pais = emitente.pais?.toUpperCase();
        if (pais) {
          const existe = Array.from(selectpp.options).some(opt => opt.value === pais);
          if (!existe) selectpp.add(new Option(pais, pais));
            selectpp.value = pais;
        }

    const selectp = document.getElementById('segmento');
        const segmento = emitente.segmento?.toUpperCase();        
        if (segmento) {
          const existe = Array.from(selectp.options).some(opt => opt.value === segmento);
          if (!existe) selectp.add(new Option(segmento, segmento));
            selectp.value = segmento;
        }    

    const selectpr = document.getElementById('rt');
        const crt = emitente.crt?.toUpperCase();
        if (crt) {
          const existe = Array.from(selectpr.options).some(opt => opt.value === crt);
          if (!existe) selectpr.add(new Option(crt, crt));
            selectpr.value = crt;
        }       

	const selectps = document.getElementById('faixa');
        const faixa = emitente.faixa?.toUpperCase();
        if (faixa) {
          const existe = Array.from(selectps.options).some(opt => opt.value === faixa);
          if (!existe) selectps.add(new Option(faixa, faixa));
            selectps.value = faixa;
        }   
        
    const selectpa = document.getElementById('nacionalidadee');
        const nacionalidade = emitente.nacionalidade?.toUpperCase();
        if (nacionalidade) {
          const existe = Array.from(selectpa.options).some(opt => opt.value === nacionalidade);
          if (!existe) selectpa.add(new Option(nacionalidade, nacionalidade));
            selectpa.value = nacionalidade;
        }            

    const selectpn = document.getElementById('naturalidadee');
        const naturalidade = emitente.naturalidade?.toUpperCase();
        if (naturalidade) {
          const existe = Array.from(selectpn.options).some(opt => opt.value === naturalidade);
          if (!existe) selectpn.add(new Option(naturalidade, naturalidade));
            selectpn.value = naturalidade;
        }       
    
    const selectpc = document.getElementById('cidadee');
        const ciudade = emitente.cidade?.toUpperCase();
        if (ciudade) {
          const existe = Array.from(selectpc.options).some(opt => opt.value === ciudade);
          if (!existe) selectpc.add(new Option(ciudade, ciudade));
            selectpc.value = ciudade;
        }                           

    
    if (emitente.tipocliente === 'Pessoa Física') {      
      document.getElementById('cpfe').disabled = true;
      document.querySelector('input[name="radtipe"][value="fisica"]').checked = true;
    } else if (emitente.tipocliente === 'Pessoa Jurídica') {
      document.querySelector('input[name="radtipe"][value="juridica"]').checked = true;
      document.getElementById('rge').disabled = true;
      document.getElementById('cpfe').disabled = true;
      document.getElementById('nacionalidadee').disabled = true;
      document.getElementById('naturalidadee').disabled = true;
      document.getElementById('cnpje').disabled = true;      
      document.querySelector('input[name="radsexe"][value="feminino"]').disabled = true;    
      document.getElementById("labelData").textContent = "Data  de  Fundação:";
      const campoData = document.getElementById("datanascimentoe");  
      campoData.style.width = "169px"; 
      document.getElementById('naturalidadee').disabled = true;    
      document.getElementById('nacionalidadee').disabled = true;        
      document.querySelectorAll('input[name="radcive"]').forEach(el => {
       el.disabled = true;
       document.getElementById("cnpje").focus()
       });
      
    }

    if (emitente.sexo) {
      const sexo = emitente.sexo.toLowerCase();
      const el = document.querySelector(`input[name="radsexe"][value="${sexo}"]`);
      if (el) el.checked = true;
    }

    if (emitente.estadocivil) {
      const civ = emitente.estadocivil.toLowerCase();
      const el = document.querySelector(`input[name="radcive"][value="${civ}"]`);
      if (el) el.checked = true;
    }

  } catch (err) {
    alert("Erro ao carregar emitente: " + err.message);
  }
}

// ─── Helpers ─────────────────────────────
function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.value = value;
  }
}

async function VerificarCEP() {  
  await preencherEnderecoe(); 

  if (cepvalido) {
    AlterarEmitente(1);
  } else {
    result = "CEP não encontrado!";  
    showToast(result, 2500);     
    return;
  }
}


function AlterarEmitente(controle) {
  
  const sexoEl = document.querySelector('input[name="radsexe"]:checked');
  const estadocivilEl = document.querySelector('input[name="radcive"]:checked');
  const tipoEmitenteEl = document.querySelector('input[name="radtipe"]:checked');  
  const emitente = document.getElementById('emitente').value.trim().toUpperCase();
  const cidade = document.getElementById('ciudade').value.trim().toUpperCase();
  const cep = document.getElementById('cepe').value.trim();
  const endereco = document.getElementById('logradouroe').value.trim().toUpperCase();
  const bairro = document.getElementById('bairroe').value.trim().toUpperCase();
  const numero = document.getElementById('numeroe').value.trim();
  const pais = document.getElementById('paise').value.trim().toUpperCase();
  const uf = document.getElementById('estadose').value.trim().toUpperCase();
  const telefone = document.getElementById('telefoneemite').value.trim();
  const celular = document.getElementById('celulari').value.trim();
  const datanascimento = document.getElementById('datanascimentoe').value;
  const naturalidade = document.getElementById('naturalidadee').value.trim().toUpperCase();
  const nacionalidade = document.getElementById('nacionalidadee').value.trim().toUpperCase();
  const rg = document.getElementById('rge').value.trim().toUpperCase();
  const cpf = document.getElementById('cpfe').value.trim();
  const cnpj = document.getElementById('cnpje').value.trim();
  const e_mail = document.getElementById('e_maile').value.trim().toLowerCase();
  const fantasia = document.getElementById('fantasiae').value.trim().toUpperCase();
  const ie = document.getElementById('iee').value.trim().toUpperCase();
  const im = document.getElementById('ime').value.trim().toUpperCase();
  const suframa = document.getElementById('suframa').value.trim().toUpperCase();
  const crtEl = document.getElementById('rt');
  const crt = crtEl ? crtEl.options[crtEl.selectedIndex].text : '';
  const segmentoEl = document.getElementById('segmento');
  const segmento = segmentoEl ? segmentoEl.options[segmentoEl.selectedIndex].text : '';
  const faixaEl = document.getElementById('faixa');
  const faixa = faixaEl ? faixaEl.options[faixaEl.selectedIndex].text : '';
  const tipoemitente = tipoEmitenteEl ? (tipoEmitenteEl.value === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica') : '';    
  const sexo = sexoEl ? (sexoEl.value === 'masculino' ? 'Masculino' : 'Feminino') : '';
  const estadocivil = estadocivilEl ? (estadocivilEl.value.charAt(0).toUpperCase() + estadocivilEl.value.slice(1)) : '';
  const ativoEl = document.getElementById('ativoe');
  const ativo = ativoEl && ativoEl.checked ? 'Sim' : 'Não';    
  
   if (tipoemitente === 'Pessoa Física') {
      if (!cpf || !emitente || !fantasia || !ie || !crt || !segmento || !faixa || !cep || !numero) {
        return avisoCamposObrigatorios(['CPF', 'Emitente', 'FANTASIA', 'IE','REGIME', 'SEGMENTO', 'FAIXA', 'CEP', 'Número']);
      }
    } else if (tipoemitente === 'Pessoa Jurídica') {
      if (!cnpj || !emitente || !fantasia || !ie || !crt || !segmento || !faixa || !cep || !numero) {
        return avisoCamposObrigatoriosj(['CNPJ', 'Emitente', 'FANTASIA', 'IE', 'REGIME', 'SEGMENTO', 'FAIXA', 'CEP', 'Número']);
      }
    }
    
  
  function avisoCamposObrigatorios(campos) {
  showToast(`⚠️ Preencha os campos obrigatórios*: ${campos.join(', ')}.`, 2500);

  const camposIds = [    
    "cpfe",    
    "emitente",
    "fantasiae",
    "iee",    
    "rt",      
    "segmento",                
    "faixa",            
    "cepe",    
    "numeroe"
  ];

  for (const id of camposIds) {
    const elemento = document.getElementById(id);
    if (elemento && elemento.value.trim() === '') {
      elemento.focus();
      return;
    }
  }
}

function avisoCamposObrigatoriosj(campos) {
  showToast(`⚠️ Preencha os campos obrigatórios: * ${campos.join(', ')}.`, 2500);

  const camposIds = [    
    "cnpje",
    "emitente",
    "fantasiae",
    "iee",        
    "rt",            
    "segmento",                
    "faixa",            
    "cepe",    
    "numeroe"
  ];

  for (const id of camposIds) {
    const elemento = document.getElementById(id);
    if (elemento && elemento.value.trim() === '') {
      elemento.focus();
      return;
    }
  }
}

  const btnAlterar = document.getElementById('btnAlterarEmitente');
  if (btnAlterar) btnAlterar.disabled = true;

  fetch(`/emitente/${controle}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emitente, cidade, cep, endereco, bairro, numero,
      pais, uf, ativo, telefone, celular, datanascimento,
      naturalidade, nacionalidade, rg, sexo, estadocivil,
      cpf, cnpj, tipocliente: tipoemitente, e_mail, fantasia,
      ie, im, suframa, crt, segmento, faixa
    })
  })
  .then(res => {
    if (!res.ok) {
      return res.text().then(msg => { throw new Error(msg); });
    }
    return res.json();
  })
  .then(() => {
    showToast("✅ Dados do emitente atualizados com sucesso!", 2500);
    document.getElementById('formEmitente').style.display = 'none';
    cepvalido = false
    buscarEmitente()
    limparNome();            
  })
  .catch(err => {
    alert('Erro: ' + err.message);
  })
  .finally(() => {
    if (btnAlterar) btnAlterar.disabled = false;
  });
}

function formatarParaInputDate(data) {
  if (!data) return ''
  return new Date(data).toISOString().split('T')[0]
}
