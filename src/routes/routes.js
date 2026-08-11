const express = require('express');
const router = express.Router();

const ClientesController = require('../controllers/clientes');

router.get('/clientes', ClientesController.listarClientes);
router.post('/clientes', ClientesController.cadastrarCliente);
router.patch('/clientes/:id', ClientesController.editarCliente);
router.delete('/clientes/:id', ClientesController.apagarCliente);

const VeiculosController = require('../controllers/veiculos');  

router.get('/veiculos', VeiculosController.listarVeiculos);
router.post('/veiculos', VeiculosController.cadastrarVeiculo);

module.exports = router;