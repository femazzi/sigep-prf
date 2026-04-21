<div align="center">
  <img src="./svg/shield-check.svg" width="100" alt="Logo do Projeto" />
  <h1>SIGEP Base - Sistema de Gestão Integrada de Pessoas</h1>
  <p><strong>Plataforma Web (SPA) para gerenciamento institucional de pessoas construída em Node.js e Vanilla JavaScript modular</strong></p>
</div>

---

## 💻 Sobre o Projeto

O **SIGEP Base** e uma aplicacao web desenvolvida para resolver o problema de fragmentacao de dados em ambientes corporativos e institucionais. O sistema atua como um hub unificado de gestao de pessoas, cobrindo desde o controle da lotacao e manutencao da ficha funcional, ate o mapeamento de competencias, banco de talentos, gestao de capacitacoes, tramitacao de requerimentos e registro de feedbacks funcionais.

O projeto foi construido com foco em **performance, organizacao arquitetural e independencia de frameworks frontend pesados**, demonstrando que e possivel entregar uma Single Page Application (SPA) responsiva, modular e de facil manutencao usando JavaScript puro no cliente e uma API REST dedicada no backend.

> 🎓 **Origem Acadêmica (Hub de Inovação):** Este projeto foi idealizado e desenvolvido durante o 1º Semestre do curso Superior de Tecnologia em **Análise e Desenvolvimento de Sistemas (TADS)** da Faculdade **SENAI Antônio Adolpho Lobbe** (São Carlos/SP). O sistema nasceu como proposta de Engenharia de Software para a disciplina de *Projetos Integradores*, buscando uma solução viável para um desafio real apresentado pela **Superintendência da Polícia Rodoviária Federal do Piauí (PRF-PI)**, intermediado pela plataforma SAGA SENAI ([gpinovacao.senai.br](https://gpinovacao.senai.br/)).

---

## ⚙️ Arquitetura e Tecnologias

O projeto adota uma arquitetura que separa o cliente, o backend e a persistencia em banco de dados. A interface conversa apenas com a API REST, enquanto o Node.js concentra a integracao com o Supabase e protege as credenciais sensiveis via variaveis de ambiente.

### Frontend (Client-Side)
- **Vanilla JavaScript (ES6+)**: SPA modular com bootstrap em `js/app.js`, estado global em memoria, renderizacao por modulo e manipulacao reativa do DOM.
- **Arquitetura modular por dominio**:
  - `js/core/`: constantes, helpers, contexto compartilhado e padronizacao das chamadas HTTP
  - `js/pages/`: modulos de tela como dashboard, efetivo, unidades, capacitacoes, talentos, requerimentos e feedbacks
- **Tailwind CSS**: Estilizacao utilitaria e suporte a temas claro/escuro.
- **Lucide Icons**: Biblioteca de icones vetoriais.
- **Chart.js**: Geracao de graficos para o painel gerencial.

### Backend (Server-Side)
- **Node.js + Express**: Camada de API e entrega dos arquivos estaticos da aplicacao.
- **API REST**: Endpoints como `/api/servidores`, `/api/capacitacoes`, `/api/requerimentos` e `/api/feedbacks` concentram as operacoes de negocio.
- **Supabase (PostgreSQL)**: Banco de dados relacional em nuvem. O acesso privilegiado fica restrito ao backend por meio da `SUPABASE_SERVICE_ROLE_KEY`.

### Estrutura resumida

```text
.
|-- css/
|   `-- styles.css
|-- js/
|   |-- app.js
|   |-- core/
|   |   |-- api.js
|   |   |-- constants.js
|   |   |-- context.js
|   |   |-- module-helpers.js
|   |   `-- utils.js
|   `-- pages/
|       |-- capacitacoes.js
|       |-- dashboard.js
|       |-- feedbacks.js
|       |-- requerimentos.js
|       |-- servidores.js
|       |-- talentos.js
|       `-- unidades.js
|-- svg/
|   |-- shield-check.svg
|   `-- shield.svg
|-- index.html
|-- package.json
`-- server.js
```

---

## 🚀 Principais Funcionalidades (Features)

- **Controle de Acesso**: Autenticacao por CPF e senha, com primeiro acesso controlado por token corporativo gerado pela administracao.
- **Painel de Bordo (Dashboard)**: Consolidacao de metricas de efetivo, requerimentos, cursos e feedbacks com graficos e indicadores de apoio gerencial.
- **Gestão de Efetivo**: CRUD de servidores, busca em tempo real, paginacao e ficha funcional completa com dados administrativos e historico consolidado.
- **Banco de Talentos**: Filtro cruzado por competencia, nivel tecnico e tempo de atuacao para localizar perfis aderentes a missões, capacitacoes e lideranca.
- **Módulo de Unidades**: Visualizacao do efetivo ativo por unidade operacional, com apoio ao dimensionamento e distribuicao de pessoal.
- **Centro de Capacitações**: Criacao de cursos, gerenciamento de turmas, inscricoes, aprovacao ou reprovacao de participantes e reflexo no historico do servidor.
- **Módulo de Requerimentos (e-Docs)**: Protocolo e acompanhamento de solicitacoes internas, com decisao de deferimento ou indeferimento por perfil autorizado.
- **Módulo 360°**: Registro de elogios, melhorias, advertencias e destaques operacionais vinculados a ficha funcional.
- **Cálculo de Tempo Ativo e Aposentadoria Estimada**: Cruzamento de datas para apoiar leitura rapida da vida funcional do servidor.
- **Execução simplificada**: A aplicacao e servida por um unico processo Node, com ajuste automatico da base da API em ambiente local.

---

## 🛠️ Como Executar na Própria Máquina

Siga os passos abaixo para executar a aplicacao localmente:

### 1. Pré-Requisitos
- [Node.js](https://nodejs.org/) instalado
- Credenciais de um projeto Supabase configurado para o sistema

### 2. Configuração de Variáveis (Dotenv)
Crie um arquivo `.env` na raiz do projeto:

```env
SUPABASE_URL=Sua_URL_do_Supabase
SUPABASE_SERVICE_ROLE_KEY=Sua_Chave_Privada_De_Servidor
PORT=3000
```

### 3. Instalação e Execução

```bash
# Instala as dependencias do backend
npm install

# Inicia o servidor da aplicacao
npm start
```

### 4. Acessando a Interface

Abra o navegador e acesse:

```http
http://localhost:3000
```

> **Ambiente Local:** quando a interface e aberta fora da porta `3000`, o frontend ajusta automaticamente a base da API para `localhost:3000/api` durante o desenvolvimento.

### Scripts disponíveis

```bash
npm start
npm run dev
npm run check:server
```

---

## 📌 Observações

- A pasta `docs/` e usada apenas para entregaveis e materiais locais; ela nao compoe a versao publicada no GitHub.
- O projeto atual privilegia clareza arquitetural, baixo custo de manutencao e separacao de responsabilidades entre interface, API e persistencia.
- Para ambiente institucional de producao, ainda e recomendavel evoluir pontos como hashing de senha, HTTPS obrigatorio, trilhas de auditoria e politicas formais de LGPD.

<br>
<div align="center">
  <sub>Construído com Engenharia de Software focada em performance, modularidade e manutenção limpa.</sub>
</div>
