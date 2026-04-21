import { API_BASE_URL } from '../core/constants.js';
import { apiRequestJson } from '../core/api.js';
import { state, renderApp, carregarDados } from '../core/module-helpers.js';

window.abrirModalFeedback = function() {
    state.ui.modalAddFeedbackOpen = true;
    renderApp();
}
window.fecharModalFeedback = function() {
    state.ui.modalAddFeedbackOpen = false;
    renderApp();
}
window.salvarFeedback = async function(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-fdb');
    const oldHtml = btn.innerHTML;
    btn.innerHTML = 'Gravando Avaliação...'; btn.disabled = true;

    const form = event.target;
    const alvoStr = form.querySelector('#fdb-alvo').value;
    if (!alvoStr) { alert("Escolha o servidor avaliado."); btn.innerHTML=oldHtml; btn.disabled=false; return; }

    const pld = {
        servidor_id: parseInt(alvoStr),
        autor_id: state.user.id,
        tipo: form.querySelector('#fdb-tipo').value,
        descricao: form.querySelector('#fdb-desc').value,
        data_registro: new Date().toISOString().split('T')[0]
    };

    try {
        await apiRequestJson(`${API_BASE_URL}/feedbacks`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pld)
        }, 'Erro critico ao gerar relatorio de desempenho.');
        alert('Feedback 360?protocolado na ficha do servidor!');
        state.ui.modalAddFeedbackOpen = false;
        await carregarDados(); renderApp();
    } catch(err) {
        alert(err.message);
        btn.innerHTML = oldHtml; btn.disabled = false;
    }
}
window.deletarFeedback = async function(id) {
    if(!confirm('Deseja retirar este relatório e apagá-lo da ficha do servidor?')) return;
    try {
        await apiRequestJson(`${API_BASE_URL}/feedbacks/${id}`, { method: 'DELETE' }, 'Erro ao apagar feedback.');
        await carregarDados(); renderApp();
    } catch(err) { alert(err.message); }
}

