import { API_BASE_URL } from '../core/constants.js';
import { getInitials } from '../core/utils.js';
import { state, renderApp, carregarDados } from '../core/module-helpers.js';

export function renderCapacitacoesPage(container) {
    const isAdmin = state.user?.postos?.permissoes === 'Admin';
    // Checa se o usuário atual possui alguma proficiência Nível 'Instrutor' atrelada ou é Admin
    const isInstrutor = isAdmin || (state.db.competencias || []).some(c => String(c.servidor_id) === String(state.user.id) && c.nivel === 'Instrutor');

    const sortedCursos = [...(state.db.cursos || [])].sort((a, b) => {
        const order = { 'Em Aberto': 1, 'Em Andamento': 2, 'Concluído': 3 };
        const oa = order[a.status] || 4;
        const ob = order[b.status] || 4;
        if (oa !== ob) return oa - ob;
        return new Date(b.data_inicio || 0) - new Date(a.data_inicio || 0);
    });

    const cardsCursos = sortedCursos.map(c => {
        // Separa métricas de banco
        const inscritos = (state.db.inscricoes || []).filter(i => String(i.capacitacao_id) === String(c.id));
        const aprovados = inscritos.filter(i => i.status === 'Aprovado').length;
        const myInscricao = inscritos.find(i => String(i.servidor_id) === String(state.user.id));
        
        let statusTag = '';
        let actionBtn = '';
        
        if (c.status === 'Em Aberto') statusTag = `<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm inline-block border border-blue-200 dark:border-blue-700"><span class="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 inline-block mr-1 animate-pulse"></span> INSCRIÇÕES ABERTAS</span>`;
        else if (c.status === 'Em Andamento') statusTag = `<span class="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-3 py-1.5 rounded-lg text-xs font-bold inline-block border border-yellow-200 dark:border-yellow-700/50"><i data-lucide="play-circle" class="w-3 h-3 inline mr-1"></i> EM ANDAMENTO</span>`;
        else statusTag = `<span class="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold inline-block"><i data-lucide="check-circle" class="w-3 h-3 inline mr-1"></i> CONCLUÍDO</span>`;

        // Engenharia RLS da UI 
        if (isInstrutor) {
            actionBtn = `<button onclick="window.gerenciarCurso('${c.id}')" class="bg-[#1A2E44] dark:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#0D2137] dark:hover:bg-blue-700 shadow-md transition-all flex items-center"><i data-lucide="settings" class="w-4 h-4 mr-2"></i> Gerenciar Turma</button>`;
        } else {
            if (myInscricao) {
                // Bloqueia manipulações (Operador normal só entra e sai bloqueado num Workflow)
                let color = myInscricao.status === 'Aprovado' ?'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' : (myInscricao.status === 'Reprovado' ?'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800');
                actionBtn = `<div class="px-4 py-2 border rounded-lg text-xs font-bold ${color} shadow-sm">Sua Situação: ${myInscricao.status.toUpperCase()}</div>`;
            } else if (c.status === 'Em Aberto' && inscritos.length < c.vagas) {
                actionBtn = `<button onclick="window.inscreverCurso('${c.id}')" class="bg-[#C8922A] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#a67923] shadow-md transition-all flex items-center"><i data-lucide="check-square" class="w-4 h-4 mr-2"></i> Inscrever-se</button>`;
            } else if (c.status === 'Em Andamento' || c.status === 'Concluído') {
               actionBtn = `<div class="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 flex items-center"><i data-lucide="lock" class="w-3 h-3 mr-1"></i> Fora do Prazo</div>`;
            } else {
                actionBtn = `<div class="px-4 py-2 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">Vagas Esgotadas</div>`;
            }
        }

        return `
        <div class="bg-white dark:bg-[#1A2E44] rounded-xl shadow-sm border border-[#D8E0EA] dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow">
            <div class="p-6 flex-1 flex flex-col justify-start">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-[10px] font-black tracking-widest text-[#6B7A8D] dark:text-slate-400 uppercase block mb-1">${c.instituicao || 'Academia Nacional'}</span>
                        <h4 class="font-bold text-[#0D2137] dark:text-white text-xl font-sora leading-tight">${c.nome}</h4>
                    </div>
                </div>
                ${statusTag}
                <p class="text-sm text-[#6B7A8D] dark:text-slate-300 mt-4 mb-6 flex-1">${c.descricao}</p>
                
                <div class="grid grid-cols-2 gap-3 mb-6 bg-[#F8FAFC] dark:bg-slate-800/50 rounded-lg p-4 border border-[#D8E0EA] dark:border-slate-700">
                    <div>
                        <span class="text-[10px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase block">Carga Horária</span>
                        <span class="text-sm font-semibold text-[#0D2137] dark:text-slate-200"><i data-lucide="clock" class="w-3 h-3 inline text-[#C8922A] mr-1"></i> ${c.carga_horaria} Horas</span>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase block">Modelagem</span>
                        <span class="text-sm font-semibold text-[#0D2137] dark:text-slate-200"><i data-lucide="layout" class="w-3 h-3 inline text-[#C8922A] mr-1"></i> ${c.modalidade}</span>
                    </div>
                    <div class="col-span-2 pt-2 border-t border-gray-200 dark:border-slate-600 mt-1">
                        <div class="flex justify-between text-[10px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase mb-1">
                            <span>Ocupação da Turma</span>
                            <span class="text-[#0D2137] dark:text-white">${inscritos.length} / ${c.vagas} Alunos</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div class="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full" style="width: ${Math.min(100, (inscritos.length / c.vagas) * 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-50 dark:bg-[#0f1b29] px-6 py-4 border-t border-[#D8E0EA] dark:border-slate-700 rounded-b-xl flex items-center justify-between shrink-0 transition-colors">
               <div class="text-[11px] font-bold text-[#6B7A8D] dark:text-slate-400 flex flex-col">
                  <span><strong class="text-[#0D2137] dark:text-slate-200">Abertura:</strong> ${c.data_inicio ?c.data_inicio.split('-').reverse().join('/') : 'A definir'}</span>
               </div>
               ${actionBtn}
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = `
      <div class="p-6 space-y-6 animate-fade-in custom-scrollbar overflow-y-auto w-full h-full"> 
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 w-full mb-6">
          <div>
            <h3 class="text-xl font-bold text-[#0D2137] dark:text-blue-100 font-sora flex items-center"><div class="p-2 bg-[#C8922A]/10 dark:bg-[#C8922A]/20 rounded-lg mr-3"><i data-lucide="graduation-cap" class="w-6 h-6 text-[#C8922A]"></i></div> Escola Nacional de Formação</h3>
            <p class="text-sm text-[#6B7A8D] dark:text-slate-400 mt-1">Inscreva-se em Cursos de Prateleira e atualize suas valências curriculares.</p>
          </div>
          <div class="flex space-x-3">
             ${isInstrutor ?`<button onclick="window.adicionarTurma()" class="bg-[#1A2E44] dark:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0D2137] dark:hover:bg-blue-500 transition-all flex items-center shadow-md">
                <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Adicionar Matriz Curricular
             </button>` : ''}
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full pb-10">
            ${cardsCursos || `<div class="col-span-full p-10 text-center text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-[#D8E0EA] dark:border-slate-700"><i data-lucide="book-x" class="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3"></i> Nenhuma Capacitação Oficial Ofertada No Momento.</div>`}
        </div>

        ${state.ui.modalGerenciarCursoId ?renderModalGerenciarCurso() : ''}
      </div>
    `;

    lucide.createIcons();
}

window.inscreverCurso = async function(id) {
    if (!confirm('Deseja se matricular nesta capacitação?\nAssegure-se de que dispõe de disponibilidade perante as escalas.')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/capacitacoes/${id}/inscrever`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ servidor_id: state.user.id })
        });
        if (!response.ok) throw new Error('Falha ao registrar inscrição.');
        
        alert('Matrícula confirmada! Aguarde avaliação da coordenação.');
        await carregarDados(); // Renova Caches
        renderApp();
    } catch (err) { alert(err.message); }
}

