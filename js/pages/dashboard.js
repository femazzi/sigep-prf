import { state } from '../core/module-helpers.js';

export function renderDashboardPage(pc) {
        const servidores = state.db.servidores || [];
        const ativosCount = servidores.filter(s => s.situacao === 'Ativo').length;
        const porcentagemAtivos = servidores.length > 0 ?Math.round((ativosCount / servidores.length) * 100) : 0;
        const reqs = state.db.requerimentos || [];
        const pendentesCount = reqs.filter(r => r.status === 'Pendente').length;
        
        pc.innerHTML = `
          <div class="p-6 space-y-8 animate-fade-in">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold text-[#0D2137] dark:text-white font-sora tracking-tight">Centro de Comando</h3>
                    <p class="text-sm text-[#6B7A8D] dark:text-slate-400 mt-1">Visão estratégica e dados em tempo real da unidade corporativa.</p>
                </div>
                <div class="hidden sm:block">
                    <span class="inline-flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg text-xs tracking-widest uppercase">
                        <span class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Sistema Online
                    </span>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               
               <!-- Card 1: Efetivo (Porcentagem Animada) -->
               <div class="relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-[#0f1b29] p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#D8E0EA] dark:border-slate-700 overflow-hidden group hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:-translate-y-1">
                  <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <div class="absolute top-0 right-0 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  <div class="flex items-start justify-between">
                    <div>
                        <p class="text-[11px] text-[#6B7A8D] dark:text-slate-400 font-extrabold uppercase tracking-widest">Efetivo Operante</p>
                        <div class="flex items-end mt-2 space-x-2">
                           <h3 class="text-4xl font-black font-sora text-[#0D2137] dark:text-white leading-none">${ativosCount}</h3>
                           <span class="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">/ ${servidores.length}</span>
                        </div>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                        <i data-lucide="shield-check" class="w-6 h-6 text-blue-600 dark:text-blue-400"></i>
                    </div>
                  </div>
                  <div class="mt-5 relative w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                     <div class="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-1000" style="width: ${porcentagemAtivos}%"></div>
                  </div>
                  <p class="text-[10px] text-right text-gray-400 font-bold mt-1">${porcentagemAtivos}% mobilizado</p>
               </div>
               
               <!-- Card 2: Cursos (Glow e Degradê) -->
               <div class="relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-[#0f1b29] p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#D8E0EA] dark:border-slate-700 overflow-hidden group hover:border-[#1A2E44] dark:hover:border-blue-400 transition-all hover:-translate-y-1">
                  <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C8922A] to-yellow-500"></div>
                  <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-gray-100 dark:bg-slate-700/50 rounded-full blur-2xl group-hover:bg-gray-200 dark:group-hover:bg-slate-600 transition-colors"></div>
                  <div class="flex items-start justify-between">
                    <div class="z-10">
                        <p class="text-[11px] text-[#6B7A8D] dark:text-slate-400 font-extrabold uppercase tracking-widest">Academias Ativas</p>
                        <h3 class="text-4xl font-black font-sora text-[#0D2137] dark:text-white mt-2 leading-none">${(state.db.cursos || []).filter(c => c.status !== 'Concluído').length}</h3>
                        <p class="text-[10px] text-gray-400 font-bold mt-5"><span class="text-green-500">+ Estruturas</span> em andamento</p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 backdrop-blur flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform">
                        <i data-lucide="graduation-cap" class="w-6 h-6 text-[#1A2E44] dark:text-blue-400"></i>
                    </div>
                  </div>
               </div>
               
               <!-- Card 3: Despachos (Alerta Pulsante se > 0) -->
               <div class="relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-[#0f1b29] p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#D8E0EA] dark:border-slate-700 overflow-hidden group hover:border-amber-400 dark:hover:border-amber-500 transition-all hover:-translate-y-1">
                  <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                  <div class="absolute -left-6 -top-6 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/10 transition-colors -z-10"></div>
                  <div class="flex items-start justify-between">
                    <div>
                        <p class="text-[11px] text-[#6B7A8D] dark:text-slate-400 font-extrabold uppercase tracking-widest flex items-center">
                           Petições Eletrônicas 
                           ${pendentesCount > 0 ?'<span class="relative flex h-2 w-2 ml-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span></span>' : ''}
                        </p>
                        <h3 class="text-4xl font-black font-sora text-[#0D2137] dark:text-white mt-2 leading-none">${pendentesCount}</h3>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <i data-lucide="file-signature" class="w-6 h-6 text-amber-500 dark:text-amber-400"></i>
                    </div>
                  </div>
                  <div class="mt-6 flex items-center">
                     <span class="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase flex items-center"><i data-lucide="clock" class="w-3 h-3 mr-1"></i> Aguardando Avaliação (Chefia)</span>
                  </div>
               </div>
               
               <!-- Card 4: Feedbacks/Clima -->
               <div class="relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-[#0f1b29] p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#D8E0EA] dark:border-slate-700 overflow-hidden group hover:border-green-400 dark:hover:border-green-500 transition-all hover:-translate-y-1">
                  <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-500"></div>
                  <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/5 dark:bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/20 dark:group-hover:bg-green-500/10 transition-colors -z-10"></div>
                  <div class="flex items-start justify-between">
                    <div>
                        <p class="text-[11px] text-[#6B7A8D] dark:text-slate-400 font-extrabold uppercase tracking-widest">Registros de Conduta</p>
                        <h3 class="text-4xl font-black font-sora text-[#0D2137] dark:text-white mt-2 leading-none">${(state.db.feedbacks || []).length}</h3>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                        <i data-lucide="message-square" class="w-6 h-6 text-green-500 dark:text-green-400"></i>
                    </div>
                  </div>
                  <div class="mt-6 flex flex-wrap gap-2">
                     <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">Base 360°</span>
                     <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-[#F8FAFC] dark:bg-slate-800 border border-[#D8E0EA] dark:border-slate-600 text-[#0D2137] dark:text-slate-200">Acompanhamento</span>
                  </div>
               </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <!-- Interface Gráfica: Chart.js Lotações -->
                <div class="md:col-span-2 bg-gradient-to-br from-white to-[#F8FAFC] dark:from-slate-800 dark:to-[#0f1b29] p-7 rounded-2xl shadow-sm border border-[#D8E0EA] dark:border-slate-700 transition-colors">
                   <h4 class="text-sm font-extrabold text-[#0D2137] dark:text-white uppercase tracking-widest flex items-center border-b border-[#D8E0EA] dark:border-slate-700 pb-4 mb-6"><i data-lucide="map" class="w-4 h-4 mr-3 text-[#C8922A]"></i> Mapa de Lotação Estratégica</h4>
                   <div style="position: relative; height: 300px; width: 100%;">
                       <canvas id="chartLotacao"></canvas>
                   </div>
                </div>
                
                <!-- Interface Gráfica: Chart.js Requerimentos -->
                <div class="bg-gradient-to-br from-white to-[#F8FAFC] dark:from-slate-800 dark:to-[#0f1b29] p-7 rounded-2xl shadow-sm border border-[#D8E0EA] dark:border-slate-700 transition-colors flex flex-col">
                   <h4 class="text-sm font-extrabold text-[#0D2137] dark:text-white uppercase tracking-widest flex items-center border-b border-[#D8E0EA] dark:border-slate-700 pb-4 mb-6"><i data-lucide="pie-chart" class="w-4 h-4 mr-3 text-blue-500"></i> Mapeamento de Deferimentos</h4>
                   <div style="position: relative; flex-1; width: 100%; display: flex; justify-content: center; align-items: center;">
                       <canvas id="chartReqs"></canvas>
                   </div>
                </div>
            </div>
          </div>
        `;
        
        // Processamento de Dados Reais p/ Gráfico (Dicionário Agregador por Lotação)
        const siglaMap = {};
        (state.db.servidores || []).forEach(s => {
            if (s.situacao === 'Ativo' && s.unidades) {
                const sigla = s.unidades.sigla || 'N/A';
                siglaMap[sigla] = (siglaMap[sigla] || 0) + 1;
            }
        });
        const labelsGrafico = Object.keys(siglaMap);
        const dataGrafico = Object.values(siglaMap);
        
        // Processamento Mapeador para Requerimentos (Doughnut)
        const defCount = reqs.filter(r => r.status === 'Deferido').length;
        const indfCount = reqs.filter(r => r.status === 'Indeferido').length;

        // Tema dinamico para as pontes textuais do JS -> Canvas
        const textColor = state.ui.theme === 'dark' ?'#94A3B8' : '#6B7A8D';
        const gridColor = state.ui.theme === 'dark' ?'#334155' : '#E2E8F0';
        
        // Timeout para assegurar alocação em memória do nodo <canvas> inserido
        setTimeout(() => {
           // Chart 1: Lotações
           const ctxLota = document.getElementById('chartLotacao').getContext('2d');
           new Chart(ctxLota, {
              type: 'bar',
              data: {
                  labels: labelsGrafico.length > 0 ?labelsGrafico : ['Nenhum Dado'],
                  datasets: [{ 
                     label: 'Servidores Na Ativa', 
                     data: dataGrafico.length > 0 ?dataGrafico : [0], 
                     backgroundColor: '#C8922A',
                     borderRadius: 6
                  }]
              },
              options: { 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display:false } },
                  scales: {
                      x: { grid: { display: false }, ticks: { color: textColor, font: { weight: 'bold' } } },
                      y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }
                  }
              }
           });

           // Chart 2: Requerimentos
           const ctxReq = document.getElementById('chartReqs').getContext('2d');
           new Chart(ctxReq, {
              type: 'doughnut',
              data: {
                  labels: ['Pendente', 'Deferido', 'Negado'],
                  datasets: [{ 
                     data: [pendentesCount, defCount, indfCount], 
                     backgroundColor: ['#eab308', '#22c55e', '#ef4444'],
                     borderWidth: state.ui.theme === 'dark' ?2 : 0,
                     borderColor: '#1A2E44'
                  }]
              },
              options: { 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 20, usePointStyle: true, font: { weight: 'bold' } } } }
              }
           });

           lucide.createIcons();
        }, 120);
}
