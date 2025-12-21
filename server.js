// SERVER.JS - API PostgreSQL (REFATORADO)
// ---------- IMPORTS ----------
const express = require('express');
const cors = require('cors');
const path = require('path')  
const { Pool } = require('pg');

// ---------- CONFIGURAÇÃO APP ----------
const app = express();
app.use(express.static(path.join(__dirname, 'public'))) // pasta onde estão os HTML/CSS/JS

app.use(cors());
app.use(express.json());

// ---------- CONFIGURAÇÃO POSTGRES ----------
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bancopdv', // ✅ banco deve EXISTIR
  password: '8451',
  port: 5432,
});

const fs = require('fs')

async function carregarBanco(pool) {
  try {
    const sqlPath = path.join(__dirname, 'bancopdv.sql')
    console.log('📄 Lendo arquivo SQL:', sqlPath)
    if (!fs.existsSync(sqlPath)) {
      console.warn('⚠️ bancopdv.sql não encontrado, pulando execução...')
      return
    }
    const sql = fs.readFileSync(sqlPath, 'utf8')
    if (!sql.trim()) {
      console.warn('⚠️ bancopdv.sql está vazio.')
      return
    }
    console.log('⏳ Executando bancopdv.sql...')
    await pool.query(sql)
    console.log('✔️ Bancopdv.sql executado com sucesso!')

  } catch (err) {
    console.error('❌ Erro ao executar bancopdv.sql:\n', err.message)
  }
}

// ---------- TESTE DE CONEXÃO ----------
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conectado ao PostgreSQL');
  } catch (err) {
    console.error('❌ Erro ao conectar no PostgreSQL:', err.message);
    process.exit(1);
  }
})();

// ---------- ROTAS DE TESTE ----------
app.get('/', (req, res) => {
  res.json({ status: 'API rodando!!!!', timestamp: new Date() });   // roda banco.sql se existir
});

// ---------- MIDDLEWARE DE ERROS ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ---------- START SERVER ----------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});

// ---------- EXPORTS ----------
module.exports = { app, pool };

async function inserirClientePadrao(pool) {
  try {
    // Verifica se já existe
    const check = await pool.query(
      `SELECT controle FROM clientes WHERE cliente = $1`,
      ['CONSUMIDOR PADRÃO']
    )

    if (check.rows.length > 0) {
      //console.log('Cliente CONSUMIDOR PADRÃO já existe.')
      return
    }

    // Insere cliente padrão
    await pool.query(`
      INSERT INTO clientes (
        cliente,
        cidade,
        cep,
        endereco,
        bairro,
        numero,
        pais,
        uf,
        ativo,
        telefone,
        celular,
        datanascimento,
        datahoracadastro,
        naturalidade,
        nacionalidade,
        rg,
        sexo,
        estadocivil,
        cpf,
        cnpj,
        tipocliente,
        e_mail,
        ie,
        im,
        fantasia,
        limite
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26
      )
    `, [
      'CONSUMIDOR PADRÃO',
      '', '', '', '', '',
      '', '',
      'SIM',
      '', '',
      null,
      new Date(),
      '', '', '',
      '',
      '',
      '',
      '',
      'F',
      '',
      '',
      '',
      '',
      null
    ])

    console.log('✔ Cliente CONSUMIDOR PADRÃO inserido com sucesso.')

  } catch (err) {
    console.error('❌ Erro ao inserir cliente padrão:', err.message)
  }
}
inserirClientePadrao(pool)

async function inserirUsuarioPadrao(pool) {
  try {    
    const check = await pool.query(
      `SELECT id FROM usuarios WHERE nome = $1`,
      ['ADMIN']
    )

    if (check.rows.length > 0) {
    //console.log('Usuário ADMIN já existe.')
      return
    }

    // Insere usuário ADMIN
    await pool.query(
      `INSERT INTO usuarios (nome, senha, email)
       VALUES ($1, $2, $3)`,
      ['ADMIN', '123', '']
    )

    console.log('✔ Usuário ADMIN inserido com sucesso.')

  } catch (err) {
    console.error('❌ Erro ao inserir usuário ADMIN:', err.message)
  }
}
inserirUsuarioPadrao(pool);

// ROTAS DE USUARIO

// Inserir usuário
app.post('/usuarios', async (req, res) => {
  const { nome, senha, email } = req.body;
  if (!nome || !senha) {
    return res.status(400).json({ erro: 'Login e senha são obrigatórios.' });
  }

  try {
    const sql = `INSERT INTO usuarios (nome, senha, email) VALUES ($1, $2, $3) RETURNING id`;
    const result = await pool.query(sql, [nome, senha, email]);
    res.status(201).json({ id: result.rows[0].id, nome, senha, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao inserir usuário.' });
  }
});

// Listar usuários
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM usuarios`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
});


// LOGIN
app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).send('Usuário e senha são obrigatórios.');
  }

  try {
    const sql = `SELECT * FROM usuarios WHERE nome = $1 AND senha = $2`;
    const result = await pool.query(sql, [usuario, senha]);

    if (result.rows.length === 0) {
      return res.status(401).send('Usuário ou senha inválidos.');
    }

    const row = result.rows[0];
    res.status(200).json({ sucesso: true, nome: row.nome, email: row.email });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao acessar o banco de dados.');
  }
});

// ATUALIZAR USUÁRIO
app.put('/usuarios/:id', async (req, res) => {
  const { nome, senha, email } = req.body;
  const { id } = req.params;

  if (!nome || !senha) {
    return res.status(400).json({ erro: 'Nome e senha são obrigatórios.' });
  }

  try {
    const sql = `UPDATE usuarios SET nome = $1, senha = $2, email = $3 WHERE id = $4 RETURNING id`;
    const result = await pool.query(sql, [nome, senha, email, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ atualizado: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
  }
});

// DELETAR USUÁRIO
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM usuarios WHERE id = $1 RETURNING id`;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ deletado: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar usuário.' });
  }
});



