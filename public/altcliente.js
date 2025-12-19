function VerClienteM(controle) {
        const msg = window.document.getElementById('tituli');
        msg.innerHTML = `Alteração de dados do cliente`;       
        fetch(`/clientes/${controle}`)
       .then(res => {
          if (!res.ok) throw new Error('Cliente não encontrado.');
           return res.json();
        })
      .then(cliente => {         
        preencherEndereco();        
        const valor = false;
        deshabilita(valor); 
        document.getElementById('botoncep').style.display = 'block';
        document.getElementById('botonvalida').style.display = 'block';
        document.getElementById('formPainel').style.display = 'none';       
        document.getElementById('formCalculos').style.display = 'none';
        const formCliente = document.getElementById('formCliente');
        const formPresenta = document.getElementById('formPresenta');
        const formLista = document.getElementById('formLista');       
        const tipoClienteEl = document.querySelector('input[name="radtip"]:checked');
        const tipocliente = tipoClienteEl ? (tipoClienteEl.value === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica') : '';
        if(tipocliente == 'Pessoa Física')
        {
        document.querySelector('input[name="radtip"][value="fisica"]').disabled = true;
        document.querySelector('input[name="radtip"][value="juridica"]').disabled = true;
        document.getElementById('fantasia').disabled = true;
        document.getElementById('ie').disabled = true;
        document.getElementById('im').disabled = true;
        document.querySelector('input[name="radsex"][value="masculino"]').disabled = false;
        document.querySelector('input[name="radsex"][value="feminino"]').disabled = false;
        document.querySelectorAll('input[name="radciv"]').forEach(el => {
        el.disabled = false;
        });
        }
        else
        {
        document.querySelector('input[name="radtip"][value="fisica"]').click();
        document.querySelector('input[name="radtip"][value="juridica"]').click();
        document.querySelector('input[name="radtip"][value="juridica"]').disabled = true;
        document.querySelector('input[name="radtip"][value="fisica"]').disabled = true;
        cnpj.disabled = true;
        document.querySelector('input[name="radsex"][value="masculino"]').disabled = true;
        document.querySelector('input[name="radsex"][value="feminino"]').disabled = true;
        document.querySelectorAll('input[name="radciv"]').forEach(el => {
        el.disabled = true;
        });        
        }  
        if (formPresenta) formPresenta.style.display = 'none';
        if (formLista) formLista.style.display = 'none';
        formCliente.style.display = 'block';
        document.getElementById('formPainel').style.display = 'none';   
        document.getElementById("cnpj").value = cliente.cnpj || '';        
        document.getElementById("fantasia").value = cliente.fantasia || '';
        document.getElementById("ie").value = cliente.ie || '';
        document.getElementById("im").value = cliente.im || '';
        document.getElementById("cpf").value = cliente.cpf || '';
        document.getElementById("rg").value = cliente.rg || '';  
        const btnCliente = document.getElementById('btnAlterarCliente');
        btnCliente.style.display = 'block';
        document.getElementById('btnSalvarCliente').style.display = 'none';                      
        document.getElementById('ativo').style.display = 'inline-block';
        document.querySelector('label[for="ativo"]').style.display = 'inline-block'; 
        const newBtnCliente = btnCliente.cloneNode(true);
        btnCliente.parentNode.replaceChild(newBtnCliente, btnCliente);
  
        newBtnCliente.addEventListener('click', () => {          
          AlterarCliente(controle);
          formCliente.style.display = 'block';
          document.getElementById('formPainel').style.display = 'none';   
        }, { once: true });
      })
      .catch(err => {
        alert('Erro ao carregar cliente: ' + err.message);
      });
  }
  
  function isoParaInputDate(valor) {
  if (!valor) return ''
  return valor instanceof Date
    ? valor.toISOString().split('T')[0]
    : String(valor).split('T')[0]
}

function EditarCliente(controle) {
        const msg = window.document.getElementById('tituli');
        msg.innerHTML = `Alteração de dados do cliente`;       
    fetch(`/clientes/${controle}`)
      .then(res => {
        if (!res.ok) throw new Error('Cliente não encontrado.');
        return res.json();
      })
      .then(cliente => {
        // Preenche os campos do formulário        
        document.getElementById('cliente').value = cliente.cliente || '';
        document.getElementById('ciudad').value = cliente.cidade || '';
        document.getElementById('cep').value = cliente.cep || '';
        document.getElementById('logradouro').value = cliente.endereco || '';
        document.getElementById('bairro').value = cliente.bairro || '';
        document.getElementById('numero').value = cliente.numero || '';
        document.getElementById('formPainel').style.display = 'none';       
        document.getElementById('formCalculos').style.display = 'none';

        const selectp = document.getElementById('pais');
        const pais = cliente.pais?.toUpperCase();
        if (pais) {
          const existe = Array.from(selectp.options).some(opt => opt.value === pais);
          if (!existe) selectp.add(new Option(pais, pais));
            selectp.value = pais;
        }    

                    
        const select = document.getElementById('naturalidade');
        const naturalidade = cliente.naturalidade?.toUpperCase();
        if (naturalidade) {
          const existe = Array.from(select.options).some(opt => opt.value === naturalidade);
          if (!existe) select.add(new Option(naturalidade, naturalidade));
            select.value = naturalidade;
        }
        
        const selectv = document.getElementById('nacionalidade');
        const nacionalidade = cliente.nacionalidade?.toUpperCase();
        if (nacionalidade) {
          const existe = Array.from(selectv.options).some(opt => opt.value === nacionalidade);
          if (!existe) selectv.add(new Option(nacionalidade, nacionalidade));
            selectv.value = nacionalidade;
        }                
     
        document.getElementById('estados').value = cliente.uf || '';
        document.getElementById('telefone').value = cliente.telefone || '';
        document.getElementById('celular').value = cliente.celular || '';
        document.getElementById('datanascimento').value = isoParaInputDate(cliente.datanascimento)
        document.getElementById('rg').value = cliente.rg || '';
        document.getElementById('cpf').value = cliente.cpf || '';
        document.getElementById('e_mail').value = cliente.e_mail || '';        
        document.getElementById('limite').value =  (parseFloat(cliente.limite) || 0).toFixed(2);

        document.getElementById('cnpj').value = cliente.cnpj || '';        
        document.getElementById('fantasia').value = cliente.fantasia || '';        
        document.getElementById('ie').value = cliente.ie || '';        
        document.getElementById('im').value = cliente.im || '';               

        if (cliente.tipocliente === 'Pessoa Física') {
          document.querySelector('input[name="radtip"][value="fisica"]').checked = true;          
        } else if (cliente.tipocliente === 'Pessoa Jurídica') {
          document.querySelector('input[name="radtip"][value="juridica"]').checked = true;
        }
        if (cliente.sexo === 'Masculino') {
          document.querySelector('input[name="radsex"][value="masculino"]').checked = true;
        } else if (cliente.sexo === 'Feminino') {
          document.querySelector('input[name="radsex"][value="feminino"]').checked = true;
        }
        if (cliente.estadocivil) {
          const estadoCivilLower = cliente.estadocivil.toLowerCase();
          const inputEstadoCivil = document.querySelector(`input[name="radciv"][value="${estadoCivilLower}"]`);
          if (inputEstadoCivil) {
            inputEstadoCivil.checked = true;
          }
        } 
        const inputAtivo = document.querySelector(`input[name="ativo"][value="true"]`);
        if (inputAtivo && cliente.ativo) {
          inputAtivo.checked = (cliente.ativo.toUpperCase() === 'SIM');
        }         

        preencherEndereco();        
        const valor = false;
        deshabilita(valor); 
        document.getElementById('botoncep').style.display = 'block';
        document.getElementById('botonvalida').style.display = 'block';
        const formCliente = document.getElementById('formCliente');
        const formPresenta = document.getElementById('formPresenta');
        const formLista = document.getElementById('formLista');
        

        const tipoClienteEl = document.querySelector('input[name="radtip"]:checked');
        const tipocliente = tipoClienteEl ? (tipoClienteEl.value === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica') : '';
        if(tipocliente == 'Pessoa Física')
        {
        document.querySelector('input[name="radtip"][value="fisica"]').disabled = true;
        document.querySelector('input[name="radtip"][value="juridica"]').disabled = true;
        document.getElementById('fantasia').disabled = true;
        document.getElementById('ie').disabled = true;
        document.getElementById('im').disabled = true;
        document.querySelector('input[name="radsex"][value="masculino"]').disabled = false;
        document.querySelector('input[name="radsex"][value="feminino"]').disabled = false;
        document.querySelectorAll('input[name="radciv"]').forEach(el => {
        el.disabled = false;
        });
        }
        else
        {
        document.querySelector('input[name="radtip"][value="fisica"]').click();
        document.querySelector('input[name="radtip"][value="juridica"]').click();
        document.querySelector('input[name="radtip"][value="juridica"]').disabled = true;
        document.querySelector('input[name="radtip"][value="fisica"]').disabled = true;
        cnpj.disabled = true;
        document.querySelector('input[name="radsex"][value="masculino"]').disabled = true;
        document.querySelector('input[name="radsex"][value="feminino"]').disabled = true;
        document.querySelectorAll('input[name="radciv"]').forEach(el => {
        el.disabled = true;
        });
        
        }
  
        if (formPresenta) formPresenta.style.display = 'none';
        if (formLista) formLista.style.display = 'none';
        formCliente.style.display = 'block';
        document.getElementById('formPainel').style.display = 'none';   
        document.getElementById("cnpj").value = cliente.cnpj || '';        
        document.getElementById("fantasia").value = cliente.fantasia || '';
        document.getElementById("ie").value = cliente.ie || '';
        document.getElementById("im").value = cliente.im || '';
        document.getElementById("cpf").value = cliente.cpf || '';
        document.getElementById("rg").value = cliente.rg || '';  
        const btnCliente = document.getElementById('btnAlterarCliente');
        btnCliente.style.display = 'block';
        document.getElementById('btnSalvarCliente').style.display = 'none';                      
        document.getElementById('ativo').style.display = 'inline-block';
        document.querySelector('label[for="ativo"]').style.display = 'inline-block'; 
        const newBtnCliente = btnCliente.cloneNode(true);
        btnCliente.parentNode.replaceChild(newBtnCliente, btnCliente);
  
        newBtnCliente.addEventListener('click', () => {          
          AlterarCliente(controle);
          formCliente.style.display = 'block';
        }, { once: true });
      })
      .catch(err => {
        alert('Erro ao carregar cliente: ' + err.message);
      });
  }
  
  function AlterarCliente(controle) {
    const resultado = document.getElementById('resultado');
    const sexoEl = document.querySelector('input[name="radsex"]:checked');
    const estadocivilEl = document.querySelector('input[name="radciv"]:checked');
    const tipoClienteEl = document.querySelector('input[name="radtip"]:checked');  
    const cliente = document.getElementById('cliente').value.trim().toUpperCase();
    const cidade = document.getElementById('ciudad').value.trim().toUpperCase();
    const cep = document.getElementById('cep').value.trim();
    const endereco = document.getElementById('logradouro').value.trim().toUpperCase();
    const bairro = document.getElementById('bairro').value.trim();
    const numero = document.getElementById('numero').value.trim();
    const limite = parseFloat(document.getElementById('limite').value || 0).toFixed(2);
    const pais = document.getElementById('pais').value.trim();
    const uf = document.getElementById('estados').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const celular = document.getElementById('celular').value.trim();
    const datanascimento = document.getElementById('datanascimento').value;
    const naturalidade = document.getElementById('naturalidade').value.trim();
    const nacionalidade = document.getElementById('nacionalidade').value.trim();
    const rg = document.getElementById('rg').value.trim().toUpperCase();
    const cpf = document.getElementById('cpf').value.trim();
    const e_mail = document.getElementById('e_mail').value.trim().toUpperCase();  
    const cnpj = document.getElementById('cnpj').value.trim();  
    const fantasia = document.getElementById('fantasia').value.trim().toUpperCase();  
    const ie = document.getElementById('ie').value.trim().toUpperCase();  
    const im = document.getElementById('im').value.trim().toUpperCase();  
    const tipocliente = tipoClienteEl ? (tipoClienteEl.value === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica') : '';    
    const sexo = sexoEl ? (sexoEl.value === 'masculino' ? 'Masculino' : 'Feminino') : '';
    const estadocivil = estadocivilEl ? estadocivilEl.value.charAt(0).toUpperCase() + estadocivilEl.value.slice(1) : ''; 
    const ativoEl = document.getElementById('ativo');
    const ativo = ativoEl.checked ? 'Sim' : 'Não';   
  
    if(tipocliente == 'Pessoa Física')
      {
        if (!cpf ||!cliente || !cep || !numero  ) {
           resul = "⚠️Preencha os campos obrigatórios: * CPF, Cliente, CEP e Numero.";            
           showToast(resul, 2500);                                     
           if(!cpf){document.getElementById("cpf").focus(); VerClienteM(controle); return }        
           if(!cliente){document.getElementById("cliente").focus(); VerClienteM(controle); return }        
           if(!cep){document.getElementById("cep").focus(); VerClienteM(controle); return }        
           if(!numero){document.getElementById("numero").focus(); VerClienteM(controle); return }        
           if (btnAdicionar) btnAdicionar.disabled = false;
           return;        
         }
       }
         if(tipocliente === 'Pessoa Jurídica')
         {
         if (!cnpj || !cliente || !ie  || !cep || !numero ) {
           resul = "⚠️Preencha os campos obrigatórios: * CNPJ, Cliente, IE, CEP e Numero.";   
           showToast(resul, 2500);                                                         
           if(!cnpj)
           {document.getElementById("cnpj").focus(); VerClienteM(controle); return }
           if(!cliente)
           {document.getElementById("cliente").focus(); VerClienteM(controle); return}
           if(!ie)
           { document.getElementById("ie").focus(); VerClienteM(controle); return }
           if(!cep){document.getElementById("cep").focus(); VerClienteM(controle); return }
           if(!numero){document.getElementById("numero").focus(); VerClienteM(controle); return}                     
           if (btnAdicionar) btnAdicionar.disabled = false;
           return;        
         }
        }         
  
    const btnAlterar = document.getElementById('btnAlterarCliente');
    if (btnAlterar) btnAlterar.disabled = true;
    
  
  fetch(`/clientes/${controle}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cliente: cliente || '',
    cidade: cidade || '',
    cep: cep || '',
    endereco: endereco || '',
    bairro: bairro || '',
    numero: numero || '',
    pais: pais || '',
    uf: uf || '',
    ativo: ativo || 'S',
    telefone: telefone || '',
    celular: celular || '',
    datanascimento: datanascimento || null,
    naturalidade: naturalidade || '',
    nacionalidade: nacionalidade || '',
    rg: rg || '',
    sexo: sexo || '',
    estadocivil: estadocivil || '',
    cpf: cpf || '',
    tipocliente: tipocliente || '',
    e_mail: e_mail || '',
    cnpj: cnpj || '',
    fantasia: fantasia || '',
    ie: ie || '',
    im: im || '',
    limite: parseFloat(limite) || 0
  })
})
  .then(res => {
    if (!res.ok) {
      return res.text().then(msg => { throw new Error(msg); });
    }
    return res.json();
  })
  .then(() => {
    showToast("✅ Dados do cliente atualizados com sucesso!", 2500);
    limparNome();
    document.getElementById('formPresenta').style.display = 'none';
    document.getElementById('formLista').style.display = 'block';
    document.getElementById('btnListar').click();
  })
  .catch(err => {
    alert('Erro: ' + err.message);
  })
  .finally(() => {
    if (btnAlterar) btnAlterar.disabled = false;
  });
 }
  
  // Função auxiliar para esconder mensagens após alguns segundos
  function esperar() {
    setTimeout(() => {
      const resultado = document.getElementById('resultado');
      if (resultado) resultado.style.display = 'none';
    }, 3000);
  }
  