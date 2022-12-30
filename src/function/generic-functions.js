const validateUser = (database, cpf, email, account_Number) => {
  let accountExists = false;

  database.contas.find((account) => {
    if (account_Number !== account.numero && (account.usuario.cpf === cpf || account.usuario.email === email))
      accountExists = true;
  });

  return accountExists;
};
const searchAccountAndChange = (database, name, cpf, data_nascimento, telefone, email, senha, numeroConta) => {
  let changedAccount = false;

  database.contas.find((account) => {
    if (account.numero === numeroConta) {
      account.usuario = {
        nome: name ?? account.usuario.nome,
        cpf: cpf ?? account.usuario.cpf,
        data_nascimento: data_nascimento ?? account.usuario.data_nascimento,
        telefone: telefone ?? account.usuario.telefone,
        email: email ?? account.usuario.email,
        senha: senha ?? account.usuario.senha,
      };
      changedAccount = true;
    }
  });

  return changedAccount;
};
const validateAccount = (database, number,) => {
  let selectedAccount = [];

  database.contas.find((account) => {
    if (account.numero === number) {
      selectedAccount = account;
    }
  });
  
  return selectedAccount;
};
const storeJsonData = async (database) => {
  try {
    const fsPromises = require("fs/promises");
    await fsPromises.writeFile(
      "./src/database/database.json",
      JSON.stringify(database)
    );
  } 
  catch (erro) {
    console.error(erro);
  }
};
const formatDate = () => {
  try {
    const { format } = require("date-fns");
    return format(new Date(), "MM-dd-yyyy HH:mm:ss");
  }
  catch (erro) {
    console.error(erro);
  }
};

module.exports = {
  validateUser,
  validateAccount,
  formatDate,
  storeJsonData,
  searchAccountAndChange,
};
