function VerCliente(controle) {
    document.getElementById('formPainel').style.display = 'block';           
    const msg = window.document.getElementById('tituli');
    msg.innerHTML = `Consulta de dados do cliente`;  
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
        document.getElementById('pais').value = cliente.pais || '';
        document.getElementById('estados').value = cliente.uf || '';
        document.getElementById('telefone').value = cliente.telefone || '';
        document.getElementById('celular').value = cliente.celular || '';
        document.getElementById('datanascimento').value = cliente.datanascimento || '';
        document.getElementById('naturalidade').value = cliente.naturalidade || '';
        document.getElementById('nacionalidade').value = cliente.nacionalidade || '';
        document.getElementById('limite').value =  (parseFloat(cliente.limite) || 0).toFixed(2);
        document.getElementById('rg').value = cliente.rg || '';
        document.getElementById('cpf').value = cliente.cpf || '';
        document.getElementById('e_mail').value = cliente.e_mail || '';        
        document.getElementById('cnpj').value = cliente.cnpj || '';        
        document.getElementById('fantasia').value = cliente.fantasia || '';        
        document.getElementById('ie').value = cliente.ie || '';        
        document.getElementById('im').value = cliente.im || ''; 
        document.getElementById('cpf').disabled = true;
        if (cliente.tipocliente === 'Pessoa Física') {
          document.querySelector('input[name="radtip"][value="fisica"]').checked = true;          
        } else if (cliente.tipocliente === 'Pessoa Jurídica') {
          document.querySelector('input[name="radtip"][value="juridica"]').checked = true;
        }
        const tipoClienteEl = document.querySelector('input[name="radtip"]:checked');
        const tipocliente = tipoClienteEl ? (tipoClienteEl.value === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica') : '';
        if(tipocliente == 'Pessoa Física')
        {
        document.querySelector('input[name="radtip"][value="fisica"]').disabled = true;
        document.querySelector('input[name="radtip"][value="juridica"]').disabled = true;
        }
        else
        {
        document.querySelector('input[name="radtip"][value="fisica"]').click();
        document.querySelector('input[name="radtip"][value="juridica"]').click();
        document.querySelector('input[name="radtip"][value="juridica"]').disabled = true;
        document.querySelector('input[name="radtip"][value="fisica"]').disabled = true;
        cnpj.disabled = true;
        }
        
        preencherEndereco();  
        const ver = true;        
        deshabilita(true);      
        document.getElementById('botoncep').style.display = 'none';
        document.getElementById('botonvalida').style.display = 'none';
        const formCliente = document.getElementById('formCliente');
        const formPresenta = document.getElementById('formPresenta');
        const formLista = document.getElementById('formLista');
        deshabilitacid();
  
        if (formPresenta) formPresenta.style.display = 'none';
        if (formLista) formLista.style.display = 'none';
        formCliente.style.display = 'block';
        document.getElementById('cnpj').value = cliente.cnpj || '';        
        document.getElementById('fantasia').value = cliente.fantasia || '';        
        document.getElementById('ie').value = cliente.ie || '';        
        document.getElementById('im').value = cliente.im || ''; 
        
  
        const btnCliente = document.getElementById('btnAlterarCliente');
        btnCliente.style.display = 'none';
        document.getElementById('btnSalvarCliente').style.display = 'none';  
        
        const newBtnCliente = btnCliente.cloneNode(true);
        btnCliente.parentNode.replaceChild(newBtnCliente, btnCliente);
  
        newBtnCliente.addEventListener('click', () => {                    
          formCliente.style.display = 'block';
        }, { once: true });
      })
      .catch(err => {
        alert('Erro ao carregar cliente: ' + err.message);
      });
  }  
  
  function deshabilita(valor) {
    document.getElementById('cliente').disabled = valor;    
    document.getElementById('cep').disabled = valor;
    document.getElementById('logradouro').disabled = valor;
    document.getElementById('bairro').disabled = valor;
    document.getElementById('numero').disabled = valor;
    document.getElementById('pais').disabled = valor;
    document.getElementById('estados').disabled = valor;
    document.getElementById('ciudad').disabled = valor;
    document.getElementById('estado').disabled = valor;
    document.getElementById('cidade').disabled = valor;
    document.getElementById('telefone').disabled = valor;
    document.getElementById('celular').disabled = valor;
    document.getElementById('datanascimento').disabled = valor;
    document.getElementById('naturalidade').disabled = valor;
    document.getElementById('nacionalidade').disabled = valor;
    document.getElementById('rg').disabled = valor;
    document.getElementById('cpf').disabled = valor;
    document.getElementById('e_mail').disabled = valor;
    document.getElementById('ie').disabled = valor;
    document.getElementById('im').disabled = valor;
    document.getElementById('fantasia').disabled = valor;    
    document.querySelector('input[name="radsex"][value="masculino"]').disabled = valor;
    document.querySelector('input[name="radsex"][value="feminino"]').disabled = valor;
    document.querySelectorAll('input[name="radciv"]').forEach(el => {
    el.disabled = valor;
    });       
   
  }
  function deshabilitafixo(valor) {    
    document.getElementById('cliente').disabled = valor;    
    document.getElementById('cep').disabled = valor;
    document.getElementById('logradouro').disabled = valor;
    document.getElementById('bairro').disabled = valor;
    document.getElementById('numero').disabled = valor;
    document.getElementById('pais').disabled = valor;
    document.getElementById('estados').disabled = valor;
    document.getElementById('ciudad').disabled = valor;
    document.getElementById('estado').disabled = valor;
    document.getElementById('cidade').disabled = valor;
    document.getElementById('telefone').disabled = valor;
    document.getElementById('celular').disabled = valor;
    document.getElementById('datanascimento').disabled = valor;          
    document.getElementById('limite').disabled = valor;          
    document.getElementById('e_mail').disabled = valor;                  
  }
  

  function deshabilitacid() 
  {
      const selectCidade = document.getElementById('cidade');
      selectCidade.innerHTML = '<option value="">Selecione uma cidade</option>';   
      selectCidade.disabled = true;            
  }