window.gerenciarCurso = function(id) { state.ui.modalGerenciarCursoId = id; renderApp(); }

window.alterarStatusAluno = async function(inscricaoId, novoStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/capacitacoes/inscricao/${inscricaoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        if (!response.ok) throw new Error('Falha ao atualizar status do operador.');
        await carregarDados(); // Recarrega os arrays em RAM
        // Nāo chama renderApp() inteiro para nĀo quebrar o `select` do frontend
    } catch(err) { alert(err.message); }
}

// O modal de Gerenciamento de Curso foi movido para a Sessão MÓDULO: GERENCIAMENTO DE INSTRUTORES no final do arquivo.

window.adicionarCompetencia = async function(servidor_id) {
    state.ui.modalAddCompetenciaId = servidor_id;
    renderApp();
}

window.salvarNovaCompetencia = async function() {
    const select = document.getElementById('select-nova-competencia');
    const selectNivel = document.getElementById('select-nivel-competencia');
    if(!select || !selectNivel) return;
    
    const competencia_id = parseInt(select.value);
    const nivel = selectNivel.value;
    const servidor_id = state.ui.modalAddCompetenciaId;
    
    if (isNaN(competencia_id)) return alert('Você deve selecionar uma valência válida na lista.');

    const btn = event.currentTarget;
    const oldHtml = btn.innerHTML;
    btn.innerHTML = 'Adicionando...'; btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/competencias`, {
            method: 'POST', headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ servidor_id, competencia_id, nivel })
        });
        if (!response.ok) throw new Error("Recusado pelo Servidor. Esta insígnia pode já existir no seu perfil.");
        
        state.ui.modalAddCompetenciaId = null;
        await carregarDados(); 
        renderApp();
    } catch(err) { 
        alert(err.message); 
        btn.innerHTML = oldHtml; btn.disabled = false;
    }
}

window.fecharModalAddCompetencia = function() {
    state.ui.modalAddCompetenciaId = null;
    renderApp();
}

/**
 * Controller: Nova Turma (Instrutores/Admins)
 */
window.adicionarTurma = function() {
    state.ui.modalAddTurmaOpen = true;
    renderApp();
}
window.fecharModalAddTurma = function() {
    state.ui.modalAddTurmaOpen = false;
    renderApp();
}
window.salvarNovaTurma = async function(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-turma');
    const oldHtml = btn.innerHTML;
    btn.innerHTML = 'Salvando Matriz Curricular...'; btn.disabled = true;

    const form = event.target;
    const bodyArgs = {
        nome: form.querySelector('#turma-nome').value,
        modalidade: form.querySelector('#turma-modalidade').value,
        carga_horaria: parseInt(form.querySelector('#turma-carga').value),
        data_inicio: form.querySelector('#turma-inicio').value,
        data_fim: form.querySelector('#turma-fim').value,
        vagas: parseInt(form.querySelector('#turma-vagas').value),
        status: 'Em Aberto', // Sempre abre incialmente
        instituicao: form.querySelector('#turma-instituicao').value,
        descricao: form.querySelector('#turma-descricao').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/capacitacoes`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyArgs)
        });
        if (!response.ok) throw new Error("Erro Crítico ao gerar nova matriz no Banco de Dados.");
        alert('Matriz Curricular Ativada com Sucesso! Oficial de Turma lançado.');
        state.ui.modalAddTurmaOpen = false;
        await carregarDados(); renderApp();
    } catch(err) {
        alert(err.message);
        btn.innerHTML = oldHtml; btn.disabled = false;
    }
}

