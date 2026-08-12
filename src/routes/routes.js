const express = require('express');
const router = express.Router();

const ClientesController = require('../controllers/clientes');
const VeiculosController = require('../controllers/veiculos');
const FuncionariosController = require('../controllers/funcionario');
const OrdensServicoController = require('../controllers/ordensServico');
const ProblemasController = require('../controllers/problemas');
const ServicosController = require('../controllers/servicos');
const PecasController = require('../controllers/pecas');

const ItensOsController = require('../controllers/itensOs');

////////////////////////////

router.get('/clientes', ClientesController.listarClientes);
router.post('/clientes', ClientesController.cadastrarCliente);
router.patch('/clientes/:id', ClientesController.editarCliente);
router.delete('/clientes/:id', ClientesController.apagarCliente);


router.get('/veiculos', VeiculosController.listarVeiculos);
router.post('/veiculos', VeiculosController.cadastrarVeiculo);
router.patch('/veiculos/:id', VeiculosController.editarVeiculo);
router.delete('/veiculos/:id', VeiculosController.apagarVeiculo);

router.get('/funcionarios', FuncionariosController.listarFuncionarios);
router.post('/funcionarios', FuncionariosController.cadastrarFuncionario);
router.patch('/funcionarios/:id', FuncionariosController.editarFuncionario);
router.delete('/funcionarios/:id', FuncionariosController.apagarFuncionario);

router.get('/ordens-servico', OrdensServicoController.listarOrdensServico);
router.post('/ordens-servico', OrdensServicoController.cadastrarOrdemServico);
router.patch('/ordens-servico/:id', OrdensServicoController.editarOrdemServico);
router.delete('/ordens-servico/:id', OrdensServicoController.apagarOrdemServico);

router.get('/problemas', ProblemasController.listarProblemas);
router.post('/problemas', ProblemasController.cadastrarProblema);
router.patch('/problemas/:id', ProblemasController.editarProblema);
router.delete('/problemas/:id', ProblemasController.apagarProblema);

router.get('/servicos', ServicosController.listarServicos);
router.post('/servicos', ServicosController.cadastrarServico);
router.patch('/servicos/:id', ServicosController.editarServico);
router.delete('/servicos/:id', ServicosController.apagarServico);

router.get('/pecas', PecasController.listarPecas);
router.post('/pecas', PecasController.cadastrarPeca);
router.patch('/pecas/:id', PecasController.editarPeca);
router.delete('/pecas/:id', PecasController.apagarPeca);

router.get('/itens-os', ItensOsController.listarItensOs);
router.post('/itens-os', ItensOsController.cadastrarItemOs);
router.patch('/itens-os/:id', ItensOsController.editarItemOs);
router.delete('/itens-os/:id', ItensOsController.apagarItemOs);

module.exports = router;