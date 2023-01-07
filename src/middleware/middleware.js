const { contas, banco } = require("../database/database.json");

const validateAdmPassword = (req, res, next) => {
  const { senha_banco } = req.query;

  if (!senha_banco)
    return res.status(401).json({
      mensagem: "A senha do banco deve ser informada!",
    });

  if (senha_banco !== banco.senha)
    return res.status(401).json({
      mensagem: "A senha informada é inválida!",
    });

  next();
};
const validateUserPassword = (req, res, next) => {
  const { numero_conta_origem, senha } = req.body;
  if (!numero_conta || !senha)
    return res.status(401).json({
      mensagem: "Preencha todos os campos!",
    });
  contas.find((account) => {
    if (account.numero === numero_conta_origem) {
      if (account.usuario.senha != senha) {
        return res.status(401).json({
          mensagem: "Senha invalida!",
        });
      } else {
        next();
      }
    }
  });

  return res.status(404).json({
    mensagem: "Conta não localizada"
  })
};
const validateCpf = (req, res, next) => {
  const { cpf } = req.body;

  if (isNaN(Number(cpf)))
    return res.status(400).json({
      mmensagem: "CPF deve conter apenas numeros!",
    });

  if (cpf.toString().trim().length !== 11)
    return res.status(400).json({
      mensagem: "Cpf deve conter 11 dígitos",
    });

  next();
};
const searchAccount = (req, res, next) => {
  const params = req.params.numeroConta;

  if (!params) {
    return res.status(400).json({
      mensagem: "Informe numero da conta!",
    });
  }

  if (isNaN(Number(params))) {
    return res.status(400).json({
      mensagem: "Informe um numero de conta valido",
    });
  }

  next();
};

module.exports = {
  validateAdmPassword,
  validateCpf,
  validateUserPassword,
  searchAccount,
};
