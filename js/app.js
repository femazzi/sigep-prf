import { setAppContext } from './core/context.js';
import { API_BASE_URL, NAV_ITEMS } from './core/constants.js';
import { readApiJson } from './core/api.js';
import { getInitials } from './core/utils.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderCapacitacoesPage, renderModalAddTurmaHTML, renderModalAddCompetenciaHTML } from './pages/capacitacoes.js';
import { renderUnidadesPage } from './pages/unidades.js';
import { renderServidoresPage, renderModalHTML, renderViewHTML, renderConfigHTML } from './pages/servidores.js';
import { renderTalentosPage } from './pages/talentos.js';
import { renderRequerimentosPage, renderModalAddRequerimentoHTML } from './pages/requerimentos.js';
import { renderFeedbacksPage, renderModalAddFeedbackHTML } from './pages/feedbacks.js';

let state = {
   user: null,
   page: 'dashboard',
   isDarkMode: false,
   db: {
       unidades: [],
       postos: [],
       servidores: [] // Dados carregados da aba Servidores
   },
   ui: {
       searchQuery: '',
       currentPage: 1,
       isModalOpen: false,   // Modal de cadastro ou edicao
       modalEditId: null,    // Servidor em edicao
       modalViewId: null,    // Servidor em visualizacao
       modalViewUnidadeId: null, // Unidade em visualizacao
       modalGerenciarCursoId: null, // Curso aberto para gerenciamento
       modalAddCompetenciaId: null, // Servidor que recebera nova competencia
       modalAddTurmaOpen: false, // Modal de novo curso
       modalAddRequerimentoOpen: false, // Modal de novo requerimento
       modalAddFeedbackOpen: false, // Modal de novo feedback
       isConfigOpen: false,  // Modal de configuracao de codigos
       filtroTalentoCompetencia: '',
       filtroTalentoNivel: '',
       filtroTalentoTempo: '',
       loginMode: 'login'
   }
};

const root = document.getElementById('root');

const PAGE_RENDERERS = {
    dashboard: renderDashboardPage,
    servidores: renderServidoresPage,
    unidades: renderUnidadesPage,
    capacitacoes: renderCapacitacoesPage,
    talentos: renderTalentosPage,
    requerimentos: renderRequerimentosPage,
    feedbacks: renderFeedbacksPage
};

function applyTheme() {
    document.documentElement.classList.toggle('dark', state.isDarkMode);
}

async function carregarDados() {
    try {
        const [dashRes, capRes, reqRes, feedRes] = await Promise.all([
            fetch(`${API_BASE_URL}/dashboard`),
            fetch(`${API_BASE_URL}/capacitacoes`),
            fetch(`${API_BASE_URL}/requerimentos`),
            fetch(`${API_BASE_URL}/feedbacks`)
        ]);

        const [data, capData, reqData, feedData] = await Promise.all([
            readApiJson(dashRes, 'Servidor de dados principal indisponivel.'),
            readApiJson(capRes, 'Falha ao carregar as capacitacoes.'),
            readApiJson(reqRes, 'Falha ao carregar os requerimentos.'),
            readApiJson(feedRes, 'Falha ao carregar os feedbacks.')
        ]);

        state.db.unidades = data.unidades || [];
        state.db.postos = data.postos || [];
        state.db.cursos = capData.cursos || [];
        state.db.inscricoes = capData.inscricoes || [];
        state.db.competencias = capData.competencias || [];
        state.db.masterCompetencias = capData.masterCompetencias || [];
        state.db.requerimentos = reqData || [];
        state.db.feedbacks = feedData || [];
    } catch (err) {
        console.error('Falha de conexao com a API:', err.message);
    }
}

async function carregarServidores() {
    try {
        const response = await fetch(`${API_BASE_URL}/servidores`);
        state.db.servidores = await readApiJson(response, 'Falha ao buscar servidores.');
    } catch (err) {
        console.error(err.message);
    }
}

window.deletarServidor = async function(id) {
    if (!confirm('ATENÇÃO: Deseja realmente excluir este servidor definitivamente?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/servidores/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erro ao deletar servidor.');
        state.db.servidores = state.db.servidores.filter(s => String(s.id) !== String(id));
        renderApp();
    } catch (err) {
        alert(err.message);
    }
}

