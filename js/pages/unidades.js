import { getInitials } from '../core/utils.js';
import { state, renderApp } from '../core/module-helpers.js';

window.verEfetivoUnidade = function(id) { state.ui.modalViewUnidadeId = id; renderApp(); }

export function renderUnidadesPage(container) {
    // Mapeador Numérico do Efetivo Lotado
    const lotados = {};
    (state.db.servidores || []).forEach(s => {
        if (s.situacao === 'Ativo' && s.unidades) {
            lotados[s.unidades.id] = (lotados[s.unidades.id] || 0) + 1;
        }
    });

    // Filtra UOPs e UIs, mantendo apenas Superintendência (Sede) e as 5 Delegacias
    const unidadesPrincipais = (state.db.unidades || []).filter(u => u.tipo === 'Sede' || u.tipo === 'Delegacia');
    const numUnidades = unidadesPrincipais.length;

    const cardsUnidades = unidadesPrincipais.map(u => {
        const totalAlocados = lotados[u.id] || 0;
        
        let headerColor = u.tipo === 'Sede' ?'bg-[#1A2E44] dark:bg-[#0f1b29]' : (u.tipo === 'Delegacia' ?'bg-[#1E3A8A] dark:bg-[#1e3a8a]/70' : 'bg-[#eab308] dark:bg-yellow-700');
        let textColor = u.tipo === 'Sede' || u.tipo === 'Delegacia' ?'text-white' : 'text-[#0D2137] dark:text-white';
        
        const alertTag = totalAlocados === 0 ?`<span class="px-2 py-0.5 ml-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-[10px] font-bold rounded-lg border border-red-200 dark:border-red-800 shadow-sm animate-pulse">VAZIO</span>` : '';

        return `
        <div class="bg-white dark:bg-[#1A2E44] rounded-xl shadow-sm border border-[#D8E0EA] dark:border-slate-700 hover:shadow-md transition-all group flex flex-col min-h-max cursor-pointer transform hover:-translate-y-1" onclick="window.verEfetivoUnidade('${u.id}')">
            <div class="${headerColor} ${textColor} px-5 py-4 border-b border-[#D8E0EA] dark:border-slate-700 flex items-center justify-between rounded-t-xl shrink-0 transition-colors">
                <div>
                    <span class="text-[10px] font-black tracking-widest uppercase opacity-80">${u.tipo}</span>
                    <h4 class="text-lg font-bold font-sora leading-tight flex items-center mt-1">${u.sigla} ${alertTag}</h4>
                </div>
                <div class="w-10 h-10 rounded-full bg-black/20 flex justify-center items-center shadow-inner">
                    <i data-lucide="${u.tipo === 'Sede' ?'building-2' : 'map-pin'}" class="w-5 h-5"></i>
                </div>
            </div>
            <div class="p-5 flex-col justify-between shrink-0">
                <div class="mb-4">
                    <span class="text-[9px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest block mb-1">Geolocalização / Endereço</span>
                    <p class="text-xs font-bold text-[#0D2137] dark:text-slate-200 flex items-center"><i data-lucide="map" class="w-3 h-3 text-[#C8922A] mr-1"></i> ${u.cidade} - BR ${u.br} KM ${u.km}</p>
                    <p class="text-[10px] text-[#6B7A8D] dark:text-slate-500 mt-1 truncate">${u.nome}</p>
                </div>
                <div class="bg-[#F8FAFC] dark:bg-slate-800/50 p-3 rounded-lg border border-[#D8E0EA] dark:border-slate-700 flex justify-between items-center transition-colors">
                    <span class="text-[10px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wide">Policiamento Ativo</span>
                    <span class="text-[15px] font-black font-sora text-[#0D2137] dark:text-white">${totalAlocados} servidor(es)</span>
                </div>
            </div>
            <div class="bg-gray-50 dark:bg-[#0f1b29] px-5 py-3 border-t border-[#D8E0EA] dark:border-slate-700 rounded-b-xl flex items-center justify-between mt-auto shrink-0 transition-colors">
               <span class="text-[11px] font-bold text-blue-600 dark:text-blue-400 ml-auto flex items-center hover:text-blue-800 dark:hover:text-blue-300"><i data-lucide="users" class="w-3 h-3 mr-1"></i> Ver Efetivo</span>
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = `
      <div class="p-6 space-y-6 animate-fade-in custom-scrollbar overflow-y-auto w-full h-full"> 
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 w-full mb-6">
          <div>
            <h3 class="text-xl font-bold text-[#0D2137] dark:text-blue-100 font-sora">Distribuição Territorial</h3>
            <p class="text-sm text-[#6B7A8D] dark:text-slate-400">Mapa de alocação das Superintendências e Delegacias ativas.</p>
          </div>
          <div class="flex space-x-3">
             <div class="bg-white dark:bg-[#1A2E44] border text-[#0D2137] dark:text-slate-300 text-sm border-[#D8E0EA] dark:border-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center transition-colors">
                 Total Cadastrado: <strong class="ml-2 text-blue-600 dark:text-blue-400">${numUnidades} Base(s) Principais</strong>
             </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full pb-10">
            ${cardsUnidades || `<div class="col-span-full p-8 text-center text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-[#D8E0EA] dark:border-slate-700">Nenhuma unidade operacional encontrada na federação.</div>`}
        </div>
        
        ${state.ui.modalViewUnidadeId ?renderModalUnidadeHTML() : ''}
      </div>
    `;

    lucide.createIcons();
}

function renderModalUnidadeHTML() {
    const u = state.db.unidades.find(x => String(x.id) === String(state.ui.modalViewUnidadeId));
    if (!u) return '';
    
    // Lista apenas Servidores Ativos que o `unidade_id` bate com a delegacia clicada
    const servidoresBase = (state.db.servidores || []).filter(s => String(s.unidade_id) === String(u.id) && s.situacao === 'Ativo');
    
    // Transcreve O Efetivo em Linhas HTML
    const listaHtml = servidoresBase.length > 0 ?servidoresBase.map(s => `
        <div class="flex items-center justify-between p-4 border-b border-[#D8E0EA] dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-[#1A2E44] dark:bg-[#0f1b29] text-white flex items-center justify-center font-bold text-xs mr-3 shadow-sm border border-blue-900 dark:border-slate-700">${getInitials(s.nome)}</div>
                <div>
                    <p class="text-sm font-bold text-[#0D2137] dark:text-white">${s.nome}</p>
                    <p class="text-xs text-[#6B7A8D] dark:text-slate-400 font-mono tracking-wide">${s.postos?.nome || 'Operador'}</p>
                </div>
            </div>
            <button class="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg transition-colors flex items-center" onclick="window.abrirVisualizacao('${s.id}')">Ver Ficha</button>
        </div>
    `).join('') : '<div class="text-center text-sm text-gray-500 dark:text-slate-500 py-10">Nenhum Policial Ativo Registrado.</div>';

    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-[#000000]/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in p-4 overflow-y-auto">
        <div class="bg-white dark:bg-[#1A2E44] rounded-xl shadow-2xl w-full max-w-lg border border-[#D8E0EA] dark:border-slate-700 p-0 relative overflow-hidden flex flex-col max-h-[85vh]">
            <div class="bg-[#1A2E44] dark:bg-[#0f1b29] text-white p-6 border-b border-[#11273D] dark:border-slate-800 relative shrink-0">
                <button onclick="window.verEfetivoUnidade(null)" class="absolute top-4 right-4 p-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                <div class="flex items-center">
                    <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                        <i data-lucide="building" class="w-6 h-6 text-white"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold font-sora tracking-wide">${u.sigla}</h3>
                        <p class="text-xs text-blue-200 mt-1 uppercase tracking-widest font-semibold">${u.tipo} - ${u.cidade}</p>
                    </div>
                </div>
            </div>
            <div class="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-[#D8E0EA] dark:border-slate-700 px-6 py-2 flex items-center justify-between shrink-0">
                <span class="text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wider">Policiamento Diário</span>
                <span class="text-xs font-bold bg-[#1A2E44] dark:bg-blue-900 text-white px-2 py-0.5 rounded-md shadow-sm">${servidoresBase.length} Ativo(s)</span>
            </div>
            <div class="overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900/50 flex-1 relative">
                ${listaHtml}
            </div>
            <div class="bg-gray-50 dark:bg-slate-800 border-t border-[#D8E0EA] dark:border-slate-700 px-6 py-4 shrink-0 flex justify-between">
                <button class="text-sm font-bold text-[#6B7A8D] dark:text-slate-400 hover:text-[#0D2137] dark:hover:text-white transition-colors" onclick="window.verEfetivoUnidade(null)">Fechar Janela</button>
            </div>
        </div>
      </div>
    `;
}