export function renderModalAddFeedbackHTML() {
    const listagemServidores = (state.db.servidores || []).filter(s => String(s.id) !== String(state.user.id)).map(s => `<option value="${s.id}">${s.nome} (${s.postos?.nome || 'Operador'})</option>`).join('');
    
    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in custom-scrollbar overflow-y-auto">
        <form onsubmit="window.salvarFeedback(event)" class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-2xl w-full max-w-lg border border-[#D8E0EA] dark:border-slate-700 flex flex-col mt-10 md:mt-0">
            <div class="bg-[#1A2E44] dark:bg-[#0f1b29] text-white p-6 relative shrink-0 rounded-t-xl border-b dark:border-slate-800">
                <button type="button" onclick="window.fecharModalFeedback()" class="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                <div class="w-10 h-10 bg-blue-500 rounded-full flex justify-center items-center mb-3 shadow-md"><i data-lucide="message-square" class="w-5 h-5 text-white"></i></div>
                <h3 class="text-xl font-bold font-sora">Registrar Avaliação (Módulo 360°)</h3>
                <p class="text-[10px] text-blue-200 dark:text-slate-400 mt-1 uppercase tracking-widest font-mono">Feedback Comportamental e Operacional</p>
            </div>
            
            <div class="bg-white dark:bg-[#0f1b29] p-6 flex flex-col space-y-4">
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Servidor Avaliado *</label>
                    <select id="fdb-alvo" required class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white">
                        <option value="" disabled selected>-- Escolha o Servidor ou Colega --</option>
                        ${listagemServidores}
                    </select>
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Classificação do Feedback *</label>
                    <select id="fdb-tipo" required class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white">
                        <option value="Elogio">Elogio Pessoal Reservado</option>
                        <option value="Missão de Destaque">Elogio Oficial: Missão de Destaque</option>
                        <option value="Melhoria">Plano: Oportunidade de Melhoria (Mentoria)</option>
                        <option value="Advertência">Alerta: Desvio de Conduta / Advertência</option>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Relatório Base *</label>
                    <textarea id="fdb-desc" required rows="4" placeholder="Descreva atitudes, pontualidade, conhecimento e postura profissional observados durante escalas e missões conjuntas..." class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-medium text-[#0D2137] dark:text-slate-200"></textarea>
                </div>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-800/80 p-4 border-t border-[#D8E0EA] dark:border-slate-700 shrink-0 rounded-b-xl">
               <button type="submit" id="btn-submit-fdb" class="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-900 transition-all flex items-center justify-center shadow-md shadow-blue-900/20 uppercase tracking-wider text-[11px] border border-blue-500/50">
                    <i data-lucide="check-circle" class="w-4 h-4 mr-2"></i> Anexar Feedback à Ficha
                </button>
            </div>
        </form>
      </div>
    `;
}

export function renderFeedbacksPage(container) {
    const isAdmin = state.user?.postos?.permissoes === 'Admin';
    // Quem vê os relatórios?Admin vê tudo. Usuário só vê o que escreveram DELE, e o que ELE escreveu de outros (pra poder apagar).
    const feedAtivos = isAdmin ?(state.db.feedbacks || []) : ((state.db.feedbacks || []).filter(f => String(f.servidor_id) === String(state.user.id) || String(f.autor_id) === String(state.user.id)));
    
    // Calcula Métrica Simples: Total Elogios x Alertas (na tela atual)
    const totalElogios = feedAtivos.filter(f => f.tipo.includes('Elogio') || f.tipo.includes('Missão de Destaque')).length;
    
    const rows = feedAtivos.map(f => {
        const isPositivo = f.tipo.includes('Elogio') || f.tipo.includes('Missão de Destaque');
        const colorTag = isPositivo ?'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
        const iconTag = isPositivo ?'trending-up' : 'alert-triangle';
        const alvoNome = f.avaliado?.nome || 'Servidor Desconhecido';
        const autorNome = f.avaliador?.nome || 'Anônimo ou Desligado';
        const deleteBtn = isAdmin || String(f.autor_id) === String(state.user.id) ?`<button onclick="window.deletarFeedback('${f.id}')" class="text-xs text-red-500 hover:text-red-700 flex items-center font-bold px-3 py-1 bg-red-50 rounded"><i data-lucide="trash-2" class="w-3 h-3 mr-1"></i> Retirar</button>` : '';

        return `
        <div class="bg-white dark:bg-[#0f1b29] border text-left border-[#D8E0EA] dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 p-5 animate-fade-in flex flex-col sm:flex-row justify-between relative group transition-colors">
            <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                    <span class="${colorTag} font-bold px-2 py-1 rounded text-[10px] tracking-wide uppercase"><i data-lucide="${iconTag}" class="w-3 h-3 mr-1 inline"></i> ${f.tipo}</span>
                    <span class="font-mono text-[9px] text-[#6B7A8D] dark:text-slate-400 mt-1 shrink-0"><i data-lucide="calendar" class="w-3 h-3 inline"></i> REG. ${new Date(f.data_registro).toLocaleDateString()}</span>
                </div>
                
                <p class="text-[13px] text-[#0D2137] dark:text-white mt-3 font-medium bg-gray-50 dark:bg-slate-800/40 p-4 border-l-4 ${isPositivo ?'border-green-400' : 'border-orange-400'} rounded-r-lg">"${f.descricao}"</p>
                
                <div class="flex flex-wrap items-center mt-4 text-[11px] text-[#6B7A8D] dark:text-slate-400 font-bold">
                    <div class="flex items-center bg-[#F0F3F7] dark:bg-slate-800 px-3 py-1.5 rounded-l-lg border border-[#D8E0EA] dark:border-slate-700"><i data-lucide="user-check" class="w-3 h-3 mr-1 text-[#C8922A]"></i> Avaliador: <span class="text-[#0D2137] dark:text-white ml-1">${autorNome}</span></div>
                    <div class="flex items-center bg-[#1A2E44] dark:bg-blue-600 text-white px-3 py-1.5 rounded-r-lg border border-[#1A2E44] dark:border-blue-600 shadow-sm"><i data-lucide="target" class="w-3 h-3 mr-1 text-blue-300"></i> Avaliado: <span class="ml-1">${alvoNome}</span></div>
                </div>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-4 flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity justify-start h-full absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
               ${deleteBtn}
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h2 class="text-3xl font-bold font-sora text-[#0D2137] dark:text-white flex items-center"><i data-lucide="message-square" class="w-8 h-8 mr-3 text-[#C8922A]"></i> Avaliação Módulo 360°</h2>
                    <p class="text-sm text-[#6B7A8D] dark:text-slate-400 mt-1">Ferramenta gerencial para apontar elogios, oportunidades de melhoria e acompanhamento humano.</p>
                </div>
                <button onclick="window.abrirModalFeedback()" class="bg-[#C8922A] text-white px-5 py-3 rounded-lg text-sm font-bold shadow-md hover:bg-[#a67923] transition-colors flex items-center whitespace-nowrap"><i data-lucide="edit-3" class="w-4 h-4 mr-2"></i> Nova Avaliação</button>
            </div>

            <div class="flex gap-4 mb-6">
                <div class="flex-1 bg-white dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center justify-between border-l-4 border-l-green-500 transition-colors">
                    <div>
                        <p class="text-[10px] uppercase font-bold text-[#6B7A8D] dark:text-slate-400 tracking-widest">Feedback Positivo</p>
                        <h4 class="text-2xl font-bold text-[#0D2137] dark:text-white mt-1">${totalElogios}</h4>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center"><i data-lucide="thumbs-up" class="text-green-500 w-5 h-5"></i></div>
                </div>
                <div class="flex-1 bg-white dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center justify-between border-l-4 border-l-orange-500 transition-colors">
                    <div>
                        <p class="text-[10px] uppercase font-bold text-[#6B7A8D] dark:text-slate-400 tracking-widest">Oportunidades de Correção</p>
                        <h4 class="text-2xl font-bold text-[#0D2137] dark:text-white mt-1">${feedAtivos.length - totalElogios}</h4>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center"><i data-lucide="alert-circle" class="text-orange-500 w-5 h-5"></i></div>
                </div>
            </div>

            <div class="flex flex-col mt-4">
                ${rows || `<div class="p-12 text-center border-2 border-dashed border-[#D8E0EA] dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/40"><i data-lucide="message-circle" class="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3"></i><p class="text-[#6B7A8D] dark:text-slate-400 font-bold">Sem registros de feedbacks lançados.</p></div>`}
            </div>
        </div>
    `;
}
