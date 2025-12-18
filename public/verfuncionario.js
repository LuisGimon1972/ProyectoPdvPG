function VisualizarFuncionario(controle) {
    limparNome();
    document.getElementById('formPainel').style.display = 'block';           
    const msg = document.getElementById('titulofun');
    msg.innerHTML = `Visualização de dados do funcionário`;
    fetch(`/funcionarios/${controle}`)
    .then(res => {
    if (!res.ok) throw new Error('Funcionario não encontrado.');
     return res.json();
    })
    .then(funcionario => {    
    document.getElementById('cpff').value = funcionario.cpff || '';
    document.getElementById('rgf').value = funcionario.rgf || '';
    document.getElementById('funcionario').value = funcionario.funcionariof || '';    
    document.getElementById('funcaof').value = funcionario.funcaof || '';    
    document.getElementById('ciudadf').value = funcionario.cidadef || '';
    document.getElementById('cepf').value = funcionario.cepf || '';
    document.getElementById('logradourof').value = funcionario.enderecof || '';
    document.getElementById('bairrof').value = funcionario.bairrof || '';
    document.getElementById('numerof').value = funcionario.numerof || '';   
    document.getElementById('telefonef').value = funcionario.telefonef || '';
    document.getElementById('celularf').value = funcionario.celularf || '';
    document.getElementById('datanascimentof').value = funcionario.datanascimentof || '';
    document.getElementById('datanaadmissaof').value = funcionario.datanaadmissaof || '';
    document.getElementById('e_mailf').value = funcionario.e_mailf || '';     
    document.getElementById('ativof').style.display = 'inline-block';
    document.querySelector('label[for="ativof"]').style.display = 'inline-block';        
 
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
    deshabilitafunc(true); 
    document.getElementById('botoncepf').style.display = 'none';
    document.getElementById('btnAlterarFuncionario').style.display = 'none';
    const formFuncionario = document.getElementById('formFuncionario');
    const formPresenta = document.getElementById('formPresenta');
    const formLista = document.getElementById('formLista');   
    if (formPresenta) formPresenta.style.display = 'none';
    if (formLista) formLista.style.display = 'none';
    formFuncionario.style.display = 'block';     
    document.getElementById('btnSalvarFuncionario').style.display = 'none';                          
    const newBtnFuncionario = btnFuncionario.cloneNode(true);  
  });
}

function deshabilitafunc(valor) {    
    document.getElementById('ativof').disabled = valor;    
    document.getElementById('cpff').disabled = valor;    
    document.getElementById('rgf').disabled = valor;    
    document.getElementById('funcionario').disabled = valor;    
    document.getElementById('cepf').disabled = valor;
    document.getElementById('funcaof').disabled = valor;
    document.getElementById('logradourof').disabled = valor;
    document.getElementById('bairrof').disabled = valor;
    document.getElementById('numerof').disabled = valor;    
    document.getElementById('estadosf').disabled = valor;
    document.getElementById('ciudadf').disabled = valor;        
    document.getElementById('telefonef').disabled = valor;
    document.getElementById('celularf').disabled = valor;
    document.getElementById('datanascimentof').disabled = valor;          
    document.getElementById('datanaadmissaof').disabled = valor;              
    document.getElementById('e_mailf').disabled = valor;       
    document.querySelector('input[name="radsexf"][value="masculino"]').disabled = valor;
    document.querySelector('input[name="radsexf"][value="feminino"]').disabled = valor;
    document.querySelectorAll('input[name="radcivf"]').forEach(el => {
    el.disabled = valor;
    });                  
  }
