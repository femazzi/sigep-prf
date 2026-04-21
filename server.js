/**
 * Backend principal da aplicacao.
 * Centraliza as rotas da API e a comunicacao com o Supabase.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Cliente do Supabase usado pelo backend.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'JSON invalido na requisicao.' });
    }

    return next(err);
});

const path = require('path');

// Servir os arquivos estaticos do frontend.
app.use(express.static(path.join(__dirname, '')));

// Modulo de cursos e capacitacoes.




// Retorna os dados usados pela tela de capacitacoes.
app.get('/api/capacitacoes', async (req, res) => {
    try {
        const [cursos, inscricoes, competencias, masterCompetencias] = await Promise.all([
            supabase.from('capacitacoes').select('*'),
            supabase.from('capacitacao_servidores').select('*, servidores(nome, cpf)'),
            supabase.from('servidor_competencias').select('*, competencias(nome)'),
            supabase.from('competencias').select('id, nome')
        ]);
        res.json({
            cursos: cursos.data || [],
            inscricoes: inscricoes.data || [],
            competencias: competencias.data || [],
            masterCompetencias: masterCompetencias.data || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cria um curso.
app.post('/api/capacitacoes', async (req, res) => {
    try {
        const { data, error } = await supabase.from('capacitacoes').insert([req.body]).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Atualiza um curso.
app.put('/api/capacitacoes/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('capacitacoes').update(req.body).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove um curso e seus vinculos.
app.delete('/api/capacitacoes/:id', async (req, res) => {
    try {
        // Remove as inscricoes antes de excluir o curso.
        await supabase.from('capacitacao_servidores').delete().eq('capacitacao_id', req.params.id);
        
        // Remove o curso.
        const { data, error } = await supabase.from('capacitacoes').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Curso deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cria uma inscricao em curso.
app.post('/api/capacitacoes/:id/inscrever', async (req, res) => {
    try {
        const payload = {
            capacitacao_id: req.params.id,
            servidor_id: req.body.servidor_id,
            status: 'Inscrito',
            data_inscricao: new Date().toISOString().split('T')[0]
        };
        const { data, error } = await supabase.from('capacitacao_servidores').insert([payload]).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Atualiza o status de uma inscricao.
app.put('/api/capacitacoes/inscricao/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('capacitacao_servidores').update({ status: req.body.status }).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cria uma formacao adicional.
app.post('/api/formacoes', async (req, res) => {
    try {
        const { data, error } = await supabase.from('formacoes').insert([req.body]).select();
        if (error) throw error; res.json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Remove uma formacao adicional.
app.delete('/api/formacoes/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('formacoes').delete().eq('id', req.params.id);
        if (error) throw error; res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Adiciona uma competencia.
app.post('/api/competencias', async (req, res) => {
    try {
        const { data, error } = await supabase.from('servidor_competencias').insert([req.body]).select();
        if (error) throw error; res.json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Remove uma competencia.
app.delete('/api/competencias/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('servidor_competencias').delete().eq('id', req.params.id);
        if (error) throw error; res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});





/**
 * Autentica um usuario e devolve os dados sem a senha.
 */