// ROTAS EMITENTE
app.post('/emitente', async (req, res) => {
  const dados = req.body;

  const sql = `
    INSERT INTO emitente (
      emitente, cidade, cep, endereco, bairro, numero, pais, uf, ativo,
      telefone, celular, datanascimento, datahoracadastro, naturalidade,
      nacionalidade, rg, sexo, estadocivil, cpf, cnpj, tipocliente,
      e_mail, ie, im, suframa, crt, segmento, faixa, fantasia, tipodebusca
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29,$30
    )
    RETURNING controle
  `;

  const params = [
    dados.emitente, dados.cidade, dados.cep, dados.endereco, dados.bairro, dados.numero,
    dados.pais, dados.uf, dados.ativo, dados.telefone, dados.celular,
    dados.datanascimento, dados.datahoracadastro, dados.naturalidade, dados.nacionalidade,
    dados.rg, dados.sexo, dados.estadocivil, dados.cpf, dados.cnpj,
    dados.tipocliente, dados.e_mail, dados.ie, dados.im, dados.suframa,
    dados.crt, dados.segmento, dados.faixa, dados.fantasia, dados.tipodebusca
  ];

  try {
    const result = await pool.query(sql, params);
    res.status(201).json({ controle: result.rows[0].controle, ...dados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao inserir emitente.' });
  }
});


// Listar todos emitentes
// Listar todos os emitentes
app.get('/emitente', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM emitente`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar emitentes.' });
  }
});

// Buscar emitente por controle
app.get('/emitente/:controle', async (req, res) => {
  const { controle } = req.params;

  try {
    const sql = `SELECT * FROM emitente WHERE controle = $1`;
    const result = await pool.query(sql, [controle]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emitente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar emitente.' });
  }
});


// Atualizar emitente
app.put('/emitente/:controle', async (req, res) => {
  const { controle } = req.params;
  const dados = req.body;

  const sql = `
    UPDATE emitente SET
      emitente=$1, cidade=$2, cep=$3, endereco=$4, bairro=$5, numero=$6, pais=$7, uf=$8, ativo=$9,
      telefone=$10, celular=$11, datanascimento=$12, datahoracadastro=$13, naturalidade=$14,
      nacionalidade=$15, rg=$16, sexo=$17, estadocivil=$18, cpf=$19, cnpj=$20, tipocliente=$21,
      e_mail=$22, ie=$23, im=$24, suframa=$25, crt=$26, segmento=$27, faixa=$28, fantasia=$29, tipodebusca=$30
    WHERE controle=$31
    RETURNING controle
  `;

  const params = [
    dados.emitente, dados.cidade, dados.cep, dados.endereco, dados.bairro, dados.numero,
    dados.pais, dados.uf, dados.ativo, dados.telefone, dados.celular,
    dados.datanascimento, dados.datahoracadastro, dados.naturalidade, dados.nacionalidade,
    dados.rg, dados.sexo, dados.estadocivil, dados.cpf, dados.cnpj,
    dados.tipocliente, dados.e_mail, dados.ie, dados.im, dados.suframa,
    dados.crt, dados.segmento, dados.faixa, dados.fantasia, dados.tipodebusca,
    controle
  ];

  try {
    const result = await pool.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emitente não encontrado' });
    }

    res.json({ controle: result.rows[0].controle, ...dados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar emitente.' });
  }
});


// Excluir emitente
// DELETAR EMITENTE
app.delete('/emitente/:controle', async (req, res) => {
  const { controle } = req.params;

  try {
    const sql = `DELETE FROM emitente WHERE controle = $1 RETURNING controle`;
    const result = await pool.query(sql, [controle]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emitente não encontrado' });
    }

    res.json({ message: 'Emitente excluído com sucesso', controle: result.rows[0].controle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir emitente.' });
  }
});

// ATUALIZAR tipodebusca
app.put('/emitente/tipobusca/:controle', async (req, res) => {
  const { controle } = req.params;
  const { tipodebusca } = req.body;

  if (!tipodebusca) {
    return res.status(400).json({ erro: "tipodebusca é obrigatório." });
  }

  try {
    const sql = `UPDATE emitente SET tipodebusca = $1 WHERE controle = $2 RETURNING controle`;
    const result = await pool.query(sql, [tipodebusca, controle]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Emitente não encontrado." });
    }

    res.json({ sucesso: true, controle: result.rows[0].controle, tipodebusca });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar tipodebusca." });
  }
});

// ROTAS CLIENTES
app.post('/clientes', async (req, res) => {
  const {
    cliente, cidade, cep, endereco, bairro, numero, pais, uf, ativo,
    telefone, celular, datanascimento, datahoracadastro,
    naturalidade, nacionalidade, rg, sexo, estadocivil,
    cpf, cnpj, tipocliente, e_mail, ie, im, fantasia, limite, objetos
  } = req.body;

  try {
    // Inserir cliente e retornar o id
    const insertClienteSql = `
      INSERT INTO clientes (
        cliente, cidade, cep, endereco, bairro, numero, pais, uf, ativo,
        telefone, celular, datanascimento, datahoracadastro,
        naturalidade, nacionalidade, rg, sexo, estadocivil,
        cpf, cnpj, tipocliente, e_mail, ie, im, fantasia, limite
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
      RETURNING controle
    `;
    const valuesCliente = [
      cliente, cidade, cep, endereco, bairro, numero, pais, uf, ativo,
      telefone, celular, datanascimento, datahoracadastro,
      naturalidade, nacionalidade, rg, sexo, estadocivil,
      cpf, cnpj, tipocliente, e_mail, ie, im, fantasia, limite
    ];

    const { rows } = await pool.query(insertClienteSql, valuesCliente);
    const clienteId = rows[0].controle;

    // Inserir objetosVeiculos, se houver
    if (objetos && objetos.length > 0) {
      const insertObjSql = `
        INSERT INTO objetosVeiculos (
          clienteId, tipo, marca, modelo, ano, cor, placaSerie, observacoes, ativo
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'SIM')
      `;

      for (const obj of objetos) {
        await pool.query(insertObjSql, [
          clienteId,
          obj.tipo || 'OUTRO',
          obj.marca || '',
          obj.modelo || '',
          obj.ano || '',
          obj.cor || '',
          obj.placaSerie || '',
          obj.observacoes || ''
        ]);
      }
    }

    res.status(201).json({ sucesso: true, id: clienteId });
  } catch (err) {
    console.error('Erro ao inserir cliente:', err.message);
    res.status(500).json({ erro: err.message });
  }
});


app.get('/clientes', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.clientes ORDER BY controle'
    )

    res.status(200).json(rows)

  } catch (err) {
    console.error('❌ Erro ao listar clientes:', err.message)
    res.status(500).json({ erro: 'Erro ao listar clientes' })
  }
})


app.get('/clientes/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.clientes WHERE controle = $1',
      [controle]
    )

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }

    res.status(200).json(rows[0])

  } catch (err) {
    console.error('❌ Erro ao buscar cliente:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar cliente' })
  }
})


app.get('/clientes/nome/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const { rows } = await pool.query(
      'SELECT cliente FROM public.clientes WHERE controle = $1',
      [controle]
    )

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }

    res.status(200).json({ cliente: rows[0].cliente })

  } catch (err) {
    console.error('❌ Erro ao buscar nome do cliente:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar nome do cliente' })
  }
})



app.put('/clientes/:controle', async (req, res) => {
  const { controle } = req.params

  const {
    cliente, cidade, cep, endereco, bairro, numero, pais, uf,
    ativo, telefone, celular, datanascimento,
    naturalidade, nacionalidade, rg, sexo, estadocivil, cpf, cnpj,
    tipocliente, e_mail, ie, im, fantasia, limite
  } = req.body

  if (!cliente || !cep || !numero) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: cliente, cep e número.'
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE public.clientes SET
        cliente = $1,
        cidade = $2,
        cep = $3,
        endereco = $4,
        bairro = $5,
        numero = $6,
        pais = $7,
        uf = $8,
        ativo = $9,
        telefone = $10,
        celular = $11,
        datanascimento = $12,
        naturalidade = $13,
        nacionalidade = $14,
        rg = $15,
        sexo = $16,
        estadocivil = $17,
        cpf = $18,
        cnpj = $19,
        tipocliente = $20,
        e_mail = $21,
        ie = $22,
        im = $23,
        fantasia = $24,
        limite = $25
      WHERE controle = $26
      RETURNING controle
      `,
      [
        cliente,
        cidade || null,
        cep,
        endereco || null,
        bairro || null,
        numero,
        pais || null,
        uf || null,
        ativo,
        telefone || null,
        celular || null,
        datanascimento || null,
        naturalidade || null,
        nacionalidade || null,
        rg || null,
        sexo || null,
        estadocivil || null,
        cpf || null,
        cnpj || null,
        tipocliente || null,
        e_mail || null,
        ie || null,
        im || null,
        fantasia || null,
        limite || 0,
        controle
      ]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }

    res.status(200).json({
      atualizado: true,
      controle: result.rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao atualizar cliente:', err.message)
    res.status(500).json({ erro: 'Erro ao atualizar cliente' })
  }
})



app.delete('/clientes/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM public.clientes WHERE controle = $1 RETURNING controle',
      [controle]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }

    res.status(200).json({
      deletado: true,
      controle: result.rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao excluir cliente:', err.message)
    res.status(500).json({ erro: 'Erro ao excluir cliente' })
  }
})


app.get('/clientes/:id/total-aberto', async (req, res) => {
  const clienteId = req.params.id

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        COUNT(*)::int AS qtd_abertas,
        COALESCE(SUM(valor + juros + multa), 0) AS total_aberto
      FROM public.receber
      WHERE cliente_id = $1
        AND (status IS NULL OR UPPER(status) <> 'PAGO')
      `,
      [clienteId]
    )

    const { qtd_abertas, total_aberto } = rows[0]

    res.status(200).json({
      mensagem: `${qtd_abertas} parcela(s) aberta(s) — Total: R$ ${Number(total_aberto).toFixed(2)}`,
      qtd_abertas,
      total_aberto: Number(total_aberto)
    })

  } catch (err) {
    console.error('❌ Erro ao buscar total em aberto:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar total em aberto' })
  }
})


app.get('/clientes/:controle/limite', async (req, res) => {
  const { controle } = req.params

  try {
    const { rows } = await pool.query(
      `SELECT limite FROM public.clientes WHERE controle = $1`,
      [controle]
    )

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }

    res.status(200).json({
      controle,
      limite: Number(rows[0].limite)
    })

  } catch (err) {
    console.error('❌ Erro ao buscar limite:', err.message)
    res.status(500).json({ erro: 'Erro interno no servidor.' })
  }
})


// ROTAS PRODUTOS

app.post('/produtos', async (req, res) => {
  const {
    produto, codbarras, fornecedor, grupoestoque, subgrupoestoque, marca,
    precocusto, perclucro, precovenda, precorevenda, precoatacado,
    quantidade, quantidademin, quantidademax, datahoracadastro, ativop, fracionado, aplicacao, duracao
  } = req.body;

  try {
    const sql = `
      INSERT INTO produtos (
        produto, codbarras, fornecedor, grupoestoque, subgrupoestoque, marca,
        precocusto, perclucro, precovenda, precorevenda, precoatacado,
        quantidade, quantidademin, quantidademax, datahoracadastro, ativop, fracionado, aplicacao, duracao
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING controle
    `;

    const values = [
      produto, codbarras, fornecedor, grupoestoque, subgrupoestoque, marca,
      precocusto, perclucro, precovenda, precorevenda, precoatacado,
      quantidade, quantidademin, quantidademax, datahoracadastro, ativop, fracionado, aplicacao, duracao
    ];

    const { rows } = await pool.query(sql, values);
    res.status(201).json({ sucesso: true, id: rows[0].controle });
  } catch (err) {
    console.error('Erro ao inserir produto:', err.message);
    res.status(500).json({ erro: err.message });
  }
});



app.get('/produtos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.produtos
      WHERE aplicacao = $1
      ORDER BY produto
      `,
      ['PRODUTOS']
    )

    res.json(rows)
  } catch (err) {
    console.error('❌ Erro ao listar produtos:', err.message)
    res.status(500).json({ erro: 'Erro ao listar produtos' })
  }
})


