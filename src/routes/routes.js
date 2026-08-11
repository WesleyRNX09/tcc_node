const express = require('express');
const router = express.Router();

const ClientesController = require('../controllers/clientes');

router.get('/clientes', ClientesController.listarClientes);
router.post('/clientes', ClientesController.cadastrarCliente);
router.patch('/clientes/:id', ClientesController.editarCliente);

module.exports = router;