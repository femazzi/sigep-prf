import { getInitials } from '../core/utils.js';
import { state } from '../core/module-helpers.js';

export function renderTalentosPage(container) {
    const listagemNomesComp = (state.db.masterCompetencias || []).map(c => `<option value="${c.nome}" ${state.ui.filtroTalentoCompetencia === c.nome ?'selected' : ''}>${c.nome}</option>`).join('');
    
    // Filtro Lógico
    let filtrados = state.db.servidores || [];
    
    // Aplicar Filtro de Tempo de Serviço Policial (Senioridade)
    if (state.ui.filtroTalentoTempo) {
        filtrados = filtrados.filter(s => {
            if (!s.data_ingresso) return false;
            const anosAtivos = (new Date() - new Date(s.data_ingresso)) / 31557600000; // milissegundos num ano
            if (state.ui.filtroTalentoTempo === '0-5') return anosAtivos >= 0 && anosAtivos <= 5;
            if (state.ui.filtroTalentoTempo === '5-10') return anosAtivos > 5 && anosAtivos <= 10;
            if (state.ui.filtroTalentoTempo === '10-20') return anosAtivos > 10 && anosAtivos <= 20;
            if (state.ui.filtroTalentoTempo === '20+') return anosAtivos > 20;
            return true;
        });
    }

    if (state.ui.filtroTalentoCompetencia || state.ui.filtroTalentoNivel) {
        const qComp = (state.ui.filtroTalentoCompetencia || '').toLowerCase().trim();
        const qNivel = (state.ui.filtroTalentoNivel || '').toLowerCase().trim();
        
        filtrados = filtrados.filter(s => {
            const compsServidor = (state.db.competencias || []).filter(c => String(c.servidor_id) === String(s.id));
            if (compsServidor.length === 0) return false;
            
            return compsServidor.some(c => {
                const cNome = (c.competencias?.nome || c.nome || '').toLowerCase().trim();
                const cNivel = (c.nivel || '').toLowerCase().trim();
                const matchComp = qComp ?cNome === qComp : true;
                const matchNivel = qNivel ?cNivel === qNivel : true;
                return matchComp && matchNivel;
            });
        });
    }

    const cards = filtrados.map(s => {
        // Obter competencias formatadas pra printar no Card
        const comp = (state.db.competencias || []).filter(c => String(c.servidor_id) === String(s.id)).slice(0, 3);
        const badgesHtml = comp.map(c => `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1A2E44] text-white mb-1 mr-1 shadow-sm uppercase"><i data-lucide="award" class="w-3 h-3 mr-0.5 text-[#C8922A]"></i>${c.competencias?.nome || c.nome} <span class="ml-1 opacity-70 border-l border-white/20 pl-1">${c.nivel || 'Ope'}</span></span>`).join('');
        const badgeCount = (state.db.competencias || []).filter(c => String(c.servidor_id) === String(s.id)).length;
        const extraBadges = badgeCount > 3 ?`<span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-gray-200 text-gray-600 mb-1">+${badgeCount - 3}</span>` : '';

        return `
        <div class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-sm border border-[#D8E0EA] dark:border-slate-700 p-5 hover:border-blue-300 dark:hover:border-blue-500 transition-all hover:-translate-y-1 flex flex-col justify-between cursor-pointer group" onclick="window.abrirVisualizacao('${s.id}')">
            <div class="flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-full bg-[#1A2E44] dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xl mb-3 shadow-inner border-2 border-white dark:border-slate-700 group-hover:bg-[#C8922A] dark:group-hover:bg-[#C8922A] transition-colors">${getInitials(s.nome)}</div>
                <h4 class="font-bold text-[#0D2137] dark:text-white text-sm line-clamp-1">${s.nome}</h4>
                <p class="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-widest mt-1">${s.postos?.nome || 'Operador Local'}</p>
                <div class="mt-2 text-xs font-semibold px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono flex items-center border border-transparent dark:border-blue-800"><i data-lucide="map-pin" class="w-3 h-3 mr-1 inline"></i>${s.unidades?.nome || 'Sem Lotação'}</div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/80 min-h-[60px] flex flex-wrap justify-center content-start">
                ${badgesHtml || '<span class="text-[10px] text-gray-400 dark:text-slate-500 font-medium my-auto"><i data-lucide="slash" class="w-3 h-3 inline mr-1"></i>Curriculo Básico</span>'}
                ${extraBadges}
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h2 class="text-3xl font-bold font-sora text-[#0D2137] dark:text-white flex items-center"><i data-lucide="target" class="w-8 h-8 mr-3 text-[#C8922A]"></i> Banco de Talentos</h2>
                    <p class="text-sm text-[#6B7A8D] dark:text-slate-400 mt-1">Busque especialistas, atiradores, pilotos ou instrutores pelo catálogo corporativo para formar grupos de Comando e Operação Especiais.</p>
                </div>
            </div>

            <div class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-sm border border-[#D8E0EA] dark:border-slate-700 p-6 mb-8 relative overflow-hidden transition-colors">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#F8FAFC] dark:bg-slate-800/20 rounded-bl-full -z-10 border-b border-l border-[#D8E0EA] dark:border-slate-700/50 pointer-events-none"></div>
                <h3 class="text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase mb-4 flex items-center"><i data-lucide="filter" class="w-4 h-4 mr-2"></i> Filtros Estratégicos de Prospecção</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label class="block text-[10px] font-bold text-[#0D2137] dark:text-slate-300 uppercase tracking-wider mb-2">Valência Doutrinária</label>
                        <select id="filtro-talento-competencia" class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#C8922A] dark:text-white appearance-none transition-colors" onchange="state.ui.filtroTalentoCompetencia = this.value; renderApp()">
                            <option value="">-- Qualquer Valência --</option>
                            ${listagemNomesComp}
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-[#0D2137] dark:text-slate-300 uppercase tracking-wider mb-2">Nível Técnico</label>
                        <select id="filtro-talento-nivel" class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#C8922A] dark:text-white appearance-none transition-colors" onchange="state.ui.filtroTalentoNivel = this.value; renderApp()">
                            <option value="">-- Qualquer Patamar --</option>
                            <option value="Aprendiz" ${state.ui.filtroTalentoNivel === 'Aprendiz' ?'selected' : ''}>Aprendiz</option>
                            <option value="Operacional" ${state.ui.filtroTalentoNivel === 'Operacional' ?'selected' : ''}>Operacional</option>
                            <option value="Avançado" ${state.ui.filtroTalentoNivel === 'Avançado' ?'selected' : ''}>Avançado</option>
                            <option value="Especialista" ${state.ui.filtroTalentoNivel === 'Especialista' ?'selected' : ''}>Especialista</option>
                            <option value="Instrutor" ${state.ui.filtroTalentoNivel === 'Instrutor' ?'selected' : ''}>Instrutor</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-[#0D2137] dark:text-slate-300 uppercase tracking-wider mb-2">Tempo Atuação (PRF)</label>
                        <select id="filtro-talento-tempo" class="w-full p-3 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#C8922A] dark:text-white appearance-none transition-colors" onchange="state.ui.filtroTalentoTempo = this.value; renderApp()">
                            <option value="">-- Qualquer Senioridade --</option>
                            <option value="0-5" ${state.ui.filtroTalentoTempo === '0-5' ?'selected' : ''}>Novatos (Até 5 Anos)</option>
                            <option value="5-10" ${state.ui.filtroTalentoTempo === '5-10' ?'selected' : ''}>Seniores (5 a 10 Anos)</option>
                            <option value="10-20" ${state.ui.filtroTalentoTempo === '10-20' ?'selected' : ''}>Veteranos (10 a 20 Anos)</option>
                            <option value="20+" ${state.ui.filtroTalentoTempo === '20+' ?'selected' : ''}>Master (20+ Anos)</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="state.ui.filtroTalentoCompetencia=''; state.ui.filtroTalentoNivel=''; state.ui.filtroTalentoTempo=''; renderApp()" class="w-full px-6 py-3 bg-[#F0F3F7] dark:bg-slate-800 hover:bg-[#D8E0EA] dark:hover:bg-slate-700 text-[#6B7A8D] dark:text-slate-300 font-bold text-sm rounded-lg transition-colors border border-transparent hover:border-[#6B7A8D] dark:hover:border-slate-500">Restaurar Base</button>
                    </div>
                </div>
            </div>

            <h3 class="text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest border-b border-[#D8E0EA] dark:border-slate-700 pb-2 mb-6"><i data-lucide="users" class="w-3 h-3 mr-1 inline"></i>${filtrados.length} Operador(es) Identificado(s) pelo Radar</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${cards || '<div class="col-span-full py-16 text-center text-gray-400 font-bold border border-dashed border-[#D8E0EA] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f1b29] rounded-xl"><i data-lucide="ghost" class="w-10 h-10 mx-auto mb-3 opacity-30 text-[#0D2137] dark:text-white"></i> Nenhum talento com estes extratos exatos foi localizado nas delegacias.</div>'}
            </div>
        </div>
    `;
}
