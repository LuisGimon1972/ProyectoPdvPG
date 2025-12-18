function VerFuncionario(controle) {    
    const msg = window.document.getElementById('tituli');
    msg.innerHTML = `Alteração de dados do funcionario`;         
    document.getElementById('botoncepf').style.display = 'inline-block';
    document.getElementById('botoncepf').click();            
    const formFuncionario = document.getElementById('formFuncionario');
    const formPresenta = document.getElementById('formPresenta');
    const formLista = document.getElementById('formLista');     
    if (formPresenta) formPresenta.style.display = 'none';
    if (formLista) formLista.style.display = 'none';
    formFuncionario.style.display = 'block';   
    document.getElementById('formPainel').style.display = 'block';     
    const btnFuncionario = document.getElementById('btnAlterarFuncionario');
    btnFuncionario.style.display = 'block';
    document.getElementById('btnSalvarFuncionario').style.display = 'none';                          
    const newBtnFuncionario = btnFuncionario.cloneNode(true);
    btnFuncionario.parentNode.replaceChild(newBtnFuncionario, btnFuncionario);   
    newBtnFuncionario.addEventListener('click', () => {          
      AlterarFuncionario(controle);
      formFuncionario.style.display = 'block';
    }, { once: true });
}

function EditarFuncionario(controle) {
    limparNome();
    const msg = document.getElementById('titulofun');
    msg.innerHTML = `Alteração de dados do funcionário`;
    fetch(`/funcionarios/${controle}`)
    .then(res => {
    if (!res.ok) throw new Error('Funcionário não encontrado.');
     return res.json();
    })
    .then(funcionario => {    
    document.getElementById('cpff').value = funcionario.cpff || '';
    document.getElementById('rgf').value = funcionario.rgf || '';
    document.getElementById('funcionario').value = funcionario.funcionariof || '';        
    document.getElementById('cepf').value = funcionario.cepf || '';
    document.getElementById('logradourof').value = funcionario.logradourof || '';
    document.getElementById('bairrof').value = funcionario.bairrof || '';
    document.getElementById('numerof').value = funcionario.numerof || '';   
    document.getElementById('telefonef').value = funcionario.telefonef || '';
    document.getElementById('celularf').value = funcionario.celularf || '';
    document.getElementById('datanascimentof').value = funcionario.datanascimentof || '';
    document.getElementById('e_mailf').value = funcionario.e_mailf || '';     
    document.getElementById('ativof').style.display = 'inline-block';
    document.querySelector('label[for="ativof"]').style.display = 'inline-block';        
    deshabilitafunc(false); 
    document.getElementById('cpff').disabled = true;      
 
    if (funcionario.sexof === 'Masculino') {
      document.querySelector('input[name="radsexf"][value="masculino"]').checked = true;
    } else if (funcionario.sexof === 'Feminino') {
      document.querySelector('input[name="radsexf"][value="feminino"]').checked = true;
    }
    if (funcionario.estadocivilf) {
      const estadoCivilLower = funcionario.estadocivilf.toLowerCase();
      const inputEstadoCivil = document.querySelector(`input[name="radcivf"][value="${estadoCivilLower}"]`);
      if (inputEstadoCivil) {
        inputEstadoCivil.checked = true;
      }
    } 
    const inputAtivo = document.querySelector(`input[name="ativof"][value="true"]`);
    if (inputAtivo && funcionario.ativof) {
      inputAtivo.checked = (funcionario.ativof.toUpperCase() === 'SIM');
    }        

    const selectps = document.getElementById('funcaof');
if (selectps) {
  const funcaof = funcionario.funcaof?.toUpperCase();
  if (funcaof) {    
    const existe = Array.from(selectps.options).some(opt => opt.text.toUpperCase() === funcaof);
    if (existe) {      
      const optionExistente = Array.from(selectps.options).find(opt => opt.text.toUpperCase() === funcaof);
      selectps.value = optionExistente.value;
    } else {      
      const optionTemp = document.createElement('option');
      optionTemp.text = funcaof;
      optionTemp.value = funcaof.toLowerCase();
      optionTemp.dataset.temp = "true"; 
      selectps.appendChild(optionTemp);
      selectps.value = optionTemp.value;
    }
  }
}
    document.getElementById('botoncepf').style.display = 'inline-block';
    document.getElementById('botoncepf').click();            
    const formFuncionario = document.getElementById('formFuncionario');
    const formPresenta = document.getElementById('formPresenta');
    const formLista = document.getElementById('formLista');      
    if (formPresenta) formPresenta.style.display = 'none';
    if (formLista) formLista.style.display = 'none';
    formFuncionario.style.display = 'block';  
    document.getElementById('formPainel').style.display = 'block';      
    const btnFuncionario = document.getElementById('btnAlterarFuncionario');
    btnFuncionario.style.display = 'block';
    document.getElementById('btnSalvarFuncionario').style.display = 'none';                          
    const newBtnFuncionario = btnFuncionario.cloneNode(true);
    btnFuncionario.parentNode.replaceChild(newBtnFuncionario, btnFuncionario);
    newBtnFuncionario.addEventListener('click', () => {          
      AlterarFuncionario(controle);
      formFuncionario.style.display = 'block';
      document.getElementById('formPainel').style.display = 'block';     
    }, { once: true });
  })
  .catch(err => {
    alert('Erro ao carregar cliente: ' + err.message);
  });
}

