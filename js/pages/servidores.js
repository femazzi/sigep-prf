import { API_BASE_URL } from '../core/constants.js';
import { apiRequestJson } from '../core/api.js';
import { getInitials } from '../core/utils.js';
import { state, renderApp, carregarServidores } from '../core/module-helpers.js';

export function renderServidoresPage(container) {
    // Filtra a lista pelo texto digitado.
    const filtered = state.db.servidores.filter(s => {
        const q = state.ui.searchQuery.toLowerCase();
        return (s.nome || '').toLowerCase().includes(q) || (s.cpf || '').includes(q) || (s.matricula || '').includes(q);
    });

    // Calcula a paginacao da tabela.
    const itemsPerPage = 8;
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (state.ui.currentPage > totalPages) state.ui.currentPage = totalPages;
    const startIndex = (state.ui.currentPage - 1) * itemsPerPage;
    const currentPageData = filtered.slice(startIndex, startIndex + itemsPerPage);

    // Define as acoes liberadas para o usuario atual.
    const isAdmin = state.user?.postos?.permissoes === 'Admin';
    
    // Monta as linhas da tabela.
    const tableRows = currentPageData.map(s => `
        <tr class="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-[#D8E0EA] dark:border-slate-700 last:border-0 group cursor-pointer">
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-[#1A2E44] dark:bg-[#0f1b29] text-white flex items-center justify-center font-bold shadow-md mr-3 text-sm border border-blue-900 dark:border-slate-700">${getInitials(s.nome)}</div>
                    <div>
                        <p class="text-sm font-bold text-[#0D2137] dark:text-white flex items-center mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${s.nome}</p>
                        <p class="text-xs text-[#6B7A8D] dark:text-slate-400 font-mono select-all">Matrícula: ${s.matricula || '---'}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4"><span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800">${s.postos?.nome || 'Admin'}</span></td>
            <td class="px-6 py-4 text-sm font-semibold text-[#0D2137] dark:text-slate-200">${s.unidades?.sigla || '---'}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 ${s.situacao === 'Ativo' ?'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'} text-xs font-bold rounded-full border">
                ${s.situacao}
                </span>
            </td>
            <td class="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <button onclick="abrirVisualizacao('${s.id}')" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors mr-1" title="Visualizar Ficha">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
                ${(isAdmin || String(s.id) === String(state.user.id)) ?`<button onclick="abrirEdicao('${s.id}')" class="p-2 text-[#C8922A] hover:bg-orange-50 dark:hover:bg-amber-900/40 rounded-lg transition-colors mr-1" title="Editar Seu Perfil"><i data-lucide="edit" class="w-4 h-4"></i></button>` : ''}
                ${isAdmin ?`<button onclick="deletarServidor('${s.id}')" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors" title="Demitir Servidor"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
            </td>
        </tr>
    `).join('');

    // Renderiza a tela.
    container.innerHTML = `
      <div class="p-6 space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 class="text-xl font-bold text-[#0D2137] dark:text-white font-sora">Efetivo Cadastrado</h3>
            <p class="text-sm text-[#6B7A8D] dark:text-slate-400">Gerencie credenciais, lotações e postos dos servidores ativos.</p>
          </div>
          <div class="flex space-x-3">
            ${isAdmin ?`<button id="btn-config-acesso" class="bg-white dark:bg-slate-800 text-[#0D2137] dark:text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-700 border border-[#D8E0EA] dark:border-slate-700 shadow-sm transition-all flex items-center">
              <i data-lucide="key" class="w-4 h-4 mr-2"></i> Tokens
            </button>` : ''}
            ${isAdmin ?`<button id="btn-add-servidor" class="bg-[#C8922A] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#a67923] shadow-md transition-all flex items-center">
              <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Cadastrar Servidor
            </button>` : ''}
          </div>
        </div>
        
        <div class="bg-white dark:bg-[#0f1b29] p-4 rounded-xl shadow-sm border border-[#D8E0EA] dark:border-slate-700 flex items-center transition-colors">
            <i data-lucide="search" class="w-5 h-5 text-[#6B7A8D] dark:text-slate-400 mr-3"></i>
            <input type="text" id="input-search" value="${state.ui.searchQuery}" placeholder="Buscar pelo Nome ou Matrícula..." class="flex-1 bg-transparent border-none outline-none text-sm text-[#0D2137] dark:text-white font-semibold"/>
        </div>

        <div class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-sm border border-[#D8E0EA] dark:border-slate-700 overflow-hidden transition-colors">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-[#F8FAFC] dark:bg-slate-800/50 border-b border-[#D8E0EA] dark:border-slate-700">
                            <th class="px-6 py-4 text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wider">Identificação do Servidor</th>
                            <th class="px-6 py-4 text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wider">Posto Hierárquico</th>
                            <th class="px-6 py-4 text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wider">Lotação</th>
                            <th class="px-6 py-4 text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wider text-right">Ação Restrita</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows || '<tr><td colspan="5" class="p-6 text-center text-gray-500 dark:text-slate-500">Nenhum Servidor Localizado no Efetivo</td></tr>'}</tbody>
                </table>
            </div>
            
            <!-- Paginação Vanilla -->
            <div class="px-6 py-4 border-t border-[#D8E0EA] dark:border-slate-700 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-800/30">
                <span class="text-sm text-[#6B7A8D] dark:text-slate-400 font-semibold">Exibindo ${startIndex + 1} até ${Math.min(startIndex + itemsPerPage, filtered.length)} de ${filtered.length} Registros</span>
                <div class="space-x-2 flex">
                    <button id="btn-prev-page" class="px-4 py-2 border border-[#D8E0EA] dark:border-slate-600 dark:bg-slate-800 text-[#0D2137] dark:text-white rounded-lg text-sm font-semibold hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 transition-colors" ${state.ui.currentPage === 1 ?'disabled' : ''}>Anterior</button>
                    <button id="btn-next-page" class="px-4 py-2 border border-[#D8E0EA] dark:border-slate-600 dark:bg-slate-800 text-[#0D2137] dark:text-white rounded-lg text-sm font-semibold hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 transition-colors" ${state.ui.currentPage >= totalPages ?'disabled' : ''}>Próximo</button>
                </div>
            </div>
        </div>
      </div>
    `;

    lucide.createIcons();

    const searchInput = document.getElementById('input-search');
    searchInput.oninput = (e) => { state.ui.searchQuery = e.target.value; state.ui.currentPage = 1; renderApp(); };
    searchInput.focus();
    const val = searchInput.value; searchInput.value = ''; searchInput.value = val;

    document.getElementById('btn-prev-page').onclick = () => { if (state.ui.currentPage > 1) { state.ui.currentPage--; renderApp(); } };
    document.getElementById('btn-next-page').onclick = () => { if (state.ui.currentPage < totalPages) { state.ui.currentPage++; renderApp(); } };
    
    if (isAdmin) {
        document.getElementById('btn-add-servidor').onclick = () => { state.ui.modalEditId = null; state.ui.isModalOpen = true; renderApp(); };
        document.getElementById('btn-config-acesso').onclick = () => { state.ui.isConfigOpen = true; renderApp(); };
    }

    if(state.ui.isModalOpen) bindModalEvents();
    if(state.ui.modalViewId) document.getElementById('btn-close-view').onclick = () => { state.ui.modalViewId = null; renderApp(); };
    if(state.ui.isConfigOpen) bindConfigEvents();
}

/**
 * Atalhos globais usados pelos botoes do HTML dinamico.
 */
window.abrirVisualizacao = function(id) { 
    state.page = 'servidores'; // Garante a volta para a aba de servidores.
    state.ui.modalViewId = id; 
    renderApp(); 
}
window.abrirEdicao = function(id) { state.ui.modalEditId = id; state.ui.isModalOpen = true; renderApp(); }

export function renderModalHTML() {
    const isEdit = !!state.ui.modalEditId;
    const s = isEdit ?state.db.servidores.find(x => String(x.id) === String(state.ui.modalEditId)) || {} : {};

    const unidadesOptions = state.db.unidades.map(u => `<option value="${u.id}" ${String(u.id) === String(s.unidade_id) ?'selected' : ''}>${u.sigla} - ${u.nome}</option>`).join('');
    const postosOptions = state.db.postos.map(p => `<option value="${p.id}" ${p.id === s.posto_id ?'selected' : ''}>${p.nome}</option>`).join('');

    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4 overflow-y-auto">
        <div class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-2xl w-full max-w-2xl border border-[#D8E0EA] dark:border-slate-700 my-8 relative">
            <button id="btn-close-modal" class="absolute top-4 right-4 p-2 text-[#6B7A8D] dark:text-slate-400 hover:bg-[#F0F3F7] dark:hover:bg-slate-800 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
            <div class="px-8 py-6 border-b border-[#D8E0EA] dark:border-slate-700">
                <h3 class="text-xl font-bold text-[#0D2137] dark:text-white font-sora">${isEdit ?'Editar Operador' : 'Registrar Oficial da PRF'}</h3>
                <p class="text-sm text-[#6B7A8D] dark:text-slate-400 mt-1">${isEdit ?'Atualize as credenciais no banco base.' : 'Preencha os dados primários. A senha gerada automaticamente será <strong>prf123</strong>.'}</p>
            </div>
            
            <form id="form-cadastrar" class="p-8 space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Nome Completo</label>
                      <input id="f-nome" value="${s.nome || ''}" required class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-[#0D2137] dark:focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Passaporte SIG (CPF)</label>
                      <input id="f-cpf" value="${s.cpf || ''}" required maxlength="11" placeholder="Apenas Números" class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-[#0D2137] dark:focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Data Nascimento</label>
                      <input type="date" id="f-nasc" value="${s.data_nascimento || ''}" required class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 dark:focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Data Ingresso (PRF)</label>
                      <input type="date" id="f-ingresso" value="${s.data_ingresso || ''}" required class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 dark:focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Telefone Celular</label>
                      <input id="f-telefone" value="${s.telefone || ''}" placeholder="(11) 98888-7777" class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 dark:focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Sexo Biológico</label>
                      <select id="f-sexo" class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 dark:focus:ring-blue-500 outline-none">
                         <option value="Masculino" ${s.sexo === 'Masculino' ?'selected' : ''}>Masculino</option>
                         <option value="Feminino" ${s.sexo === 'Feminino' ?'selected' : ''}>Feminino</option>
                         <option value="" ${!s.sexo ?'selected' : ''}>Não Informar</option>
                      </select>
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Lotação (Unidade Operacional)</label>
                      <select id="f-unidade" required class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 dark:focus:ring-blue-500 outline-none" ${state.user?.postos?.permissoes !== 'Admin' ?'disabled' : ''}>
                         <option value="">Selecione A Estrutura</option>${unidadesOptions}
                      </select>
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Cargo e Designação</label>
                      <select id="f-posto" required class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-2 dark:focus:ring-blue-500 outline-none" ${state.user?.postos?.permissoes !== 'Admin' ?'disabled' : ''}>
                         <option value="">Posto Hierárquico</option>${postosOptions}
                      </select>
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Matrícula</label>
                      <input id="f-matricula" value="${s.matricula || ''}" class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 outline-none filter" ${state.user?.postos?.permissoes !== 'Admin' ?'readonly' : ''} />
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Status Base</label>
                      <select id="f-situacao" class="w-full p-2.5 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 outline-none" ${state.user?.postos?.permissoes !== 'Admin' ?'disabled' : ''}>
                         <option value="Ativo" ${s.situacao === 'Ativo' ?'selected' : ''}>🟢 Na Ativa</option>
                         <option value="Afastado" ${s.situacao === 'Afastado' ?'selected' : ''}>🔴 Afastado do Quadro</option>
                      </select>
                   </div>
                </div>
                <div class="pt-6 mt-6 border-t border-[#D8E0EA] dark:border-slate-700 flex items-center justify-end space-x-3">
                   <button type="button" id="btn-cancel-modal" class="px-5 py-2.5 text-sm font-bold text-[#6B7A8D] dark:text-slate-400 hover:text-[#0D2137] dark:hover:text-white transition-colors">Cancelar Módulo</button>
                   <button type="submit" class="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-900/20 hover:from-blue-700 hover:to-blue-900 transition-all border border-blue-500/50">${isEdit ?'Atualizar Perfil' : 'Salvar Operador'}</button>
                </div>
            </form>
        </div>
      </div>
    `;
}

/**
 * Vincula os eventos do modal de cadastro e edicao.
 */
function bindModalEvents() {
    const isEdit = !!state.ui.modalEditId;
    const fechar = () => { state.ui.isModalOpen = false; state.ui.modalEditId = null; renderApp(); };
    document.getElementById('btn-close-modal').onclick = fechar;
    document.getElementById('btn-cancel-modal').onclick = fechar;
    
    document.getElementById('form-cadastrar').onsubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            nome: document.getElementById('f-nome').value,
            cpf: document.getElementById('f-cpf').value,
            data_nascimento: document.getElementById('f-nasc').value,
            telefone: document.getElementById('f-telefone').value,
            sexo: document.getElementById('f-sexo').value,
            situacao: document.getElementById('f-situacao').value,
            matricula: document.getElementById('f-matricula').value,
            unidade_id: document.getElementById('f-unidade').value,
            posto_id: document.getElementById('f-posto').value,
            data_ingresso: document.getElementById('f-ingresso').value
        };
        
        try {
            const url = isEdit ?`${API_BASE_URL}/servidores/${state.ui.modalEditId}` : `${API_BASE_URL}/servidores`;
            const method = isEdit ?'PUT' : 'POST';

            await apiRequestJson(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }, 'Erro critico de manipulacao.');
            
            fechar();
            await carregarServidores(); 
            renderApp();
            
        } catch (err) {
            alert(err.message);
        }
    };
}

