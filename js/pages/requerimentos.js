import { API_BASE_URL } from '../core/constants.js';
import { apiRequestJson } from '../core/api.js';
import { state, renderApp, carregarDados } from '../core/module-helpers.js';

window.abrirModalRequerimento = function() {
    state.ui.modalAddRequerimentoOpen = true;
    renderApp();
}
window.fecharModalRequerimento = function() {
    state.ui.modalAddRequerimentoOpen = false;
    renderApp();
}
window.salvarRequerimento = async function(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-req');
    const oldHtml = btn.innerHTML;
    btn.innerHTML = 'Enviando ao Protocolo...'; btn.disabled = true;

    const form = event.target;
    // Puxa valores
    const pld = {
        servidor_id: state.user.id,
        tipo: form.querySelector('#req-tipo').value,
        descricao: form.querySelector('#req-desc').value,
        data_inicio: form.querySelector('#req-inicio').value,
        data_fim: form.querySelector('#req-fim').value || null,
        status: 'Pendente'
    };

    try {
        await apiRequestJson(`${API_BASE_URL}/requerimentos`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pld)
        }, 'Erro critico no protocolo.');
        alert('Requerimento protocolado com sucesso! Aguarde a análise do Comando.');
        state.ui.modalAddRequerimentoOpen = false;
        await carregarDados(); renderApp();
    } catch(err) {
        alert(err.message);
        btn.innerHTML = oldHtml; btn.disabled = false;
    }
}
window.alterarStatusRequerimento = async function(id, novoStatus) {
    if(!confirm(`Confirma a alteração do protocolo para ${novoStatus.toUpperCase()}?`)) return;
    try {
        await apiRequestJson(`${API_BASE_URL}/requerimentos/${id}/status`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        }, 'Erro critico na atualizacao.');
        await carregarDados(); renderApp();
    } catch(err) { alert(err.message); }
}