app.get('/produtos/max', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT MAX(controle) AS "maxControle" FROM public.produtos'
    )

    res.json(rows[0])
  } catch (err) {
    console.error('❌ Erro ao buscar max(controle):', err.message)
    res.status(500).json({ erro: 'Erro ao buscar controle máximo' })
  }
})


app.get('/produtos/codbarras/:codbarras', async (req, res) => {
  const { codbarras } = req.params

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.produtos
      WHERE codbarras = $1
        AND ativop = 'SIM'
      LIMIT 1
      `,
      [codbarras]
    )

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error('❌ Erro ao buscar produto por código de barras:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar produto' })
  }
})


app.get('/produtos/controle/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.produtos
      WHERE controle = $1
        AND ativop = 'SIM'
        AND aplicacao = 'PRODUTOS'
      LIMIT 1
      `,
      [controle]
    )

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error('❌ Erro ao buscar produto por controle:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar produto' })
  }
})


app.get('/produtos/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.produtos
      WHERE controle = $1
      LIMIT 1
      `,
      [controle]
    )

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error('❌ Erro ao buscar produto:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar produto' })
  }
})

app.put('/produtos/:controle', async (req, res) => {
  const {
    produto, codbarras, fornecedor, grupoestoque, subgrupoestoque, marca,
    precocusto, perclucro, precovenda, precorevenda, precoatacado,
    quantidade, quantidademin, quantidademax, ativop, fracionado, aplicacao, duracao
  } = req.body

  const { controle } = req.params

  try {
    const { rowCount } = await pool.query(
      `
      UPDATE public.produtos SET
        produto = $1,
        codbarras = $2,
        fornecedor = $3,
        grupoestoque = $4,
        subgrupoestoque = $5,
        marca = $6,
        precocusto = $7,
        perclucro = $8,
        precovenda = $9,
        precorevenda = $10,
        precoatacado = $11,
        quantidade = $12,
        quantidademin = $13,
        quantidademax = $14,
        ativop = $15,
        fracionado = $16,
        aplicacao = $17,
        duracao = $18
      WHERE controle = $19
      `,
      [
        produto, codbarras, fornecedor, grupoestoque, subgrupoestoque, marca,
        precocusto, perclucro, precovenda, precorevenda, precoatacado,
        quantidade, quantidademin, quantidademax, ativop, fracionado, aplicacao, duracao,
        controle
      ]
    )

    if (rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' })
    }

    res.json({ atualizado: true, controle })
  } catch (err) {
    console.error('❌ Erro ao atualizar produto:', err.message)
    res.status(500).json({ erro: 'Erro ao atualizar produto' })
  }
})

app.delete('/produtos/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const { rowCount } = await pool.query(
      `
      DELETE FROM public.produtos
      WHERE controle = $1
      `,
      [controle]
    )

    if (rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' })
    }

    res.json({ deletado: true, controle })
  } catch (err) {
    console.error('❌ Erro ao excluir produto:', err.message)
    res.status(500).json({ erro: 'Erro ao excluir produto' })
  }
})



// Diminuir estoque

app.post('/produtos/:controle/diminuir', express.json(), async (req, res) => {
  const controle = parseInt(req.params.controle, 10)
  const quantidadeDiminuir = parseFloat(req.body.quantidade)

  if (isNaN(controle)) {
    return res.status(400).json({ erro: 'Controle inválido' })
  }

  if (isNaN(quantidadeDiminuir) || quantidadeDiminuir <= 0) {
    return res.status(400).json({ erro: 'Quantidade inválida' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 🔒 Trava o registro (evita venda dupla simultânea)
    const { rows } = await client.query(
      `
      SELECT quantidade
      FROM public.produtos
      WHERE controle = $1
      FOR UPDATE
      `,
      [controle]
    )

    if (rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    const estoqueAtual = Number(rows[0].quantidade)

    if (estoqueAtual < quantidadeDiminuir) {
      await client.query('ROLLBACK')
      return res.status(400).json({ erro: 'Estoque insuficiente' })
    }

    const novaQuantidade = estoqueAtual - quantidadeDiminuir

    await client.query(
      `
      UPDATE public.produtos
      SET quantidade = $1
      WHERE controle = $2
      `,
      [novaQuantidade, controle]
    )

    await client.query('COMMIT')

    console.log(
      `-Estoque do produto ${controle} atualizado de ${estoqueAtual.toFixed(2)} para ${novaQuantidade.toFixed(2)}`
    )

    res.json({
      mensagem: 'Estoque atualizado',
      controle,
      estoqueAnterior: estoqueAtual,
      novaQuantidade
    })

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Erro ao diminuir estoque:', err.message)
    res.status(500).json({ erro: 'Erro ao atualizar estoque' })
  } finally {
    client.release()
  }
})


app.post('/produtos/:controle/aumentar', express.json(), async (req, res) => {
  const controle = parseInt(req.params.controle, 10)
  const quantidadeAumentar = parseFloat(req.body.quantidade)

  // validações
  if (isNaN(controle)) {
    return res.status(400).json({ erro: 'Controle inválido' })
  }

  if (isNaN(quantidadeAumentar) || quantidadeAumentar <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser um número positivo' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 🔒 trava o produto
    const { rows } = await client.query(
      `
      SELECT quantidade
      FROM public.produtos
      WHERE controle = $1
      FOR UPDATE
      `,
      [controle]
    )

    if (rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    const quantidadeAtual = Number(rows[0].quantidade)
    const novaQuantidade = quantidadeAtual + quantidadeAumentar

    await client.query(
      `
      UPDATE public.produtos
      SET quantidade = $1
      WHERE controle = $2
      `,
      [novaQuantidade, controle]
    )

    await client.query('COMMIT')

    console.log(
      `+Estoque do produto ${controle} atualizado de ${quantidadeAtual.toFixed(2)} para ${novaQuantidade.toFixed(2)}`
    )

    res.json({
      mensagem: 'Estoque atualizado com sucesso',
      produto: {
        controle,
        quantidadeAnterior: quantidadeAtual,
        novaQuantidade
      }
    })

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Erro ao aumentar estoque:', err.message)
    res.status(500).json({ erro: 'Erro ao atualizar estoque' })
  } finally {
    client.release()
  }
})

// 1. **Rota para criar um novo funcionário (POST)**

async function inserirFuncionarioPadrao(pool) {
  try {
    const result = await pool.query(`
      INSERT INTO funcionarios (
        funcionariof, cpff, rgf, cepf, enderecof, bairrof, numerof,
        uff, cidadef, ativof, telefonef, celularf, datanascimentof,
        datahoracadastrof, dataadmissaof, sexof, estadocivilf,
        funcaof, e_mailf
      )
      SELECT
        $1, '', '', '', '', '', '',
        '', '', 'SIM', '', '',
        NULL,
        NOW(),      -- datahoracadastrof
        NOW(),      -- dataadmissaof
        '', '', '', ''
      WHERE NOT EXISTS (
        SELECT 1 FROM funcionarios WHERE funcionariof = $1
      )
      RETURNING controle
    `, ['FUNCIONÁRIO PADRÃO'])

    if (result.rowCount === 0) {
      //console.log('ℹ Funcionário padrão já existe.')
    } else {
      console.log('✔ Funcionário padrão inserido com sucesso. Controle:', result.rows[0].controle)
    }

  } catch (err) {
    console.error('❌ Erro ao inserir funcionário padrão:', err)
  }
}

app.post('/funcionarios', async (req, res) => {
  const {
    funcionariof, cpff, rgf, cepf, enderecof, bairrof, numerof,
    uff, cidadef, ativof, telefonef, celularf, datanascimentof,
    datahoracadastrof, dataadmissaof, sexof, estadocivilf,
    funcaof, e_mailf
  } = req.body

  try {
    if (!funcionariof || !ativof) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: funcionariof e ativof'
      })
    }

    const { rows } = await pool.query(
      `
      INSERT INTO funcionarios (
        funcionariof, cpff, rgf, cepf, enderecof, bairrof, numerof,
        uff, cidadef, ativof, telefonef, celularf, datanascimentof,
        datahoracadastrof, dataadmissaof, sexof, estadocivilf,
        funcaof, e_mailf
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19
      )
      RETURNING controle
      `,
      [
        funcionariof,
        cpff || null,
        rgf || null,
        cepf || null,
        enderecof || null,
        bairrof || null,
        numerof || null,
        uff || null,
        cidadef || null,
        ativof,
        telefonef || null,
        celularf || null,
        datanascimentof || null,
        datahoracadastrof || new Date(),
        dataadmissaof || new Date(),
        sexof || null,
        estadocivilf || null,
        funcaof || null,
        e_mailf || null
      ]
    )

    res.status(201).json({
      sucesso: true,
      controle: rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao inserir funcionário:', err.message)
    res.status(500).json({ erro: 'Erro ao inserir funcionário' })
  }
})



// 2. **Rota para listar todos os funcionários (GET)**
app.get('/funcionarios', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM funcionarios ORDER BY funcionariof'
    )

    res.status(200).json(rows)

  } catch (err) {
    console.error('❌ Erro ao buscar funcionários:', err.message)
    res.status(500).json({ error: 'Erro ao buscar funcionários' })
  }
})


// 3. **Rota para buscar um funcionário por ID (GET)**
app.get('/funcionarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM funcionarios WHERE controle = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar funcionário:', err.message);
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
});


app.get('/funcionarios/nome/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT funcionariof FROM funcionarios WHERE controle = ?';

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar funcionário:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar funcionário' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.status(200).json({ funcionariof: row.funcionariof });
  });
});


// 4. **Rota para atualizar um funcionário (PUT)**
app.put('/funcionarios/:controle', async (req, res) => {
  const { controle } = req.params

  const {
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
    dataadmissaof,
    sexof,
    estadocivilf,
    funcaof,
    e_mailf
  } = req.body

  try {
    if (!controle) {
      return res.status(400).json({ erro: 'Controle não informado' })
    }

    const result = await pool.query(
      `
      UPDATE public.funcionarios SET
        funcionariof = $1,
        cpff = $2,
        rgf = $3,
        cepf = $4,
        enderecof = $5,
        bairrof = $6,
        numerof = $7,
        uff = $8,
        cidadef = $9,
        ativof = $10,
        telefonef = $11,
        celularf = $12,
        datanascimentof = $13,
        datahoracadastrof = $14,
        dataadmissaof = $15,
        sexof = $16,
        estadocivilf = $17,
        funcaof = $18,
        e_mailf = $19
      WHERE controle = $20
      RETURNING controle
      `,
      [
        funcionariof,
        cpff || null,
        rgf || null,
        cepf || null,
        enderecof || null,
        bairrof || null,
        numerof || null,
        uff || null,
        cidadef || null,
        ativof,
        telefonef || null,
        celularf || null,
        datanascimentof || null,
        datahoracadastrof || new Date(),
        dataadmissaof || new Date(),
        sexof || null,
        estadocivilf || null,
        funcaof || null,
        e_mailf || null,
        controle
      ]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' })
    }

    res.status(200).json({
      sucesso: true,
      controle: result.rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao atualizar funcionário:', err.message)
    res.status(500).json({ erro: 'Erro ao atualizar funcionário' })
  }
})


// 5. **Rota para excluir um funcionário (DELETE)**
app.delete('/funcionarios/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM public.funcionarios WHERE controle = $1 RETURNING controle',
      [controle]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' })
    }

    res.status(200).json({
      sucesso: true,
      controle: result.rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao excluir funcionário:', err.message)
    res.status(500).json({ erro: 'Erro ao excluir funcionário' })
  }
})


// Rota para fornecedores**

app.post('/fornecedores', async (req, res) => {
  const {
    fornecedor, cnpj, ie, endereco, bairro, cidade, uf, cep, numero,
    telefone, celular, email, datahoracadastrofo, observacoes, ativo
  } = req.body

  if (!fornecedor || !ativo) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: fornecedor e ativo'
    })
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO public.fornecedores (
        fornecedor, cnpj, ie, endereco, bairro, cidade, uf, cep, numero,
        telefone, celular, email, datahoracadastrofo, observacoes, ativo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15
      )
      RETURNING controle
      `,
      [
        fornecedor,
        cnpj || null,
        ie || null,
        endereco || null,
        bairro || null,
        cidade || null,
        uf || null,
        cep || null,
        numero || null,
        telefone || null,
        celular || null,
        email || null,
        datahoracadastrofo || new Date(),
        observacoes || null,
        ativo
      ]
    )

    res.status(201).json({
      sucesso: true,
      controle: rows[0].controle,
      fornecedor
    })

  } catch (err) {
    console.error('❌ Erro ao inserir fornecedor:', err.message)
    res.status(500).json({ erro: 'Erro ao inserir fornecedor' })
  }
})