export function renderModalAddTurmaHTML() {
    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in custom-scrollbar overflow-y-auto">
        <form onsubmit="window.salvarNovaTurma(event)" class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-2xl w-full max-w-2xl border border-[#D8E0EA] dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div class="bg-[#1A2E44] dark:bg-[#0f1b29] text-white p-6 relative shrink-0 border-b dark:border-slate-800">
                <button type="button" onclick="window.fecharModalAddTurma()" class="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                <div class="w-10 h-10 bg-amber-500 rounded-full flex justify-center items-center mb-3 shadow-md"><i data-lucide="book-open" class="w-5 h-5 text-white"></i></div>
                <h3 class="text-xl font-bold font-sora">Registrar Nova Matriz Acadêmica</h3>
                <p class="text-xs text-blue-200 dark:text-slate-400 mt-1 uppercase tracking-widest font-mono">Formatação de Edital Corporativo</p>
            </div>
            
            <div class="overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#0f1b29] p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Nome Oficial da Capacitação *</label>
                    <input id="turma-nome" required type="text" placeholder="Ex: Curso de Operações Temáticas (COTEM)" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white" />
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Modalidade Institucional *</label>
                    <select id="turma-modalidade" required class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white">
                        <option value="Presencial">Escola Presencial (UniPRF)</option>
                        <option value="Híbrido">Híbrido EAD/Base</option>
                        <option value="EAD">Universidade Virtual EAD</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Instituição Concedente/Sede *</label>
                    <input id="turma-instituicao" required type="text" placeholder="Ex: UniPRF - SC" value="Polícia Rodoviária Federal" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white" />
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Carga Horária (Horas) *</label>
                    <input id="turma-carga" required type="number" min="1" step="1" value="40" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white font-mono" />
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Vagas Abertas à Incorporação *</label>
                    <input id="turma-vagas" required type="number" min="1" step="1" value="30" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white font-mono" />
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Data Mínima (Início) *</label>
                    <input id="turma-inicio" required type="date" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white" />
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Data Efetiva de Fechamento *</label>
                    <input id="turma-fim" required type="date" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Escopo ou Diretrizes Metodológicas</label>
                    <textarea id="turma-descricao" rows="3" placeholder="Insira dados de convocação, ou emental oficial..." class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-medium text-[#0D2137] dark:text-slate-200"></textarea>
                </div>
                
            </div>
            <div class="bg-gray-50 dark:bg-slate-800/80 p-4 border-t border-[#D8E0EA] dark:border-slate-700 shrink-0">
               <button type="submit" id="btn-submit-turma" class="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-900 transition-all flex items-center justify-center shadow-md shadow-blue-900/20 uppercase tracking-wider text-xs border border-blue-500/50">
                    <i data-lucide="building" class="w-4 h-4 mr-2"></i> Liberar Matrículas no Servidor Matriz
                </button>
            </div>
        </form>
      </div>
    `;
}

export function renderModalAddCompetenciaHTML() {
    const options = (state.db.masterCompetencias || []).map(c => `<option value="${c.id}">ID #${c.id} - ${c.nome}</option>`).join('');
    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-2xl w-full max-w-md border border-[#D8E0EA] dark:border-slate-700 p-6 relative">
            <button onclick="window.fecharModalAddCompetencia()" class="absolute top-4 right-4 p-2 text-[#6B7A8D] dark:text-slate-400 hover:bg-[#F0F3F7] dark:hover:bg-slate-800 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
            <div class="flex flex-col text-center">
                <div class="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-900/40 text-[#C8922A] dark:text-amber-400 rounded-full flex justify-center items-center mb-4"><i data-lucide="award" class="w-6 h-6"></i></div>
                <h3 class="text-xl font-bold text-[#0D2137] dark:text-white font-sora">Adicionar Valência Livre</h3>
                <p class="text-xs text-[#6B7A8D] dark:text-slate-400 mt-2 mb-6">Selecione no catálogo oficial a competência ou curso extracurricular que deseja adicionar à sua ficha.</p>
                
                <div class="text-left w-full mb-6 relative">
                    <label class="block text-xs font-bold text-[#0D2137] dark:text-white mb-2 uppercase tracking-wide">Catálogo Oficial de Valências <i data-lucide="chevron-down" class="w-3 h-3 inline text-gray-400"></i></label>
                    <div class="relative">
                        <select id="select-nova-competencia" class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 font-semibold text-[#0D2137] dark:text-white outline-none appearance-none hover:border-[#1A2E44] dark:hover:border-slate-500 transition-colors cursor-pointer shadow-sm">
                            <option value="" disabled selected>-- EXPANDA PARA ABRIR O CATÁLOGO --</option>
                            ${options}
                        </select>
                        <i data-lucide="list" class="w-4 h-4 absolute right-3 top-3.5 text-[#6B7A8D] dark:text-slate-400 pointer-events-none"></i>
                    </div>
                </div>

                <div class="text-left w-full mb-6 relative">
                    <label class="block text-xs font-bold text-[#0D2137] dark:text-white mb-2 uppercase tracking-wide">Nível de Proficiência <i data-lucide="chevron-down" class="w-3 h-3 inline text-gray-400"></i></label>
                    <div class="relative">
                        <select id="select-nivel-competencia" class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 font-semibold text-[#0D2137] dark:text-white outline-none appearance-none hover:border-[#1A2E44] dark:hover:border-slate-500 transition-colors cursor-pointer shadow-sm">
                            <option value="Aprendiz">Aprendiz</option>
                            <option value="Operacional" selected>Operacional</option>
                            <option value="Avançado">Avançado</option>
                            <option value="Especialista">Especialista</option>
                            <option value="Instrutor">Instrutor</option>
                        </select>
                        <i data-lucide="star" class="w-4 h-4 absolute right-3 top-3.5 text-[#6B7A8D] dark:text-slate-400 pointer-events-none"></i>
                    </div>
                </div>
                
                <button onclick="window.salvarNovaCompetencia()" class="w-full bg-[#1A2E44] dark:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-[#0D2137] dark:hover:bg-blue-700 transition-all flex items-center justify-center shadow-md">
                    <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Adicionar ao Currículo
                </button>
            </div>
        </div>
      </div>
    `;
}

window.removerCompetencia = async function(id) {
    if (!confirm('Excluir esta competência livre do seu currículo?')) return;
    try {
        await fetch(`${API_BASE_URL}/competencias/${id}`, { method: 'DELETE' });
        await carregarDados(); renderApp();
    } catch(err) { alert(err.message); }
}

window.fecharModalGerenciarCurso = function() {
    state.ui.modalGerenciarCursoId = null;
    renderApp();
}

window.alterarStatusCurso = async function(id, novoStatus) {
    if(!confirm(`Confirma a mudança da Matriz Institucional para "${novoStatus}"?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/capacitacoes/${id}`, {
            method: 'PUT', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ status: novoStatus })
        });
        if(!res.ok) throw new Error("Falha ao atualizar curso.");
        alert("Status Institucional alterado com sucesso.");
        await carregarDados(); renderApp();
    } catch(err) { alert(err.message); }
}

window.alterarStatusInscricao = async function(id, novoStatus) {
    try {
        const res = await fetch(`${API_BASE_URL}/capacitacoes/inscricao/${id}`, {
            method: 'PUT', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ status: novoStatus })
        });
        if(!res.ok) throw new Error("Falha ao deferir/indeferir servidor.");
        await carregarDados(); renderApp();
    } catch(err) { alert(err.message); }
}

window.deletarCurso = async function(id) {
    if(!confirm('ATENÇÃO MAXIMA: Procedimento irreversível! Deseja erradicar essa Matriz Oficial e destruir todos os históricos acadêmicos atrelados a ela?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/capacitacoes/${id}`, { method: 'DELETE' });
        if(!res.ok) throw new Error("Acesso Negado ou Falha de Exclusão.");
        alert("Matriz de Especialização erradicada com sucesso.");
        state.ui.modalGerenciarCursoId = null;
        await carregarDados(); renderApp();
    } catch(err) { alert(err.message); }
}

function renderModalGerenciarCurso() {
    const cursoId = state.ui.modalGerenciarCursoId;
    const curso = (state.db.cursos || []).find(c => String(c.id) === String(cursoId));
    if (!curso) return '';
    const isAdmin = state.user?.postos?.permissoes === 'Admin';

    const inscricoes = (state.db.inscricoes || []).filter(i => String(i.capacitacao_id) === String(cursoId));
    
    const alunosHTML = inscricoes.length === 0 ?`<p class="text-xs text-gray-500 dark:text-slate-500 text-center py-4 bg-gray-50 dark:bg-slate-800/40 rounded-lg border border-dashed dark:border-slate-700">Ninguém aplicou para esta academia até o momento.</p>` : inscricoes.map(i => {
        const n = i.servidores?.nome || 'Desconhecido';
        const c = i.servidores?.cpf || '000';
        const situacao = i.status; // Pendente, Aprovado, Reprovado
        
        let actions = '';
        if (situacao === 'Pendente' || situacao === 'Inscrito') {
            actions = `
               <button onclick="window.alterarStatusInscricao('${i.id}', 'Aprovado')" class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-green-200 dark:hover:bg-green-800/60 border border-green-200 dark:border-green-800"><i data-lucide="check" class="w-3 h-3 inline mr-1"></i>Aprova</button>
               <button onclick="window.alterarStatusInscricao('${i.id}', 'Reprovado')" class="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-red-200 dark:hover:bg-red-800/60 border border-red-200 dark:border-red-800 ml-2"><i data-lucide="x" class="w-3 h-3 inline mr-1"></i>Reprova</button>
            `;
        } else {
            const badgeColor = situacao === 'Aprovado' ?'bg-green-600 dark:bg-green-600' : 'bg-red-600 dark:bg-red-600';
            actions = `<span class="${badgeColor} text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">${situacao.toUpperCase()}</span>`;
        }
        
        return `
           <div class="flex justify-between items-center bg-white dark:bg-[#1A2E44] p-3 border border-gray-200 dark:border-slate-700 rounded-lg mb-2 shadow-sm transition-colors">
              <div class="flex items-center">
                 <div class="w-8 h-8 rounded-full bg-[#1A2E44] dark:bg-[#0f1b29] text-white flex justify-center items-center text-[10px] font-bold shadow-md mr-3 border border-blue-900 dark:border-slate-700">${getInitials(n)}</div>
                 <div>
                    <p class="text-[11px] font-bold text-[#0D2137] dark:text-white uppercase tracking-wide leading-tight">${n}</p>
                    <p class="text-[9px] font-mono text-[#6B7A8D] dark:text-slate-400 mt-0.5">CPF: ${c} | Req. ${new Date(i.data_inscricao).toLocaleDateString()}</p>
                 </div>
              </div>
              <div class="flex">${actions}</div>
           </div>
        `;
    }).join('');

    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in custom-scrollbar overflow-y-auto">
        <div class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-2xl w-full max-w-2xl border border-[#D8E0EA] dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div class="bg-[#1A2E44] dark:bg-[#0f1b29] text-white p-6 relative shrink-0 border-b dark:border-slate-800">
                <button type="button" onclick="window.fecharModalGerenciarCurso()" class="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                <div class="w-10 h-10 bg-blue-500 rounded-full flex justify-center items-center mb-3 shadow-md"><i data-lucide="calendar" class="w-5 h-5 text-white"></i></div>
                <h3 class="text-xl font-bold font-sora">Painel do Instrutor-Chefe</h3>
                <p class="text-xs text-blue-200 dark:text-slate-400 mt-1 uppercase tracking-widest font-mono line-clamp-1">${curso.nome}</p>
            </div>
            
            <div class="overflow-y-auto custom-scrollbar flex-1 bg-gray-50 dark:bg-slate-900/50 p-6">
                
                <h5 class="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-slate-400 mb-2">Controle do Ciclo do Curso</h5>
                <div class="bg-white dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex flex-wrap gap-2 mb-6 transition-colors">
                    <button onclick="window.alterarStatusCurso('${curso.id}', 'Em Aberto')" class="${curso.status === 'Em Aberto' ?'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'} px-4 py-2 rounded-lg text-xs font-bold transition-all"><i data-lucide="door-open" class="w-3 h-3 inline mr-1"></i> Abrir Inscrições</button>
                    <button onclick="window.alterarStatusCurso('${curso.id}', 'Em Andamento')" class="${curso.status === 'Em Andamento' ?'bg-yellow-500 text-white ring-2 ring-offset-2 ring-yellow-400 dark:ring-offset-slate-800' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'} px-4 py-2 rounded-lg text-xs font-bold transition-all"><i data-lucide="play" class="w-3 h-3 inline mr-1"></i> Executando Academia</button>
                    <button onclick="window.alterarStatusCurso('${curso.id}', 'Concluído')" class="${curso.status === 'Concluído' ?'bg-green-600 text-white ring-2 ring-offset-2 ring-green-500 dark:ring-offset-slate-800' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'} px-4 py-2 rounded-lg text-xs font-bold transition-all"><i data-lucide="check-square" class="w-3 h-3 inline mr-1"></i> Encerrar e Formar</button>
                </div>
                
                <h5 class="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-slate-400 mb-2 flex justify-between">
                   <span>Fila de Inscrição (${inscricoes.length} / ${curso.vagas} Vagas)</span>
                   <span class="text-blue-600 dark:text-blue-400">Aprovados: ${inscricoes.filter(x => x.status === 'Aprovado').length}</span>
                </h5>
                <div class="max-h-64 overflow-y-auto custom-scrollbar p-1">
                   ${alunosHTML}
                </div>
            </div>
            
            <div class="bg-white dark:bg-slate-800/80 p-4 border-t border-[#D8E0EA] dark:border-slate-700 shrink-0 flex items-center justify-between transition-colors">
               ${isAdmin ?`<button type="button" onclick="window.deletarCurso('${curso.id}')" class="bg-red-50/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-800 dark:hover:text-red-300 px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all flex items-center"><i data-lucide="trash-2" class="w-3 h-3 mr-2"></i> Erradicar Matriz</button>` : '<div></div>'}
               <button type="button" onclick="window.fecharModalGerenciarCurso()" class="bg-[#1A2E44] dark:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-[#0D2137] dark:hover:bg-blue-700 transition-all text-[11px] uppercase tracking-wide">CONFIRMAR CONCLUÍDOS</button>
            </div>
        </div>
      </div>
    `;
}
