const appContext = {};

export function setAppContext(partialContext) {
    Object.assign(appContext, partialContext);
}

export function getAppContext() {
    return appContext;
}