function AlterarFuncionario(controle) {
  const resultado = document.getElementById('resultado');  
  const sexoEle = document.querySelector('input[name="radsexf"]:checked');
  const estadocivilEle = document.querySelector('input[name="radcivf"]:checked');           
  const funcionariof = document.getElementById('funcionario').value.trim().toUpperCase();
  const funcaofEl = document.getElementById('funcaof');
  const funcaof = funcaofEl ? funcaofEl.options[funcaofEl.selectedIndex].text.toUpperCase() : '';
  const cpff = document.getElementById('cpff').value.trim().toUpperCase();
  const rgf = document.getElementById('rgf').value.trim().toUpperCase();      
  const cepf = document.getElementById('cepf').value.trim().toUpperCase();
  const enderecof = document.getElementById('logradourof').value.trim().toUpperCase();
  const bairrof = document.getElementById('bairrof').value.trim().toUpperCase();
  const numerof = document.getElementById('numerof').value.trim().toUpperCase();      
  const uff = document.getElementById('estadosf').value.trim().toUpperCase();
  const cidadef = document.getElementById('ciudadf').value.trim().toUpperCase();
  const telefonef = document.getElementById('telefonef').value.trim().toUpperCase();
  const celularf = document.getElementById('celularf').value.trim().toUpperCase();
  const datanascimentof = document.getElementById('datanascimentof').value;      
  const datanaadmissaof = document.getElementById('datanaadmissaof').value;    
  const e_mailf = document.getElementById('e_mailf').value.trim().toUpperCase();        
  const sexof = sexoEle ? (sexoEle.value === 'masculino' ? 'Masculino' : 'Feminino') : '';
  const estadocivilf = estadocivilEle ? (estadocivilEle.value.charAt(0).toUpperCase() + estadocivilEle.value.slice(1)) : '';      
  const ativoEl = document.getElementById('ativof');
  const ativof = ativoEl.checked ? 'Sim' : 'Não';      
  if (!cpff || !funcionariof || !cepf || !numerof) {
      resul = "Preencha os campos obrigatórios: * CPF, FUNCIONÁRIO, CEP   E NÚMERO";
      showToast(resul, 2500);                                                             
      if (!cpff) { document.getElementById("cpff").focus(); VerFuncionario(controle); return; }      
      if (!funcionariof) { document.getElementById("funcionario").focus(); VerFuncionario(controle); return; }      
      if (!cepf) { document.getElementById("cepf").focus(); VerFuncionario(controle); return; }
      if (!numerof) { document.getElementById("numerof").focus(); VerFuncionario(controle); return; }
    }
  const btnAlterar = document.getElementById('btnAlterarFuncionario');
if (btnAlterar) btnAlterar.disabled = true;
fetch(`/funcionarios/${controle}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    funcionariof,
    cpff,
    rgf,
    cepf,
    enderecof,
    bairrof,
    numerof,
    uff,
    cidadef,
    ativof,
    telefonef,
    celularf,
    datanascimentof,   
    datanaadmissaof,
    sexof,
    estadocivilf,
    funcaof,
    e_mailf
  })
})
  .then(res => {
    if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
    return res.json();
  })
  .then(() => {
    resul = "✅ Dados do funcionário atualizados com sucesso!";
    showToast(resul, 2500);                                                             
    limparNome();
    document.getElementById('formPresenta').style.display = 'none';
    document.getElementById('formFuncionario').style.display = 'block';
    document.getElementById('formPainel').style.display = 'block';     
    listafuncionario()
  })
  .catch(err => alert('Erro: ' + err.message))
  .finally(() => {
    if (btnAlterar) btnAlterar.disabled = false;
  });
}

function esperar() {
setTimeout(() => {
  const resultado = document.getElementById('resultado');
  if (resultado) resultado.style.display = 'none';
}, 3000);
}