/**
 * Modal de visualizacao do servidor.
 */
export function renderViewHTML() {
    const s = state.db.servidores.find(x => String(x.id) === String(state.ui.modalViewId));
    if (!s) return '';
    
    const isAdmin = state.user?.postos?.permissoes === 'Admin';
    const isOwnerOrAdmin = isAdmin || String(s.id) === String(state.user.id);
    
    // Historico de cursos do servidor.
    const minhasInscricoes = (state.db.inscricoes || []).filter(i => String(i.servidor_id) === String(s.id) && i.status !== 'Reprovado');
    const historicoOficial = minhasInscricoes.length > 0 ?minhasInscricoes.map(i => {
        const c = state.db.cursos.find(curso => String(curso.id) === String(i.capacitacao_id));
        if(!c) return '';
        let badgeColor = i.status === 'Aprovado' ?'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800' : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
        return `
           <div class="bg-white dark:bg-slate-800/40 border border-[#D8E0EA] dark:border-slate-700 p-3 rounded-lg flex justify-between items-center mb-2 shadow-sm transition-transform hover:-translate-y-0.5">
              <div>
                 <h5 class="font-bold text-[#0D2137] dark:text-slate-200 text-sm">${c.nome}</h5>
                 <p class="text-[10px] text-gray-500 dark:text-slate-400 font-mono tracking-widest uppercase mt-0.5">${c.instituicao || 'Polícia Rodoviária Federal'}</p>
              </div>
              <span class="px-3 py-1 rounded-md text-[10px] font-bold ${badgeColor} border uppercase tracking-widest flex items-center justify-center text-center"><i data-lucide="${i.status === 'Aprovado' ?'check-circle' : 'clock'}" class="w-3 h-3 mr-1 inline"></i> ${i.status}</span>
           </div>
        `;
    }).join('') : '<p class="text-xs text-gray-400 dark:text-slate-500 font-bold p-2 text-center border border-dashed border-[#D8E0EA] dark:border-slate-700 rounded-lg">Carga horária e matrículas em branco.</p>';

    // Competencias vinculadas ao servidor.
    const minhasCompetencias = (state.db.competencias || []).filter(c => String(c.servidor_id) === String(s.id));
    const historicoCompetencias = minhasCompetencias.map(c => `
         <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#1A2E44] text-white shadow-sm mr-2 mb-2 hover:bg-[#0D2137] transition-colors border border-blue-900 group">
            <i data-lucide="medal" class="w-3 h-3 mr-1 text-[#C8922A] inline"></i>${c.competencias?.nome || c.nome || 'Habilidade Desconhecida'} <span class="ml-1.5 opacity-70 font-mono text-[9px] uppercase border px-1 rounded border-[#ffffff30]">${c.nivel || 'Operacional'}</span>
            ${isOwnerOrAdmin ?`<button onclick="window.removerCompetencia('${c.id}')" class="ml-2 bg-red-500/20 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors group-hover:inline-block hidden"><i data-lucide="x" class="w-3 h-3"></i></button>` : ''}
         </span>
    `).join('');
    const btnAddCompetencia = isOwnerOrAdmin ?`<button onclick="window.adicionarCompetencia('${s.id}')" class="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold mt-2 transition-colors flex items-center shadow-sm w-full sm:w-auto"><i data-lucide="plus" class="w-3 h-3 mr-1 inline"></i> Nova Valência Livre</button>` : '';

    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in custom-scrollbar overflow-y-auto">
        <div class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-2xl w-full max-w-4xl border border-[#D8E0EA] dark:border-slate-700 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            
            <div class="md:w-1/3 bg-[#F8FAFC] dark:bg-slate-900 border-r border-[#D8E0EA] dark:border-slate-700 p-6 text-center flex flex-col justify-center relative items-center shrink-0">
                <button onclick="window.abrirVisualizacao(null)" class="md:hidden absolute top-4 right-4 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-gray-500 dark:text-slate-400"><i data-lucide="x" class="w-5 h-5"></i></button>
                <div class="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center bg-[#1A2E44] dark:bg-blue-900 text-white text-3xl font-bold font-sora shadow-inner mx-auto">
                    ${getInitials(s.nome)}
                </div>
                <h3 class="mt-4 text-xl font-bold text-[#0D2137] dark:text-white font-sora">${s.nome}</h3>
                <p class="text-sm font-semibold text-[#6B7A8D] dark:text-slate-400 mt-1">${s.postos?.nome || 'Admin'}</p>
                <div class="mt-4 inline-block px-3 py-1 text-xs font-bold rounded-full ${s.situacao === 'Ativo' ?'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'}">
                    ${s.situacao}
                </div>
            </div>

            <div class="md:w-2/3 p-8 bg-white dark:bg-[#0f1b29] relative overflow-y-auto custom-scrollbar">
                <button id="btn-close-view" class="hidden md:block absolute top-6 right-6 p-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full shadow-sm text-gray-500 dark:text-slate-400 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                
                <h4 class="text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-[#D8E0EA] dark:border-slate-700 pb-2 flex items-center"><i data-lucide="shield" class="w-4 h-4 mr-2 text-[#C8922A] inline"></i> Dados Administrativos</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div class="bg-[#F8FAFC] dark:bg-slate-800/40 p-3 rounded-lg flex flex-col border border-gray-100 dark:border-slate-700"><span class="text-[10px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase">Documento CPF</span><span class="text-sm font-semibold text-[#0D2137] dark:text-slate-200 mix-blend-multiply dark:mix-blend-normal">${s.cpf}</span></div>
                    <div class="bg-[#F8FAFC] dark:bg-slate-800/40 p-3 rounded-lg flex flex-col border border-gray-100 dark:border-slate-700"><span class="text-[10px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase">Matrícula Nominal</span><span class="text-sm font-semibold text-[#0D2137] dark:text-slate-200 font-mono">${s.matricula || 'N/A'}</span></div>
                    <div class="bg-[#F8FAFC] dark:bg-slate-800/40 p-3 rounded-lg flex flex-col border border-gray-100 dark:border-slate-700"><span class="text-[10px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase">Ingresso Base</span><span class="text-sm font-semibold text-[#0D2137] dark:text-slate-200">${s.data_ingresso ?s.data_ingresso.split('-').reverse().join('/') : 'Não informado'}</span></div>
                    <div class="bg-[#F8FAFC] dark:bg-slate-800/40 p-3 rounded-lg flex flex-col border border-gray-100 dark:border-slate-700"><span class="text-[10px] font-bold text-[#6B7A8D] dark:text-slate-400 uppercase">Lotação Atual</span><span class="text-sm font-semibold text-[#0D2137] dark:text-slate-200">${s.unidades?.nome || 'Não Registrada'}</span></div>
                    ${(() => {
                        if (!s.data_ingresso || !s.data_nascimento) return '';
                        const dAtual = new Date();
                        const anosSvc = Math.floor((dAtual - new Date(s.data_ingresso)) / 31557600000);
                        const idade = Math.floor((dAtual - new Date(s.data_nascimento)) / 31557600000);
                        const anosFaltantes = Math.min(Math.max(0, 30 - anosSvc), Math.max(0, 55 - idade));
                        const prevAposentadoria = (anosSvc >= 30 || idade >= 55) ?'Elegível' : (dAtual.getFullYear() + anosFaltantes);
                        return `
                        <div class="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4 mt-2">
                           <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex flex-col border border-blue-100 dark:border-blue-800/50"><span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest"><i data-lucide="clock" class="w-3 h-3 inline"></i> Tempo Ativo (PRF)</span><span class="text-sm font-black font-sora text-[#0D2137] dark:text-white mt-0.5">${anosSvc} Ano(s)</span></div>
                           <div class="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg flex flex-col border border-emerald-100 dark:border-emerald-800/50"><span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"><i data-lucide="calendar-check" class="w-3 h-3 inline"></i> Aposentadoria (Est.)</span><span class="text-sm font-black font-sora text-[#0D2137] dark:text-white mt-0.5">${prevAposentadoria}</span></div>
                        </div>`;
                    })()}
                </div>

                <h4 class="text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-[#D8E0EA] dark:border-slate-700 pb-2 flex items-center mt-6"><i data-lucide="graduation-cap" class="w-4 h-4 mr-2 text-[#C8922A] inline"></i> Acadêmico e Valências</h4>
                <div class="grid grid-cols-1 gap-6 mb-8">
                    <div>
                        <span class="text-xs font-bold text-[#0D2137] dark:text-slate-300 block mb-3">Histórico Oficial Corporativo</span>
                        <div class="mb-5 flex flex-col">
                            ${historicoOficial}
                        </div>
                    </div>
                    
                    <div>
                        <span class="text-xs font-bold text-[#0D2137] dark:text-slate-300 block mb-3">Competências e Especializações Manuais</span>
                        <div class="flex flex-wrap items-center w-full">
                           ${historicoCompetencias || '<span class="text-xs text-gray-400 dark:text-slate-500 font-bold mb-2">Sem badges extracurriculares registradas.</span>'}
                        </div>
                        ${btnAddCompetencia}
                    </div>
                </div>

                <div class="p-6">
                    <h5 class="flex items-center text-xs font-bold text-[#6B7A8D] dark:text-slate-400 uppercase tracking-widest border-b border-[#D8E0EA] dark:border-slate-700 pb-2 mb-4"><i data-lucide="message-square" class="w-4 h-4 mr-2"></i> Relatórios de Avaliação (Módulo 360°)</h5>
                    <div class="space-y-4">
                        ${(state.db.feedbacks || []).filter(f => String(f.servidor_id) === String(s.id)).length > 0 
                            ?(state.db.feedbacks || []).filter(f => String(f.servidor_id) === String(s.id)).map(f => `
                                <div class="bg-gray-50 dark:bg-slate-800/40 border-l-4 ${f.tipo.includes('Elogio') || f.tipo.includes('Missão de Destaque') ?'border-green-400 dark:border-green-500' : 'border-orange-400 dark:border-amber-500'} p-4 rounded-r-lg text-sm transition-colors text-[#0D2137] dark:text-slate-300">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="font-bold text-[10px] uppercase ${f.tipo.includes('Elogio') || f.tipo.includes('Missão de Destaque') ?'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-amber-400'} tracking-wide">${f.tipo}</span>
                                        <span class="text-[9px] font-mono text-gray-400 dark:text-slate-500">REG. ${new Date(f.data_registro).toLocaleDateString()}</span>
                                    </div>
                                    <p class="italic text-gray-700 dark:text-slate-200 font-medium">"${f.descricao}"</p>
                                    <span class="block mt-2 text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">- Emitido por ${f.avaliador?.nome || 'Gestão'}</span>
                                </div>
                            `).join('') : '<div class="text-xs text-center text-gray-400 dark:text-slate-500 font-bold font-sora py-4 border border-dashed border-[#D8E0EA] dark:border-slate-700 rounded-lg">Ficha Funcional Limpa: Sem relatórios emitidos.</div>'}
                    </div>
                </div>

                <div class="pt-6 border-t border-[#D8E0EA] dark:border-slate-700 flex gap-3 justify-end items-center">
                     ${isOwnerOrAdmin ?`<button class="text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors flex items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg" onclick="window.abrirVisualizacao(null); window.abrirEdicao('${s.id}')"><i data-lucide="edit-3" class="w-4 h-4 mr-2 inline"></i> Editar Ficha Completa</button>` : ''}
                </div>

            </div>
        </div>
      </div>
    `;
}

/**
 * Modal de configuracao dos codigos de acesso.
 */
export function renderConfigHTML() {
    return `
      <div class="fixed inset-0 bg-[#0D2137]/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4 overflow-y-auto">
        <div class="bg-white dark:bg-[#0f1b29] rounded-xl shadow-2xl w-full max-w-lg border border-[#D8E0EA] dark:border-slate-700 p-8 relative border-t-8 border-t-[#C8922A]">
            <button id="btn-close-config" class="absolute top-4 right-4 p-2 text-[#6B7A8D] dark:text-slate-400 hover:bg-[#F0F3F7] dark:hover:bg-slate-800 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
            <div class="flex flex-col text-center">
                <div class="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-900/40 text-[#C8922A] dark:text-amber-400 rounded-full flex justify-center items-center mb-4"><i data-lucide="key" class="w-6 h-6"></i></div>
                <h3 class="text-xl font-bold text-[#0D2137] dark:text-white font-sora">Chaves de Cadastro</h3>
                <p class="text-xs text-[#6B7A8D] dark:text-slate-400 mt-2 mb-6">Gere tokens randômicos descartáveis para permitir que os servidores se cadastrem no sistema.</p>
                
                <div class="flex items-end gap-3 mb-6 bg-[#F8FAFC] dark:bg-slate-800/60 p-4 rounded-xl border border-[#D8E0EA] dark:border-slate-700 text-left">
                    <div class="flex-1">
                        <label class="block text-xs font-bold text-[#0D2137] dark:text-slate-300 mb-1">Limite de Cadastros (Usos)</label>
                        <input id="input-limite-uso" type="number" min="1" value="1" class="w-full p-2 border border-[#D8E0EA] dark:border-slate-600 rounded-lg text-sm outline-none bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-[#C8922A]" />
                    </div>
                    <button id="btn-gerar-codigo" class="bg-[#1A2E44] dark:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#0D2137] dark:hover:bg-blue-700 transition-all whitespace-nowrap"><i data-lucide="refresh-cw" class="w-4 h-4 inline-block mr-1"></i> Gerar Novo Código</button>
                </div>

                <div class="text-left w-full">
                    <h4 class="text-xs font-bold text-[#0D2137] dark:text-slate-300 uppercase tracking-wider mb-2">Tokens Ativos Disponíveis</h4>
                    <div id="lista-codigos" class="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        <div class="text-center text-sm text-gray-400 dark:text-slate-500 py-4 font-semibold animate-pulse">Buscando tokens no servidor...</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
}

function bindConfigEvents() {
    const fechar = () => { state.ui.isConfigOpen = false; renderApp(); };
    document.getElementById('btn-close-config').onclick = fechar;
    
    const renderLista = async () => {
        const divLista = document.getElementById('lista-codigos');
        try {
            const codigos = await apiRequestJson(`${API_BASE_URL}/config/codigos`, {}, 'Falha ao buscar os codigos de acesso.');
            
            if (codigos.length === 0) {
                divLista.innerHTML = '<div class="text-center text-xs text-gray-500 py-3 bg-[#F8FAFC] rounded-lg border border-dashed border-[#D8E0EA]">Nenhum token ativo no momento. Gere um novo acima.</div>';
                return;
            }
            
            divLista.innerHTML = codigos.map(c => `
                <div class="flex justify-between items-center p-3 border border-[#D8E0EA] rounded-lg hover:border-[#1A2E44] transition-colors group">
                    <div>
                        <span class="font-mono font-bold text-[#C8922A] tracking-wider bg-amber-50 px-2 rounded border border-amber-100">${c.codigo}</span>
                        <div class="text-[10px] uppercase font-bold text-[#6B7A8D] mt-1">Usos Restantes: ${c.limite - c.usos}</div>
                    </div>
                    <button class="btn-excluir-codigo p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all" data-id="${c.id}" title="Revogar Imediatamente"><i data-lucide="trash" class="w-4 h-4"></i></button>
                </div>
            `).join('');
            
            lucide.createIcons();
            
            // Eventos de exclusao.
            document.querySelectorAll('.btn-excluir-codigo').forEach(btn => {
                btn.onclick = async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    await apiRequestJson(`${API_BASE_URL}/config/codigos/${id}`, { method: 'DELETE' }, 'Falha ao revogar o codigo.');
                    renderLista();
                };
            });
            
        } catch(err) { divLista.innerHTML = `<span class="text-red-500 text-xs">${err.message}</span>`; }
    };
    
    renderLista();

    // Gera um novo codigo de cadastro.
    document.getElementById('btn-gerar-codigo').onclick = async () => {
        try {
            const lim = document.getElementById('input-limite-uso').value;
            await apiRequestJson(`${API_BASE_URL}/config/codigos/gerar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ limite: lim })
            }, 'Nao foi possivel gerar novo codigo.');
            renderLista(); // Atualiza a lista na tela
        } catch(err) { alert(err.message); }
    }
}