app.post('/api/login', async (req, res) => {
    let { cpf, senha } = req.body;
    
    // Remove a mascara do CPF antes da consulta.
    if (cpf) cpf = cpf.replace(/\D/g, '');
    
    try {
        const { data, error } = await supabase
            .from('servidores')
            .select('*, postos(*), unidades(*)')
            .eq('cpf', cpf)
            .eq('senha', senha)
            .single();

        if (error || !data) return res.status(401).json({ error: 'Credenciais Inválidas' });
        
        delete data.senha;
        res.json({ token: 'sessao-token', user: data });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Registra o primeiro acesso usando um codigo de convite.
 */
app.post('/api/register', async (req, res) => {
    try {
        let { cpf, senha, nome, codigo_acesso, data_nascimento, data_ingresso } = req.body;
        
        // Valida o codigo de acesso antes de criar o usuario.
        const { data: convite, error: conviteErr } = await supabase
            .from('convites')
            .select('*')
            .eq('codigo', codigo_acesso)
            .eq('usado', false)
            .single();
            
        if (conviteErr || !convite) {
            return res.status(401).json({ error: 'Código de Validação Incorreto ou já Utilizado.' });
        }
        
        if (cpf) cpf = cpf.replace(/\D/g, '');
        if (!cpf || !senha || !nome || !data_nascimento || !data_ingresso) {
             return res.status(400).json({ error: 'Preencha todos os campos vitais, incluindo datas.' });
        }

        const payload = {
            nome,
            cpf,
            senha,
            situacao: 'Ativo',
            data_nascimento,
            matricula: String(Date.now()).slice(-6), // Gera uma matricula inicial.
            posto_id: 6, // Perfil padrao do primeiro acesso.
            unidade_id: 1, // Unidade padrao ate ajuste manual.
            data_ingresso
        };

        const { data, error } = await supabase.from('servidores').insert([payload]).select().single();
        if (error) throw error;
        
        // Marca o codigo como usado.
        await supabase.from('convites').update({ usado: true }).eq('codigo', codigo_acesso);
        
        delete data.senha;
        res.status(201).json({ success: true, user: data });

    } catch (err) {
        // Trata CPF ja cadastrado.
        if (err.code === '23505') {
            return res.status(409).json({ error: 'O CPF informado já possui cadastro no sistema.' });
        }
        res.status(500).json({ error: err.message });
    }
});

/**
 * Agrega os dados principais do dashboard.
 */
app.get('/api/dashboard', async (req, res) => {
    try {
        const [servidores, unidades, postos, reqs] = await Promise.all([
            supabase.from('servidores').select('id, situacao'),
            supabase.from('unidades').select('*'),
            supabase.from('postos').select('id, nome'),
            supabase.from('requerimentos').select('id, status')
        ]);
        
        const stats = {
            totalServidores: (servidores.data || []).length,
            ativos: (servidores.data || []).filter(s => s.situacao === 'Ativo').length,
            requerimentosPendentes: (reqs.data || []).filter(r => r.status === 'Em Análise').length
        };

        res.json({ stats, unidades: unidades.data, postos: postos.data });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Lista os servidores com posto e unidade.
 */
app.get('/api/servidores', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('servidores')
            .select('*, postos(*), unidades(*)')
            .order('nome');
        
        if (error) throw error;
        
        // Nao envia senhas para o frontend.
        const safeData = data.map(user => { delete user.senha; return user; });
        res.json(safeData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Cadastra um servidor.
 */
app.post('/api/servidores', async (req, res) => {
    try {
        const payload = req.body;
        // Garante CPF sem mascara e senha inicial padrao.
        if (payload.cpf) payload.cpf = payload.cpf.replace(/\D/g, '');
        if (!payload.senha) payload.senha = 'prf123';
        
        const { data, error } = await supabase.from('servidores').insert([payload]);
        if (error) throw error;
        
        res.status(201).json({ success: true, message: 'Servidor criado com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Remove um servidor.
 */
app.delete('/api/servidores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('servidores').delete().eq('id', id);
        if (error) throw error;
        
        res.json({ success: true, message: 'Registro removido.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Atualiza um servidor.
 */
app.put('/api/servidores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        
        if (payload.cpf) payload.cpf = payload.cpf.replace(/\D/g, '');
        
        const { data, error } = await supabase.from('servidores').update(payload).eq('id', id).select();
        if (error) throw error;
        
        res.json({ success: true, message: 'Servidor atualizado.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Rotas de configuracao dos codigos de cadastro.
 */
app.get('/api/config/codigos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('convites').select('*').eq('usado', false).order('data_criacao', { ascending: false });
        if (error) throw error;
        
        // Ajusta o retorno para o formato usado pela interface.
        const formatados = data.map(c => ({
            id: c.codigo,
            codigo: c.codigo,
            limite: 1, 
            usos: 0,
            ativo: !c.usado,
            criadoEm: c.data_criacao
        }));
        res.json(formatados);
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/config/codigos/gerar', async (req, res) => {
    try {
        // Gera um codigo curto para cadastro.
        const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
        const novoCodigoStr = `PRF-${randomHex}`;
        
        const payload = {
            codigo: novoCodigoStr,
            usado: false,
            gerado_por: 'Admin'
        };
        
        const { data, error } = await supabase.from('convites').insert([payload]).select().single();
        if (error) throw error;
        
        const novoCodigoFormatado = {
            id: data.codigo,
            codigo: data.codigo,
            limite: 1,
            usos: 0,
            ativo: true,
            criadoEm: data.data_criacao
        };
        res.json({ success: true, codigo: novoCodigoFormatado });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// Inativa um codigo de cadastro.
app.delete('/api/config/codigos/:id', async (req, res) => {
    try {
        const { id } = req.params; // O id da rota e o proprio codigo salvo no banco.
        const { error } = await supabase.from('convites').update({ usado: true }).eq('codigo', id);
        if (error) throw error;
        
        res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// Modulo de requerimentos.


app.get('/api/requerimentos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('requerimentos')
            .select('*, servidores:servidor_id(nome, cpf, postos(nome))')
            .order('data_solicitacao', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/requerimentos', async (req, res) => {
    try {
        const payload = req.body;
        const { data, error } = await supabase
            .from('requerimentos')
            .insert([payload])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch(err) { console.error("API POST REQ ERR:", err); res.status(500).json({ error: err.message }); }
});
app.put('/api/requerimentos/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { data, error } = await supabase
            .from('requerimentos')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch(err) { console.error("API REQ PUT ERR:", err); res.status(500).json({ error: err.message }); }
});
app.get('/api/feedbacks', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('feedbacks')
            .select('*, avaliador:autor_id(nome, cpf, postos(nome)), avaliado:servidor_id(nome, cpf)')
            .order('data_registro', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/feedbacks', async (req, res) => {
    try {
        const { servidor_id, autor_id, tipo, descricao, data_registro } = req.body;

        if (!servidor_id || !autor_id || !tipo || !descricao) {
            return res.status(400).json({ error: 'Preencha os campos obrigatorios do feedback.' });
        }

        const payload = { servidor_id, autor_id, tipo, descricao, data_registro };
        const { data, error } = await supabase
            .from('feedbacks')
            .insert([payload])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch(err) { console.error("API POST FEEDBACK ERR:", err); res.status(500).json({ error: err.message }); }
});
app.delete('/api/feedbacks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('feedbacks').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: 'Apagado com sucesso' });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Rota da API nao encontrada.' });
});

// Inicializacao do servidor.


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[SIGEP] Servidor Backend na porta ${PORT}`);
});