function renderApp() {
    // Sem usuario logado, volta para a tela inicial.
    if (!state.user) return renderLogin();
    
    // Estrutura principal da aplicacao.
    root.innerHTML = `
      <aside class="w-64 h-screen bg-[#0D2137] text-[#6B7A8D] flex flex-col">
         <div class="p-5 flex items-center mb-6 border-b border-[#1A2E44]">
           <i data-lucide="shield" class="w-8 h-8 text-[#C8922A] mr-3"></i>
           <div>
              <h1 class="text-white font-sora font-bold text-xl leading-tight">SIGEP <span class="text-[#C8922A]">PRF</span></h1>
              <p class="text-[9px] uppercase tracking-widest text-[#6B7A8D] font-bold">Gestão Integrada</p>
           </div>
         </div>
         
         <nav id="nav-menu" class="flex-1 px-3 space-y-1"></nav>
         
         <div class="p-4 border-t border-[#1A2E44] space-y-2">
            <button id="btn-theme" class="w-full flex items-center justify-center px-4 py-3 bg-[#11273d] text-[#6B7A8D] rounded-lg text-sm font-bold hover:text-white transition-colors"></button>
            <button id="btn-logout" class="w-full flex items-center justify-center px-4 py-3 bg-[#11273d] text-white rounded-lg text-sm font-bold hover:bg-red-900/50 hover:text-red-400 transition-colors">
               <i data-lucide="log-out" class="w-4 h-4 mr-2"></i> Encerrar Sessão
            </button>
         </div>
      </aside>
      
      <main class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
         <header class="bg-white border-b border-[#D8E0EA] px-6 py-4 shadow-sm flex justify-between items-center shrink-0">
            <div id="header-title" class="text-sm font-bold text-[#0D2137]">Acompanhamento de Painéis</div>
            <div class="flex items-center space-x-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold text-[#0D2137]">${state.user.nome}</p>
                <p class="text-[11px] font-semibold text-[#C8922A] uppercase tracking-wider">${state.user.postos?.nome || 'Admin'}</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-[#0D2137] text-white flex justify-center items-center text-sm font-bold border-2 border-[#C8922A] shadow-md">
                 ${getInitials(state.user.nome)}
              </div>
            </div>
         </header>
         
         <div id="page-content" class="flex-1 overflow-y-auto bg-[#F0F3F7] animate-fade-in custom-scrollbar"></div>
      </main>
      
      <!-- Modals Injetados Dinamicamente (Nível Global) -->
      ${state.ui.isModalOpen ?renderModalHTML() : ''}
      ${state.ui.modalViewId ?renderViewHTML() : ''}
      ${state.ui.isConfigOpen ?renderConfigHTML() : ''}
      ${state.ui.modalAddCompetenciaId ?renderModalAddCompetenciaHTML() : ''}
      ${state.ui.modalAddTurmaOpen ?renderModalAddTurmaHTML() : ''}
      ${state.ui.modalAddRequerimentoOpen ?renderModalAddRequerimentoHTML() : ''}
      ${state.ui.modalAddFeedbackOpen ?renderModalAddFeedbackHTML() : ''}
    `;

    // Menu lateral.
    const navMenu = document.getElementById('nav-menu');
    NAV_ITEMS.forEach(i => {
       const btn = document.createElement('button');
       btn.className = `w-full flex items-center px-4 py-3 rounded-lg text-sm font-bold transition-all ${state.page === i.id ?'bg-[#1A2E44] text-white' : 'hover:bg-[#11273d] hover:text-white'}`;
       btn.innerHTML = `<i data-lucide="${i.icon}" class="w-5 h-5 mr-3 ${state.page === i.id ?'text-[#C8922A]':''}"></i> ${i.label}`;
       btn.onclick = () => mudarPagina(i.id);
       navMenu.appendChild(btn);
    });

    // Encerrar sessao.
    document.getElementById('btn-logout').onclick = () => { state.user = null; renderApp(); };
    
    // Alternar tema.
    const themeBtn = document.getElementById('btn-theme');
    themeBtn.innerHTML = state.isDarkMode ?`<i data-lucide="sun" class="w-4 h-4 mr-2"></i> Modo Claro` : `<i data-lucide="moon" class="w-4 h-4 mr-2"></i> Modo Escuro`;
    themeBtn.onclick = () => { 
        state.isDarkMode = !state.isDarkMode; 
        applyTheme();
        renderApp();
    };

    renderPageContent(); // Renderiza a pagina atual
    lucide.createIcons(); // Atualiza os icones
}