export function renderModalAddRequerimentoHTML() {
    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in custom-scrollbar overflow-y-auto">
        <form onsubmit="window.salvarRequerimento(event)" class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-2xl w-full max-w-lg border border-[#D8E0EA] dark:border-slate-700 flex flex-col mt-10 md:mt-0">
            <div class="bg-[#1A2E44] dark:bg-[#0f1b29] text-white p-6 relative shrink-0 rounded-t-xl border-b dark:border-slate-800">
                <button type="button" onclick="window.fecharModalRequerimento()" class="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                <div class="w-10 h-10 bg-amber-500 rounded-full flex justify-center items-center mb-3 shadow-md"><i data-lucide="file-signature" class="w-5 h-5 text-white"></i></div>
                <h3 class="text-xl font-bold font-sora">Protocolar E-Doc (SEI)</h3>
                <p class="text-[10px] text-blue-200 dark:text-slate-400 mt-1 uppercase tracking-widest font-mono">Movimentação Interna e Afastamento</p>
            </div>
            
            <div class="bg-white dark:bg-[#0f1b29] p-6 flex flex-col space-y-4">
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Natureza do Pedido *</label>
                    <select id="req-tipo" required class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white">
                        <option value="Férias">Afastamento: Férias Regulamentares</option>
                        <option value="Licença Médica">Afastamento: Licença Médica</option>
                        <option value="Troca de Plantão">Despacho: Troca de Plantão</option>
                        <option value="Abono de Permanência">Benefício: Abono de Permanência</option>
                        <option value="Outros">Outros Termos Governamentais</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Data de Início *</label>
                        <input id="req-inicio" required type="date" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Data Término (Opcional)</label>
                        <input id="req-fim" type="date" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-bold text-[#0D2137] dark:text-white" />
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Justificativa e Detalhamento da Demanda *</label>
                    <textarea id="req-desc" required rows="4" placeholder="Escreva os fundamentos legais e motivos operacionais para sua petição..." class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 font-medium text-[#0D2137] dark:text-slate-200"></textarea>
                </div>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-800/80 p-4 border-t border-[#D8E0EA] dark:border-slate-700 shrink-0 rounded-b-xl">
               <button type="submit" id="btn-submit-req" class="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-900 transition-all flex items-center justify-center shadow-md shadow-blue-900/20 uppercase tracking-wider text-[11px] border border-blue-500/50">
                    <i data-lucide="send" class="w-4 h-4 mr-2"></i> Assinar Digitalmente e Enviar
                </button>
            </div>
        </form>
      </div>
    `;
}

export function renderRequerimentosPage(container) {
    const isAdmin = state.user?.postos?.permissoes === 'Admin';
    // Se for admin, vê todos, se for normal, vê só os seus
    const reqsAtivos = isAdmin ?(state.db.requerimentos || []) : ((state.db.requerimentos || []).filter(r => String(r.servidor_id) === String(state.user.id)));
    
    const pendentes = reqsAtivos.filter(r => r.status === 'Pendente').length;
    
    const rows = reqsAtivos.map(r => {
        let tagHtml = '';
        if (r.status === 'Deferido') tagHtml = `<span class="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-[10px] tracking-wide uppercase"><i data-lucide="check" class="w-3 h-3 mr-1 inline"></i> DEFERIDO</span>`;
        else if (r.status === 'Indeferido') tagHtml = `<span class="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-[10px] tracking-wide uppercase"><i data-lucide="x" class="w-3 h-3 mr-1 inline"></i> INDEFERIDO</span>`;
        else tagHtml = `<span class="bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded text-[10px] tracking-wide uppercase"><i data-lucide="loader-2" class="w-3 h-3 mr-1 inline animate-spin"></i> Análise Pendente</span>`;
        
        const dataIn = r.data_inicio ?r.data_inicio.split('-').reverse().join('/') : 'N/A';
        const dataOut = r.data_fim ?r.data_fim.split('-').reverse().join('/') : 'Indeterminado';
        const servName = r.servidores?.nome || 'Você';
        const protocoloData = new Date(r.data_solicitacao).toLocaleDateString('pt-BR');

        // Controles de Chefia
        let chefiaActions = '';
        if (isAdmin && r.status === 'Pendente') {
            chefiaActions = `
                <div class="flex space-x-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <button onclick="window.alterarStatusRequerimento('${r.id}', 'Deferido')" class="flex-1 sm:flex-none justify-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center object-center"><i data-lucide="check-square" class="w-3 h-3 mr-1"></i> Autorizar</button>
                    <button onclick="window.alterarStatusRequerimento('${r.id}', 'Indeferido')" class="flex-1 sm:flex-none justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center object-center"><i data-lucide="x-square" class="w-3 h-3 mr-1"></i> Negar</button>
                </div>
            `;
        }

        return `
        <div class="bg-white dark:bg-[#0f1b29] border text-left border-[#D8E0EA] dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 p-5 animate-fade-in group transition-colors">
            <div class="flex flex-col sm:flex-row justify-between items-start">
               <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                     <span class="font-mono text-[9px] text-[#6B7A8D] dark:text-slate-400 bg-[#F0F3F7] dark:bg-slate-800 px-2 py-1 rounded tracking-widest border border-gray-200 dark:border-slate-700">PROT#${r.id.toString().padStart(6,'0')}</span>
                     ${tagHtml}
                  </div>
                  <h4 class="text-[14px] font-bold text-[#0D2137] dark:text-white tracking-tight uppercase">${r.tipo}</h4>
                  <p class="text-[12px] text-[#6B7A8D] dark:text-slate-300 mt-2 mb-3 leading-relaxed border-l-2 border-[#C8922A] pl-3">"${r.descricao}"</p>
                  
                  <div class="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold tracking-widest">
                     <div class="flex items-center"><i data-lucide="calendar" class="w-3 h-3 mr-1.5 text-[#C8922A]"></i> Origem: <span class="text-[#0D2137] dark:text-white ml-1">${protocoloData}</span></div>
                     <div class="flex items-center"><i data-lucide="arrow-right-circle" class="w-3 h-3 mr-1.5 text-blue-500"></i> Gozo: <span class="text-[#0D2137] dark:text-white ml-1">${dataIn} até ${dataOut}</span></div>
                     ${isAdmin ?`<div class="flex items-center ml-auto font-mono text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800"><i data-lucide="user" class="w-3 h-3 mr-1"></i> REQUISITANTE: ${servName}</div>` : ''}
                  </div>
               </div>
               ${chefiaActions}
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h2 class="text-3xl font-bold font-sora text-[#0D2137] dark:text-white flex items-center"><i data-lucide="file-text" class="w-8 h-8 mr-3 text-[#C8922A]"></i> Requerimentos Eletrônicos</h2>
                    <p class="text-sm text-[#6B7A8D] dark:text-slate-400 mt-1">SEI Eletrônico: Realize despachos, peticionamentos, e acompanhe deferimentos na chefia.</p>
                </div>
                <button onclick="window.abrirModalRequerimento()" class="bg-[#C8922A] text-white px-5 py-3 rounded-lg text-sm font-bold shadow-md hover:bg-[#a67923] transition-colors flex items-center whitespace-nowrap"><i data-lucide="plus" class="w-4 h-4 mr-2"></i> Adicionar Petição</button>
            </div>

            <div class="flex gap-4 mb-6">
                <div class="flex-1 bg-white dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                        <p class="text-[10px] uppercase font-bold text-[#6B7A8D] dark:text-slate-400 tracking-widest">Aguardando Avaliação (Geral)</p>
                        <h4 class="text-2xl font-bold text-[#0D2137] dark:text-white mt-1">${pendentes}</h4>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center"><i data-lucide="clock" class="text-amber-500 w-5 h-5"></i></div>
                </div>
                <div class="flex-1 bg-white dark:bg-[#0f1b29] border border-[#D8E0EA] dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                        <p class="text-[10px] uppercase font-bold text-[#6B7A8D] dark:text-slate-400 tracking-widest">Protocolos Totais (Visíveis)</p>
                        <h4 class="text-2xl font-bold text-[#0D2137] dark:text-white mt-1">${reqsAtivos.length}</h4>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center"><i data-lucide="folder" class="text-blue-500 w-5 h-5"></i></div>
                </div>
            </div>

            <h3 class="text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase mb-4 mt-8 flex items-center tracking-widest border-b border-[#D8E0EA] dark:border-slate-700 pb-2"><i data-lucide="inbox" class="w-4 h-4 mr-2"></i> Resumo de Protocolos (SEI)</h3>
            <div class="flex flex-col">
                ${rows || `<div class="p-12 text-center border-2 border-dashed border-[#D8E0EA] dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/40"><i data-lucide="file-x-2" class="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3"></i><p class="text-[#6B7A8D] dark:text-slate-400 font-bold">Não há nenhum requerimento protocolado na sua conta no momento.</p></div>`}
            </div>
        </div>
    `;
}
