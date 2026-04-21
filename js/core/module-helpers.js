import { getAppContext } from './context.js';

export const state = new Proxy({}, {
    get(_, property) {
        return getAppContext().state[property];
    },
    set(_, property, value) {
        getAppContext().state[property] = value;
        return true;
    },
});

export function renderApp(...args) {
    return getAppContext().renderApp(...args);
}

export function carregarDados(...args) {
    return getAppContext().carregarDados(...args);
}

export function carregarServidores(...args) {
    return getAppContext().carregarServidores(...args);
}