async function renderLogin() {
    const isLogin = state.ui.loginMode !== 'register';
    
    // Titulos da tela de login ou cadastro.
    const titulo = isLogin ?'SIGEP <span class="text-[#C8922A]">PRF</span>' : 'Novo <span class="text-[#C8922A]">Operador</span>';
    const subTitulo = isLogin ?'Gestão Integrada' : 'Credencial Sigilosa Requerida';
    
    // Conteudo principal do formulario.
    const formsContent = isLogin ?`
            <form id="form-auth" class="space-y-5">
              <div class="relative">
                <label class="block text-[10px] font-extrabold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest mb-2">Passe Funcional (CPF)</label>
                <div class="relative">
                    <i data-lucide="user" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500"></i>
                    <input type="text" id="auth-cpf" placeholder="Digite seu CPF (apenas números)" class="w-full pl-10 p-3 bg-gray-50/50 dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none text-sm font-semibold text-[#0D2137] dark:text-white transition-all"/>
                </div>
              </div>
              
              <div class="relative">
                <label class="block text-[10px] font-extrabold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest mb-2">Credencial de Acesso</label>
                <div class="relative">
                    <i data-lucide="lock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500"></i>
                    <input type="password" id="auth-pwd" placeholder="Senha corporativa" class="w-full pl-10 p-3 bg-gray-50/50 dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none text-sm font-semibold text-[#0D2137] dark:text-white transition-all"/>
                </div>
              </div>
              
              <button type="submit" class="w-full bg-gradient-to-r from-[#0D2137] to-[#1A3A5F] dark:from-blue-600 dark:to-blue-800 text-white py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase hover:shadow-[0_8px_30px_-4px_rgba(13,33,55,0.4)] dark:hover:shadow-[0_8px_30px_-4px_rgba(37,99,235,0.4)] transition-all mt-8 hover:-translate-y-1">Autenticar Sistema</button>
            </form>
            <div class="mt-8 text-center pt-6 border-t border-gray-100 dark:border-slate-800">
              <button id="btn-toggle-mode" class="text-xs font-bold text-[#6B7A8D] dark:text-slate-400 hover:text-[#C8922A] dark:hover:text-amber-400 transition-colors">Solicitar Registro de Acesso?</button>
            </div>
    ` : `
            <form id="form-auth" class="space-y-4">
              <div><label class="block text-[10px] font-extrabold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest mb-1">Nome Completo</label>
              <input type="text" id="auth-name" required class="w-full p-2.5 bg-gray-50/50 dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-[#0D2137] dark:text-white transition-all"/></div>
              
              <div><label class="block text-[10px] font-extrabold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest mb-1">Passaporte SIG (CPF Apenas Nums)</label>
              <input type="text" id="auth-cpf" required maxlength="14" class="w-full p-2.5 bg-gray-50/50 dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-[#0D2137] dark:text-white transition-all"/></div>
              
              <div class="grid grid-cols-2 gap-3">
                  <div><label class="block text-[10px] font-extrabold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest mb-1">Nascimento Policial</label>
                  <input type="date" id="auth-data-nasc" required class="w-full p-2.5 bg-gray-50/50 dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-[#0D2137] dark:text-white transition-all"/></div>
                  <div><label class="block text-[10px] font-extrabold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest mb-1">Ingresso Instituição</label>
                  <input type="date" id="auth-data-ingresso" required class="w-full p-2.5 bg-gray-50/50 dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-[#0D2137] dark:text-white transition-all"/></div>
              </div>

              <div><label class="block text-[10px] font-extrabold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest mb-1">Código Corporativo (Ex: 191)</label>
              <input type="password" id="auth-code" required class="w-full p-2.5 bg-gray-50/50 dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-[#0D2137] dark:text-white transition-all"/></div>
              
              <div><label class="block text-[10px] font-extrabold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest mb-1">Nova Senha</label>
              <input type="password" id="auth-pwd" required class="w-full p-2.5 bg-gray-50/50 dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-[#0D2137] dark:text-white transition-all"/></div>
              
              <button type="submit" class="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-white py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase hover:shadow-[0_8px_30px_-4px_rgba(217,119,6,0.4)] transition-all mt-6 hover:-translate-y-1">Validar Credencial</button>
            </form>
            <div class="mt-8 text-center pt-6 border-t border-gray-100 dark:border-slate-800">
              <button id="btn-toggle-mode" class="text-xs font-bold text-[#6B7A8D] dark:text-slate-400 hover:text-[#C8922A] transition-colors"><i data-lucide="arrow-left" class="w-4 h-4 inline-block align-text-bottom mr-1"></i> Retornar ao Login</button>
            </div>
    `;

    root.innerHTML = `
      <div class="flex min-h-screen relative w-full items-center justify-center bg-[#F0F3F7] dark:bg-slate-900 overflow-hidden">
         <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
         <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-amber-400/10 dark:bg-amber-600/5 rounded-full blur-3xl"></div>
         
         <button id="btn-theme-login" class="absolute top-6 right-8 w-10 h-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full flex items-center justify-center text-[#6B7A8D] dark:text-slate-400 hover:text-blue-500 transition-colors shadow-sm cursor-pointer z-50">
            <i data-lucide="${state.isDarkMode ?'sun' : 'moon'}" class="w-5 h-5"></i>
         </button>

         <div class="z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 sm:p-12 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] w-full max-w-md border border-white/50 dark:border-slate-700/50 animate-fade-in relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0D2137] via-blue-500 to-[#C8922A] dark:from-blue-600 dark:via-blue-400 dark:to-amber-500"></div>
            
            <div class="flex justify-center mb-6">
                <div class="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner border border-blue-100 dark:border-slate-600 rotate-3 hover:rotate-6 transition-transform">
                    <i data-lucide="${isLogin ?'shield-check' : 'user-plus'}" class="w-10 h-10 text-[#C8922A] drop-shadow-sm -rotate-3 hover:-rotate-6 transition-transform"></i>
                </div>
            </div>
            
            <div class="text-center mb-10">
                <h2 class="text-3xl font-black font-sora text-[#0D2137] dark:text-white tracking-tight mb-2">${titulo}</h2>
                <span class="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[9px] font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">${subTitulo}</span>
            </div>
            
            ${formsContent}
         </div>
         
         <div class="absolute bottom-6 text-center w-full text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Sistema Integrado de Gestão de Pessoas &bull; Polícia Rodoviária Federal
         </div>
      </div>
    `;
    lucide.createIcons();
    
    const inputCpf = document.getElementById('auth-cpf');
    if (inputCpf) {
        inputCpf.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.substring(0, 11);
            if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
            else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
            else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
            e.target.value = v;
        });
    }
    
    document.getElementById('btn-theme-login').onclick = () => {
        state.isDarkMode = !state.isDarkMode;
        applyTheme();
        renderLogin();
    };
    
    document.getElementById('btn-toggle-mode').onclick = () => {
        state.ui.loginMode = isLogin ?'register' : 'login';
        renderLogin();
    };
    
    document.getElementById('form-auth').onsubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                const cpf = document.getElementById('auth-cpf').value;
                const pwd = document.getElementById('auth-pwd').value;
                
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cpf, senha: pwd })
                });
                
                const data = await readApiJson(response, 'Nao foi possivel autenticar no servidor.');
                
                state.user = data.user; 
                
                // Recarrega os dados apos o login.
                await carregarDados();
                await carregarServidores();

                renderApp();
            } else {
                const cpf = document.getElementById('auth-cpf').value;
                const pwd = document.getElementById('auth-pwd').value;
                const nome = document.getElementById('auth-name').value;
                const codigo_acesso = document.getElementById('auth-code').value;
                const data_nascimento = document.getElementById('auth-data-nasc').value;
                const data_ingresso = document.getElementById('auth-data-ingresso').value;

                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cpf, senha: pwd, nome, codigo_acesso, data_nascimento, data_ingresso })
                });
                await readApiJson(response, 'Nao foi possivel concluir o cadastro.');
                
                alert('Primeiro Acesso Cadastrado! Efetue login usando a nova credencial.');
                state.ui.loginMode = 'login';
                renderLogin();
            }
        } catch (err) { 
            alert(err.message); 
        }
    }
}