app.get('/fornecedores', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.fornecedores ORDER BY controle'
    )

    res.status(200).json(rows)

  } catch (err) {
    console.error('❌ Erro ao listar fornecedores:', err.message)
    res.status(500).json({ erro: 'Erro ao listar fornecedores' })
  }
})


app.get('/fornecedores/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.fornecedores WHERE controle = $1',
      [controle]
    )

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Fornecedor não encontrado.' })
    }

    res.status(200).json(rows[0])

  } catch (err) {
    console.error('❌ Erro ao buscar fornecedor:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar fornecedor' })
  }
})


app.put('/fornecedores/:controle', async (req, res) => {
  const { controle } = req.params

  const {
    fornecedor, cnpj, ie, endereco, bairro, cidade, uf, cep, numero,
    telefone, celular, email, datahoracadastrofo, observacoes, ativo
  } = req.body

  if (!fornecedor || !ativo) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: fornecedor e ativo.'
    })
  }

  try {
    const result = await pool.query(
      `
      UPDATE public.fornecedores SET
        fornecedor = $1,
        cnpj = $2,
        ie = $3,
        endereco = $4,
        bairro = $5,
        cidade = $6,
        uf = $7,
        cep = $8,
        numero = $9,
        telefone = $10,
        celular = $11,
        email = $12,
        datahoracadastrofo = $13,
        observacoes = $14,
        ativo = $15
      WHERE controle = $16
      RETURNING controle
      `,
      [
        fornecedor,
        cnpj || null,
        ie || null,
        endereco || null,
        bairro || null,
        cidade || null,
        uf || null,
        cep || null,
        numero || null,
        telefone || null,
        celular || null,
        email || null,
        datahoracadastrofo || new Date(),
        observacoes || null,
        ativo,
        controle
      ]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Fornecedor não encontrado.' })
    }

    res.status(200).json({
      atualizado: true,
      controle: result.rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao atualizar fornecedor:', err.message)
    res.status(500).json({ erro: 'Erro ao atualizar fornecedor' })
  }
})


