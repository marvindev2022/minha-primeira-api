const middleware = require("../middleware/middleware");
const controller = require("../controller/controller");
const express = require("express");
const router = express();

router.use(express.json())

router.get("/contas/", middleware.validateAdmPassword, controller.listBankAccounts);
router.get("/transacoes/saldo/", controller.consultBalance);
router.get("/transacoes/extrato/", controller.extract);

router.post("/contas", middleware.validateCpf, controller.createBankAccount);
router.post("/transacoes/depositar/", controller.deposit);
router.post("/transacoes/sacar/", controller.withdraw);
router.post("/transacoes/transferir", middleware.validateUserPassword, controller.transfer);

router.put("/contas/:numeroConta/usuario", middleware.searchAccount, controller.changeAccountData);

router.delete("/contas/:numeroConta", middleware.searchAccount, controller.deleteAccount);

module.exports = router;


