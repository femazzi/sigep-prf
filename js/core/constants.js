export const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const LOCAL_API_ORIGIN = `${window.location.protocol}//${window.location.hostname || 'localhost'}:3000`;
export const API_BASE_URL = IS_LOCAL && window.location.port !== '3000' ?`${LOCAL_API_ORIGIN}/api` : '/api';

export const NAV_ITEMS = [
    { id: 'dashboard', label: 'Painel Central', icon: 'trending-up' },
    { id: 'servidores', label: 'Efetivo', icon: 'users' },
    { id: 'unidades', label: 'Unidades Operacionais', icon: 'map' },
    { id: 'capacitacoes', label: 'Cursos (Academia)', icon: 'graduation-cap' },
    { id: 'talentos', label: 'Banco de Talentos', icon: 'target' },
    { id: 'requerimentos', label: 'Requerimentos (e-Docs)', icon: 'file-text' },
    { id: 'feedbacks', label: 'M\u00f3dulo 360\u00b0', icon: 'message-square' },
];

