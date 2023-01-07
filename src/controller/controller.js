let database = require("../database/database");
const functions = require("../function/generic-functions");

const listBankAccounts = (req, res) => {
  res.json(database.contas);
};

const createBankAccount = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } =
    req.body;
  const accountExists = functions.validateUser(database, cpf, email);

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha)
    return res.status(400).json({
      mensagem: "Todos os campos devem ser informados!",
    });

  if (accountExists)
    return res.status(403).json({
      mensagem: "Já existe uma conta com o cpf ou e-mail informado!",
    });

  const newUser = {
    numero: Number(new Date()).toString().slice(3),
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha
    },
  };

  database.contas.push(newUser);
  functions.storeJsonData(database);
  res.status(204).json();
};

const changeAccountData = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
  const { numeroConta } = req.params;

  if (functions.validateUser(database, cpf, email, numeroConta))
    return res.status(403).json({
      mensagem: "O CPF/EMAIL informado já existe cadastrado!",
    });

  if (!functions.searchAccountAndChange(database, nome, cpf, data_nascimento, telefone, email, senha, numeroConta)) {
    return res.status(404).json({
      mensagem: "Conta bancária não encontada!",
    });
  } else {
    functions.storeJsonData(database);
    return res.status(204).json();
  }
};

const deleteAccount = (req, res) => {
  const { numeroConta } = req.params;
  const selectedAccount = functions.validateAccount(database, numeroConta);

  if (selectedAccount.saldo > 0) {
    return res.status(403).json({
      mensagem: "A conta só pode ser removida se o saldo for zero!",
    });
  } else if (selectedAccount.length === 0) {
    return res.status(404).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  database.contas = database.contas.filter((conta) => conta.numero !== selectedAccount.numero)
  functions.storeJsonData(database);
  res.status(204).json();
};

const deposit = (req, res) => {
  const { numero_conta, valor } = req.body;
  const selectedAccount = functions.validateAccount(database, numero_conta);

  if (!numero_conta || !valor)
    return res.status(403).json({
      mensagem: "O número da conta e o valor são obrigatórios!",
    });

  if (valor < 0)
    return res.status(403).json({
      mensagem: "Valor não pode ser menor que zero!",
    });

  if (selectedAccount.usuario !== undefined) {
    selectedAccount.saldo += valor;
    database.depositos.push({
      data: functions.formatDate(),
      numero_conta,
      valor,
    });
  } else {
    res.status(404).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  functions.storeJsonData(database);
  res.status(204).json();
};

const withdraw = (req, res) => {
  const { numero_conta, valor, senha } = req.body;
  const selectedAccount = functions.validateAccount(database, numero_conta);
  if (!numero_conta || !valor || !senha)
    return res.status(403).json({
      mensagem: "Preencha todos os campos!",
    });
  if (!selectedAccount.numero)
    res.status(404).json({
      mensagem: "Conta bancária não encontada!",
    });

  if (senha !== selectedAccount.usuario.senha)
    return res.status(401).json({
      mensagem: "Senha inválida!",
    });

  if (valor !== 0 && valor <= selectedAccount.saldo) {
    selectedAccount.saldo -= valor;
    database.saques.push({
      data: functions.formatDate(),
      numero_conta,
      valor,
    });
  } else if (valor > selectedAccount.saldo) {
    return res.status(401).json({
      mensagem: "Saldo insuficiente!",
    });
  } else {
    return res.status(403).json({
      mensagem: "Valor não pode ser menor que zero!",
    });
  }
  functions.storeJsonData(database)
  res.status(204).json();
};

const transfer = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, senha, valor } = req.body;
  const contaDestino = functions.validateAccount(database, numero_conta_destino);
  let origin = [];
  let destiny = [];

  if (!numero_conta_origem || !numero_conta_destino || !senha || !valor)
    return res.status(400).json({
      mensagem: "Preencha todos os campos!",
    });

  if (!contaDestino.numero)
    return res.status(404).json({
      mensagem: "Conta Destino não encontada!",
    });
  database.contas.find((account) => {
    if (account.numero === numero_conta_origem) {
      origin = account;

    }

    if (account.numero === numero_conta_destino) {
      destiny = account;
    }
  });
  if (origin.saldo >= valor) {
    origin.saldo -= valor;
    destiny.saldo += valor;

    database.transferencias.push({
      data: functions.formatDate(),
      numero_conta_origem,
      numero_conta_destino,
      valor,
    });
  } else {
    return res.status(403).json({
      mensagem: "Saldo insuficiente!",
    });
  }

  functions.storeJsonData(database);
  return res.status(204).json();
};

const consultBalance = (req, res) => {
  const { numero_conta, senha } = req.query;
  const selectedAccount = functions.validateAccount(database, numero_conta);

  if (selectedAccount.length === 0) {
    return res.status(404).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  if (selectedAccount) {
    if (selectedAccount.usuario.senha !== senha) {
      return res.status(401).json({
        mensagem: "Senha inválida!",
      });
    }
  }
  return res.json(`saldo: ${selectedAccount.saldo}`)
};

const extract = (req, res) => {
  const { numero_conta, senha } = req.query;
  const selectedAccount = functions.validateAccount(database, numero_conta);

  if (!selectedAccount.usuario)
    return res.status(404).json({
      mensagem: "Conta bancária não encontada!",
    });

  if (selectedAccount.usuario.senha !== senha)
    return res.status(401).json({
      mensagem: "Senha inválida!",
    });

  return res.status(201).json({
    saques: database.saques.filter((withdraw) => withdraw.numero_conta === numero_conta),
    depositos: database.depositos.filter((deposit) => deposit.numero_conta === numero_conta),
    transferencias_enviadas: database.transferencias.filter((transfer) => transfer.numero_conta_origem === numero_conta),
    transferencias_recebidas: database.transferencias.filter((transfer) => transfer.numero_conta_destino === numero_conta),

  });
};

module.exports = {
  listBankAccounts,
  createBankAccount,
  changeAccountData,
  deleteAccount,
  withdraw,
  deposit,
  transfer,
  consultBalance,
  extract,
};