app.delete('/fornecedores/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM public.fornecedores WHERE controle = $1 RETURNING controle',
      [controle]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Fornecedor não encontrado.' })
    }

    res.status(200).json({
      deletado: true,
      controle: result.rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao excluir fornecedor:', err.message)
    res.status(500).json({ erro: 'Erro ao excluir fornecedor' })
  }
})



async function inserirFornecedorPadrao(pool) {
  try {
    const check = await pool.query(
      `SELECT controle FROM fornecedores WHERE fornecedor = $1`,
      ['FORNECEDOR PADRÃO']
    )
    if (check.rows.length > 0) {
    //console.log('Fornecedor padrão já existe.')
      return
    }    
    await pool.query(
      `
      INSERT INTO fornecedores (
        fornecedor, cnpj, ie, endereco, bairro, cidade, uf, cep,
        numero, telefone, celular, email, datahoracadastrofo,
        observacoes, ativo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15
      )
      `,
      [
        'FORNECEDOR PADRÃO',
        '', // cnpj
        '', // ie
        '', // endereco
        '', // bairro
        '', // cidade
        '', // uf
        '', // cep
        '', // numero
        '', // telefone
        '', // celular
        '', // email
        new Date(), // datahoracadastrofo
        '', // observacoes
        'SIM' // ativo
      ]
    )

    console.log('✔ Fornecedor padrão inserido com sucesso.')

  } catch (err) {
    console.error('❌ Erro ao inserir fornecedor padrão:', err.message)
  }
}


