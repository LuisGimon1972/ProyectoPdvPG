-- =========================
-- CAIXA
-- =========================
CREATE TABLE IF NOT EXISTS caixa (
  controle SERIAL PRIMARY KEY,
  cod_cliente INTEGER,
  cliente TEXT,
  cod_funcionario INTEGER NOT NULL,
  funcionario TEXT,
  cod_fornecedor INTEGER,
  fornecedor TEXT,
  descricao TEXT,
  datacadastro TIMESTAMP,
  especies TEXT,
  valorentrada NUMERIC(15,2),
  valorsaida NUMERIC(15,2)
);

-- =========================
-- CLIENTES
-- =========================
CREATE TABLE IF NOT EXISTS clientes (
  controle SERIAL PRIMARY KEY,
  cliente TEXT NOT NULL,
  cidade TEXT,
  cep TEXT,
  endereco TEXT,
  bairro TEXT,
  numero TEXT,
  pais TEXT,
  uf TEXT,
  ativo TEXT,
  telefone TEXT,
  celular TEXT,
  datanascimento DATE,
  datahoracadastro TIMESTAMP,
  naturalidade TEXT,
  nacionalidade TEXT,
  rg TEXT,
  sexo TEXT,
  estadocivil TEXT,
  cpf TEXT,
  cnpj TEXT,
  tipocliente TEXT,
  e_mail TEXT,
  ie TEXT,
  im TEXT,
  fantasia TEXT,
  limite NUMERIC(15,2)
);

-- =========================
-- EMITENTE
-- =========================
CREATE TABLE IF NOT EXISTS emitente (
  controle SERIAL PRIMARY KEY,
  emitente TEXT NOT NULL,
  cidade TEXT,
  cep TEXT,
  endereco TEXT,
  bairro TEXT,
  numero TEXT,
  pais TEXT,
  uf TEXT,
  ativo TEXT,
  telefone TEXT,
  celular TEXT,
  datanascimento DATE,
  datahoracadastro TIMESTAMP,
  naturalidade TEXT,
  nacionalidade TEXT,
  rg TEXT,
  sexo TEXT,
  estadocivil TEXT,
  cpf TEXT,
  cnpj TEXT,
  tipocliente TEXT,
  e_mail TEXT,
  ie TEXT,
  im TEXT,
  suframa TEXT,
  crt TEXT,
  segmento TEXT,
  faixa TEXT,
  fantasia TEXT,
  tipodebusca TEXT
);

-- =========================
-- FORNECEDORES
-- =========================
CREATE TABLE IF NOT EXISTS fornecedores (
  controle SERIAL PRIMARY KEY,
  fornecedor TEXT NOT NULL,
  cnpj TEXT,
  ie TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  uf TEXT,
  cep TEXT,
  numero TEXT,
  telefone TEXT,
  celular TEXT,
  email TEXT,
  datahoracadastrofo TIMESTAMP,
  observacoes TEXT,
  ativo TEXT NOT NULL
);

-- =========================
-- FUNCIONARIOS
-- =========================
CREATE TABLE IF NOT EXISTS funcionarios (
  controle SERIAL PRIMARY KEY,
  funcionariof TEXT NOT NULL,
  cpff TEXT,
  rgf TEXT,
  cepf TEXT,
  enderecof TEXT,
  bairrof TEXT,
  numerof TEXT,
  uff TEXT,
  cidadef TEXT,
  ativof TEXT,
  telefonef TEXT,
  celularf TEXT,
  datanascimentof DATE,
  datahoracadastrof TIMESTAMP,
  dataadmissaof DATE,
  sexof TEXT,
  estadocivilf TEXT,
  funcaof TEXT,
  e_mailf TEXT
);

-- =========================
-- PRODUTOS
-- =========================
CREATE TABLE IF NOT EXISTS produtos (
  controle SERIAL PRIMARY KEY,
  produto TEXT NOT NULL,
  codbarras BIGINT,
  fornecedor TEXT,
  grupoestoque TEXT,
  subgrupoestoque TEXT,
  marca TEXT,
  precocusto NUMERIC(15,2),
  perclucro NUMERIC(10,2),
  precovenda NUMERIC(15,2) NOT NULL,
  precorevenda NUMERIC(15,2),
  precoatacado NUMERIC(15,2),
  quantidade NUMERIC(15,3),
  quantidademin NUMERIC(15,3),
  quantidademax NUMERIC(15,3),
  datahoracadastro TIMESTAMP,
  ativop TEXT NOT NULL,
  fracionado TEXT,
  aplicacao TEXT NOT NULL,
  duracao NUMERIC(10,2)
);

-- =========================
-- PAGAR
-- =========================
CREATE TABLE IF NOT EXISTS pagar (
  controle SERIAL PRIMARY KEY,
  fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(controle),
  funcionario TEXT,
  descricao TEXT,
  datavencimento TIMESTAMP,
  datapagamento TIMESTAMP,
  datacadastro TIMESTAMP,
  valororiginal NUMERIC(15,2),
  valor NUMERIC(15,2),
  valorpago NUMERIC(15,2),
  numeroparcela INTEGER,
  totalparcelas INTEGER,
  juros NUMERIC(15,2),
  multa NUMERIC(15,2),
  status TEXT
);

-- =========================
-- RECEBER
-- =========================
CREATE TABLE IF NOT EXISTS receber (
  controle SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(controle),
  funcionario TEXT,
  descricao TEXT,
  datavencimento TIMESTAMP,
  datapagamento TIMESTAMP,
  datacadastro TIMESTAMP,
  valororiginal NUMERIC(15,2),
  valor NUMERIC(15,2),
  valorpago NUMERIC(15,2),
  numeroparcela INTEGER,
  totalparcelas INTEGER,
  juros NUMERIC(15,2),
  multa NUMERIC(15,2),
  status TEXT
);

-- =========================
-- USUÁRIOS
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  senha TEXT NOT NULL,
  email TEXT
);