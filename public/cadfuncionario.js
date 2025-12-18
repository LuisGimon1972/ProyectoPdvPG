function cadastrofuncionarios() {   
    limparNome(); 
    document.getElementById('formPresenta').style.display = 'none';      
    document.getElementById('formFuncionario').style.display = 'block'; 
    document.getElementById('formPainel').style.display = 'none';       
    document.getElementById("cpff").focus();
    document.getElementById('btnSalvarFuncionario').style.display = 'block';
    document.getElementById('btnAlterarFuncionario').style.display = 'none';    
    document.getElementById('ativof').style.display = 'none';
    document.querySelector('label[for="ativof"]').style.display = 'none';
    deshabilitafunc(false);     
    const msg = document.getElementById('titulofun');
    msg.innerHTML = `Cadastro do funcionário`;    
  }  
  
  function SalvarFunc() {    
    const sexoEle = document.querySelector('input[name="radsexf"]:checked');
    const estadocivilEle = document.querySelector('input[name="radcivf"]:checked');             
    const funcionariof = document.getElementById('funcionario').value.trim().toUpperCase();
    const funcaof = document.getElementById('funcaof').value.trim().toUpperCase();
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
    const datahoracadastrof = new Date().toISOString();    
    const e_mailf = document.getElementById('e_mailf').value.trim().toUpperCase();      
    const ativof = "SIM";
    const sexof = sexoEle ? (sexoEle.value === 'masculino' ? 'Masculino' : 'Feminino') : '';
    const estadocivilf = estadocivilEle ? (estadocivilEle.value.charAt(0).toUpperCase() + estadocivilEle.value.slice(1)) : '';                              
    
    if (!cpff || !funcionariof || !cepf || !numerof) {
      resul = "Preencha os campos obrigatórios: * CPF, FUNCIONÁRIO, CEP   E NÚMERO";
      showToast(resul, 2500);                                                             
      if (!cpff) { document.getElementById("cpff").focus(); return; }      
      if (!funcionariof) { document.getElementById("funcionario").focus(); return; }      
      if (!cepf) { document.getElementById("cepf").focus(); return; }
      if (!numerof) { document.getElementById("numerof").focus(); return; }
    }

    fetch('/funcionarios')
    .then(res => res.json())
    .then(funcionarios => {
      const cpfExistentef = funcionarios.some(f => f.cpff === cpff);  
      if (cpfExistentef && cpff) {
        resul = "⚠️ Este CPF já está cadastrado!";
        showToast(resul, 2500);                                                                 
        document.getElementById("cpff").focus();  
        if (btnAdicionar) btnAdicionar.disabled = false;
        return;
      }
  
      fetch('/funcionarios', {
        method: 'POST',
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
          datahoracadastrof,
          datanaadmissaof,
          sexof,
          estadocivilf,
          funcaof,
          e_mailf
        })
      })
      .then(res => {
        if (!res.ok) {
          return res.text().then(msg => { throw new Error(msg); });
        }
        return res.json();
      })
      .then(() => {
        resul = "💼 Cadastro do funcionário concluído com sucesso!";
        showToast(resul, 2500);                                                                 
        limparNome();
      })
      .catch(err => {
        alert('Erro ao cadastrar funcionário: ' + err.message);
      });
    })
    .catch(err => {
      alert('Erro ao verificar funcionários: ' + err.message);
    });
  
  }
  
  document.addEventListener('DOMContentLoaded', function () {
  const campos = [
    ["cpff", "rgf"],
    ["rgf", "funcionario"],
    ["funcionario", "funcaof"],
    ["funcaof", "datanascimentof"],
    ["datanascimentof", "datanaadmissaof"],
    ["datanaadmissaof", "sexolo"],
    ["sexolo", "civilo"],
    ["civilo", "cepf"],    
    ["cepf", "botoncepf"],
    ["botoncepf", "logradourof"],
    ["logradourof", "bairrof"],
    ["bairrof", "ciudadf"],
    ["ciudadf", "estadosf"],
    ["estadosf", "numerof"],
    ["numerof", "e_mailf"],
    ["e_mailf", "telefonef"],
    ["telefonef", "celularf"],
    ["celularf", "btnSalvarFuncionario"]    
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