// chamar após abrir o banco
inserirFornecedorPadrao(pool);


app.post('/produtos/repor-em-lote', express.json(), async (req, res) => {
  const itens = req.body;   
  const aumentarEstoque = (controle, quantidade) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT quantidade FROM produtos WHERE controle = ?', [controle], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Produto não encontrado'));

        const quantidadeAumentar = parseFloat(quantidade);
        const novaQuantidade = row.quantidade + quantidadeAumentar;

        db.run('UPDATE produtos SET quantidade = ? WHERE controle = ?', [novaQuantidade, controle], (err2) => {
          if (err2) return reject(err2);
          console.log(`+Estoque do produto ${controle} atualizado de ${row.quantidade.toFixed(2)} para ${novaQuantidade.toFixed(2)}`);
          resolve();
        });
      });
    });
  };
  try {
    for (const item of itens) {
      await aumentarEstoque(item.controle, item.quantidade);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao repor em lote:', err.message);
    res.status(500).json({ erro: 'Erro ao repor produtos', detalhe: err.message });
  }
});

app.post('/produtos/diminuir-em-lote', express.json(), async (req, res) => {
  const itens = req.body; 
  const diminuirEstoque = (controle, quantidade) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT quantidade FROM produtos WHERE controle = ?', [controle], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error(`Produto ${controle} não encontrado`));

        if (row.quantidade < quantidade) {
          return reject(new Error(`Estoque insuficiente para o produto ${controle}`));
        }
        const quantidadeDiminuir = parseFloat(quantidade);
        const novaQuantidade = row.quantidade - quantidadeDiminuir;
        db.run('UPDATE produtos SET quantidade = ? WHERE controle = ?', [novaQuantidade, controle], (err2) => {
          if (err2) return reject(err2);
          console.log(`-Estoque do produto ${controle} atualizado de ${row.quantidade.toFixed(2)} para ${novaQuantidade.toFixed(2)}`
);

          resolve();
        });
      });
    });
  };
  try {
    for (const item of itens) {
      await diminuirEstoque(item.controle, item.quantidade);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao diminuir em lote:', err.message);
    res.status(500).json({ erro: 'Erro ao diminuir produtos', detalhe: err.message });
  }
});
//ROTAS RECEBER