async function mudarPagina(pg) {
    state.page = pg; 
    
    // Estado de carregamento durante a troca de pagina.
    const pc = document.getElementById('page-content');
    if (pc) {
        pc.innerHTML = `
            <div class="flex items-center justify-center min-h-[60vh] flex-col animate-pulse">
                <div class="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-4 border border-blue-100 dark:border-slate-700 shadow-lg shadow-blue-900/5">
                    <i data-lucide="loader" class="w-8 h-8 text-[#C8922A] animate-spin"></i>
                </div>
                <p class="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Sincronizando Módulo em Tempo Real...</p>
            </div>
        `;
        lucide.createIcons();
    }
    
    try {
        // Atualiza os dados antes de renderizar a tela.
        await carregarDados();
        if (state.user && state.user.posto_id <= 3) {
            await carregarServidores();
        }
    } catch(err) {
        console.error("Master Sync Tracker Falhou:", err);
    }
    
    // Renderiza a tela com os dados atualizados.
    renderApp(); 
}

function renderPageContent() {
    const pc = document.getElementById('page-content');
    const renderer = PAGE_RENDERERS[state.page];

    if (renderer) {
        renderer(pc);
        return;
    }

    pc.innerHTML = `<div class="p-6 h-full flex items-center justify-center"><div class="text-center dark:text-slate-400 text-gray-400 bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-dashed border-[#D8E0EA] dark:border-slate-700 w-full"><i data-lucide="hard-hat" class="w-16 h-16 text-[#C8922A] mx-auto mb-4"></i><h3 class="text-2xl font-bold text-[#0D2137] dark:text-white">Pagina em construcao...</h3><p class="mt-2 text-[#6B7A8D] dark:text-slate-400">Este modulo do SIGEP Vanilla sera implementado na proxima versao.</p></div></div>`;
    lucide.createIcons();
}

window.state = state;
window.renderApp = renderApp;

setAppContext({
    state,
    renderApp,
    carregarDados,
    carregarServidores,
});

async function init() {
    await carregarDados();
    await carregarServidores();
    applyTheme();
    renderApp();
}

init();
