import { API_BASE_URL } from './constants.js';

export async function readApiJson(response, fallbackMessage = 'Erro de comunicacao com a API.') {
    const contentType = response.headers.get('content-type') || '';
    const rawBody = await response.text();

    if (!contentType.includes('application/json')) {
        if (rawBody.trim().startsWith('<')) {
            throw new Error(`A API respondeu HTML em vez de JSON. Verifique se o backend esta rodando em ${API_BASE_URL}.`);
        }

        throw new Error(fallbackMessage);
    }

    let data = null;
    try {
        data = rawBody ?JSON.parse(rawBody) : null;
    } catch {
        throw new Error('A resposta da API veio em formato invalido.');
    }

    if (!response.ok) {
        throw new Error(data?.error || fallbackMessage);
    }

    return data;
}

export async function apiRequestJson(url, options = {}, fallbackMessage = 'Erro de comunicacao com a API.') {
    const response = await fetch(url, options);
    return readApiJson(response, fallbackMessage);
}
