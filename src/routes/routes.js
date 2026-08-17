const express = require('express');
const router = express.Router();

const ClientesController = require('../controllers/clientes');
const VeiculosController = require('../controllers/veiculos');
const FuncionariosController = require('../controllers/funcionario');
const OrdensServicoController = require('../controllers/ordensServico');
const ProblemasController = require('../controllers/problemas');
const ServicosController = require('../controllers/servicos');
const PecasController = require('../controllers/pecas');
const PagamentosController = require('../controllers/pagamentos');
const ExecucoesController = require('../controllers/execucoes');
const ItensOsController = require('../controllers/itensOs');
const LoginsController = require('../controllers/logins');
const autenticarToken = require('../middlewares/autenticacao');
const permitirApenas = require('../middlewares/autorizacao');

////////////////////////////

router.post('/login',LoginsController.autenticar);
router.use(autenticarToken);
router.post( '/logins',permitirApenas('administrador'),LoginsController.cadastrarLogin );

router.get('/clientes', ClientesController.listarClientes);
router.post('/clientes', ClientesController.cadastrarCliente);
router.patch('/clientes/:id', ClientesController.editarCliente);
router.delete('/clientes/:id', ClientesController.apagarCliente);


router.get('/veiculos', VeiculosController.listarVeiculos);
router.post('/veiculos', VeiculosController.cadastrarVeiculo);
router.patch('/veiculos/:id', VeiculosController.editarVeiculo);
router.delete('/veiculos/:id', VeiculosController.apagarVeiculo);

router.get('/funcionarios',permitirApenas('administrador'),FuncionariosController.listarFuncionarios);
router.post('/funcionarios',permitirApenas('administrador'),FuncionariosController.cadastrarFuncionario);
router.patch('/funcionarios/:id',permitirApenas('administrador'),FuncionariosController.editarFuncionario);
router.delete('/funcionarios/:id',permitirApenas('administrador'),FuncionariosController.apagarFuncionario);

// ======================================
// ORDENS DE SERVIÇO
// ======================================

// Lista + pesquisa + filtros + paginação
router.get('/ordens-servico',permitirApenas('administrador','funcionario'),OrdensServicoController.listarOrdensServico);
// Detalhes completos
router.get('/ordens-servico/:id/detalhes', permitirApenas('administrador','funcionario'),OrdensServicoController.detalharOrdemServico);
// Cadastrar
router.post('/ordens-servico',permitirApenas('administrador','funcionario'),OrdensServicoController.cadastrarOrdemServico);
// Editar
router.patch( '/ordens-servico/:id',permitirApenas('administrador','funcionario'),OrdensServicoController.editarOrdemServico);
// Recalcular valor total
router.patch('/ordens-servico/:id/recalcular-total', OrdensServicoController.recalcularValorTotal);
// Excluir
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

router.get('/pagamentos',permitirApenas('administrador'),PagamentosController.listarPagamentos);
router.post('/pagamentos',permitirApenas('administrador'),PagamentosController.cadastrarPagamento);
router.patch('/pagamentos/:id',permitirApenas('administrador'),PagamentosController.editarPagamento);
router.delete('/pagamentos/:id',permitirApenas('administrador'),PagamentosController.apagarPagamento);

router.get('/execucoes', ExecucoesController.listarExecucoes);
router.post('/execucoes', ExecucoesController.cadastrarExecucao);
router.patch('/execucoes/:id', ExecucoesController.editarExecucao);
router.delete('/execucoes/:id', ExecucoesController.apagarExecucao);

router.post( '/logins',LoginsController.cadastrarLogin);



module.exports = router;