app.post('/receber', async (req, res) => {
  const {
    cliente_id,
    funcionario,
    descricao,
    datavencimento,
    datapagamento,
    datacadastro,
    valororiginal,
    valor,
    valorpago,
    numeroparcela,
    totalparcelas,
    juros,
    multa,
    status
  } = req.body

  try {
    const result = await pool.query(
      `
      INSERT INTO public.receber (
        cliente_id,
        funcionario,
        descricao,
        datavencimento,
        datapagamento,
        datacadastro,
        valororiginal,
        valor,
        valorpago,
        numeroparcela,
        totalparcelas,
        juros,
        multa,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14
      )
      RETURNING controle
      `,
      [
        cliente_id,
        funcionario,
        descricao,
        datavencimento,
        datapagamento,
        datacadastro,
        valororiginal,
        valor,
        valorpago,
        numeroparcela,
        totalparcelas,
        juros,
        multa,
        status
      ]
    )

    res.status(201).json({
      message: 'Movimentação salva com sucesso',
      controle: result.rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao inserir movimentação:', err.message)
    res.status(500).json({ error: 'Erro ao salvar movimentação' })
  }
})


app.get('/receber', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        c.cliente AS nomecliente
      FROM receber r
      LEFT JOIN clientes c
        ON r.cliente_id = c.controle
      ORDER BY controle
    `)

    res.json(result.rows)

  } catch (err) {
    console.error('❌ Erro ao buscar dados de receber:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar dados' })
  }
})

app.delete('/receber/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM receber WHERE controle = $1',
      [controle]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' })
    }

    res.status(200).json({ message: 'Movimentação deletada com sucesso' })

  } catch (err) {
    console.error('❌ Erro ao deletar movimentação:', err.message)
    res.status(500).json({ error: 'Erro ao deletar movimentação' })
  }
})


app.put('/:cliente_id/pagar-parcelas', async (req, res) => {
  const clienteId = req.params.cliente_id;
  let { parcelasIds, valorAbono } = req.body;

  // ❌ valida parcelasIds
  if (!Array.isArray(parcelasIds) || parcelasIds.length === 0) {
    return res.status(400).json({ error: 'Nenhuma parcela selecionada.' });
  }

  // ❌ converte valorAbono para número correto
  if (typeof valorAbono === 'string') {
    // remove pontos de milhares e transforma vírgula em ponto
    valorAbono = parseFloat(valorAbono.replace(/\./g, '').replace(',', '.'));
  }

  if (isNaN(valorAbono) || valorAbono <= 0) {
    return res.status(400).json({ error: 'Valor de abono inválido.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 🔹 seleciona parcelas abertas
    const selectSql = `
      SELECT controle, valororiginal, juros, multa, COALESCE(valorpago, 0) AS valorpago
      FROM receber
      WHERE cliente_id = $1
        AND controle = ANY($2::int[])
        AND status = 'ABERTO'
    `;
    const { rows } = await client.query(selectSql, [clienteId, parcelasIds]);

    if (rows.length !== parcelasIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Algumas parcelas não existem ou já estão pagas.'
      });
    }

    // 🔹 calcula valor total selecionado
    const totalSelecionado = rows.reduce((total, row) =>
      total + (row.valororiginal + row.juros + row.multa - row.valorpago)
    , 0);

    if (Math.abs(totalSelecionado - valorAbono) > 0.01) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `O valor total selecionado é R$${totalSelecionado.toFixed(2)} e não bate com o valor informado.`
      });
    }

    const dataHoje = new Date().toISOString().split('T')[0];

    // 🔹 atualiza todas as parcelas de uma vez
    const controles = rows.map(r => r.controle);
    await client.query(`
      UPDATE receber
      SET valorpago = valororiginal + juros + multa,
          status = 'PAGO',
          datapagamento = $1
      WHERE controle = ANY($2::int[])
    `, [dataHoje, controles]);

    await client.query('COMMIT');

    res.json({
      message: 'Parcelas pagas com sucesso.',
      quantidade: rows.length,
      total: totalSelecionado
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao pagar parcelas:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar parcelas.' });
  } finally {
    client.release();
  }
});



//ROTAS PAGAR

app.post('/pagar', async (req, res) => {
  const {
    fornecedor_id,
    funcionario,
    descricao,
    datavencimento,
    datapagamento,
    datacadastro,
    valororiginal,
    valor,
    valorpago,
    numeroparcela,
    totalparcelas,
    juros,
    multa,
    status
  } = req.body

  if (
    !fornecedor_id ||
    !datavencimento ||
    !datacadastro ||
    !valororiginal ||
    !numeroparcela ||
    !totalparcelas ||
    !status
  ) {
    return res.status(400).json({ erro: 'Dados obrigatórios faltando.' })
  }

  const sql = `
    INSERT INTO pagar (
      fornecedor_id,
      funcionario,
      descricao,
      datavencimento,
      datapagamento,
      datacadastro,
      valororiginal,
      valor,
      valorpago,
      numeroparcela,
      totalparcelas,
      juros,
      multa,
      status
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12, $13, $14
    )
    RETURNING controle
  `

  const params = [
    fornecedor_id,
    funcionario || '',
    descricao || '',
    datavencimento,
    datapagamento || null,
    datacadastro,
    valororiginal,
    valor ?? valororiginal,
    valorpago ?? 0,
    numeroparcela,
    totalparcelas,
    juros ?? 0,
    multa ?? 0,
    status
  ]

  try {
    const { rows } = await pool.query(sql, params)

    res.status(201).json({
      sucesso: true,
      controle: rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao inserir parcela em pagar:', err.message)
    res.status(500).json({ erro: 'Erro ao inserir parcela' })
  }
})
//Comentario
app.get('/pagar', async (req, res) => {
  const sql = `
    SELECT
      pagar.*,
      fornecedores.fornecedor AS nomefornecedor
    FROM pagar
    LEFT JOIN fornecedores
      ON pagar.fornecedor_id = fornecedores.controle
    ORDER BY controle
  `

  try {
    const { rows } = await pool.query(sql)
    res.json(rows)

  } catch (err) {
    console.error('❌ Erro ao buscar dados de pagar:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar dados' })
  }
})


app.delete('/pagar/:controle', async (req, res) => {
  const { controle } = req.params

  const sql = `
    DELETE FROM pagar
    WHERE controle = $1
    RETURNING controle
  `

  try {
    const { rowCount } = await pool.query(sql, [controle])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' })
    }

    res.status(200).json({ message: 'Movimentação deletada com sucesso', controle })

  } catch (err) {
    console.error('❌ Erro ao deletar movimentação:', err.message)
    res.status(500).json({ error: 'Erro ao deletar movimentação' })
  }
})


app.put('/:fornecedor_id/pagarparcelas', async (req, res) => {
  const fornecedorId = req.params.fornecedor_id;
  let { parcelasIds, valorAbono } = req.body;

  if (!Array.isArray(parcelasIds) || parcelasIds.length === 0) {
    return res.status(400).json({ error: 'Nenhuma parcela selecionada.' });
  }

  // converte valorAbono para número
  if (typeof valorAbono === 'string') {
    valorAbono = parseFloat(valorAbono.replace(/\./g, '').replace(',', '.'));
  }

  if (isNaN(valorAbono) || valorAbono <= 0) {
    return res.status(400).json({ error: 'Valor de abono inválido.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const selectSql = `
      SELECT controle, valororiginal, juros, multa, COALESCE(valorpago,0) AS valorpago
      FROM pagar
      WHERE fornecedor_id = $1
        AND controle = ANY($2::int[])
        AND status = 'ABERTO'
    `;
    const { rows } = await client.query(selectSql, [fornecedorId, parcelasIds]);

    if (rows.length !== parcelasIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Algumas parcelas não existem ou já estão pagas.'
      });
    }

    const totalSelecionado = rows.reduce(
      (total, row) => total + (row.valororiginal + row.juros + row.multa - row.valorpago),
      0
    );

    if (Math.abs(totalSelecionado - valorAbono) > 0.01) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `O valor total selecionado é R$${totalSelecionado.toFixed(2)} e não bate com o valor informado.`
      });
    }

    const dataHoje = new Date().toISOString().split('T')[0];
    const controles = rows.map(r => r.controle);

    await client.query(`
      UPDATE pagar
      SET valorpago = valororiginal + juros + multa,
          status = 'PAGO',
          datapagamento = $1
      WHERE controle = ANY($2::int[])
    `, [dataHoje, controles]);

    await client.query('COMMIT');

    res.json({
      message: 'Parcelas pagas com sucesso.',
      quantidade: rows.length,
      total: totalSelecionado
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao pagar parcelas:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar parcelas.' });
  } finally {
    client.release();
  }
});


//ROTAS DE CAIXA

app.post('/caixa', async (req, res) => {
  const {
    cod_cliente, cliente,
    cod_funcionario, funcionario,
    cod_fornecedor, fornecedor,
    descricao, datacadastro,
    especies, valorentrada, valorsaida
  } = req.body

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO public.caixa (
        cod_cliente, cliente,
        cod_funcionario, funcionario,
        cod_fornecedor, fornecedor,
        descricao, datacadastro,
        especies, valorentrada, valorsaida
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING controle
      `,
      [
        cod_cliente, cliente,
        cod_funcionario, funcionario,
        cod_fornecedor, fornecedor,
        descricao,
        datacadastro || new Date(), // default seguro
        especies, valorentrada, valorsaida
      ]
    )

    res.json({
      mensagem: 'Registro inserido com sucesso',
      controle: rows[0].controle
    })

  } catch (err) {
    console.error('❌ Erro ao inserir no caixa:', err.message)
    res.status(500).json({ erro: 'Erro ao inserir registro no caixa' })
  }
})


