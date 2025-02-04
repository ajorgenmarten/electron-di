export function Logger(message: string, title?: string) {
    console.log(`[${title || 'ELECTRON DI'}]: \t ${message}`)
}

export class ElectronDIError extends Error {
    constructor(message: string) {
        super(`[ELECTRON DI]: \t ${message}`)
    }
}