app.get('/caixa', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.caixa
      ORDER BY datacadastro ASC
      `
    )

    res.json(rows)
  } catch (err) {
    console.error('❌ Erro ao listar caixa:', err.message)
    res.status(500).json({ erro: 'Erro ao buscar registros do caixa' })
  }
})


app.delete('/caixa/:controle', async (req, res) => {
  const { controle } = req.params

  try {
    const { rowCount } = await pool.query(
      `
      DELETE FROM public.caixa
      WHERE controle = $1
      `,
      [controle]
    )

    if (rowCount === 0) {
      return res.status(404).json({ erro: 'Registro não encontrado' })
    }

    res.json({ mensagem: 'Registro excluído com sucesso' })

  } catch (err) {
    console.error('❌ Erro ao excluir registro do caixa:', err.message)
    res.status(500).json({ erro: 'Erro ao excluir registro do caixa' })
  }
})

// ---------- FUNÇÃO PARA CALCULAR DIAS DE ATRASO ----------
function calcularDiasAtraso(dataVencimento) {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  const diffDias = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
  return diffDias > 0 ? diffDias : 0;
}

// ---------- FUNÇÃO PARA CALCULAR JUROS E MULTA ----------
function calcularJurosEMulta(valorOriginal, valorPago = 0, diasAtraso, taxaMulta, taxaJurosDiaria) {
  const saldoDevedor = Math.max(0, valorOriginal - valorPago);
  if (saldoDevedor <= 0 || diasAtraso <= 0) return { multa: 0, juros: 0 };

  return {
    multa: parseFloat((saldoDevedor * taxaMulta).toFixed(2)),
    juros: parseFloat((saldoDevedor * taxaJurosDiaria * diasAtraso).toFixed(2)),
  };
}

// ---------- FUNÇÃO GENÉRICA PARA ATUALIZAR CONTAS ----------
async function atualizarJurosEMultas(tabela = 'receber') {
  const taxaMulta = 0.02;
  const taxaJurosDiaria = 0.02 / 30;

  try {
    const { rows } = await pool.query(`
      SELECT controle, valororiginal, datavencimento, valorpago
      FROM ${tabela}
      WHERE status = 'ABERTO'
    `);

    for (const row of rows) {
      const { controle, valororiginal, datavencimento, valorpago } = row;
      const diasAtraso = calcularDiasAtraso(datavencimento);

      if (diasAtraso > 0) {
        const { multa, juros } = calcularJurosEMulta(valororiginal, valorpago, diasAtraso, taxaMulta, taxaJurosDiaria);

        await pool.query(
          `UPDATE ${tabela} SET juros = $1, multa = $2 WHERE controle = $3`,
          [juros, multa, controle]
        );

        console.log(`Conta ${tabela} ${controle} atualizada: Juros R$${juros.toFixed(2)}, Multa R$${multa.toFixed(2)}`);
      }
    }

    console.log(`Atualização de juros e multas para '${tabela}' finalizada.`);
  } catch (err) {
    console.error(`Erro ao atualizar contas '${tabela}':`, err.message);
  }
}


atualizarJurosEMultas('receber');
atualizarJurosEMultas('pagar');


process.on('exit', () => pool.end());
process.on('SIGINT', () => {
  pool.end().then(() => process.exit(0));
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`)
  await carregarBanco(pool) // roda banco.sql se existir
  await inserirFuncionarioPadrao(pool)
})