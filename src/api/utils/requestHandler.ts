import { IncomingMessage, ServerResponse } from "http";
import { getAuthenticationData } from "./auth";
import { handleCORS, sendJson } from "./request";
import logger from '../../shared/utils/logger';

type Handler<T = any> = (req: any) => Promise<T>;

interface HandleRequestOptions {
    [key: string]: Handler;
}

interface HandleRequestConfig {
    allowAnonymous: boolean;
}

export async function requestHandler(
    req: IncomingMessage,
    res: ServerResponse,
    options: HandleRequestOptions,
    config: HandleRequestConfig = { allowAnonymous: false }
): Promise<void> {
    handleCORS(res, req);

    if (!config.allowAnonymous) {
        const isAuthenticated = await verifyAuthentication(res, req);
        if (!isAuthenticated) {
            return;
        }
    }

    // Prévol CORS
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    // Vérification de la méthode
    if (!Object.keys(options).includes(req.method || '')) {
        sendJson(res, 405, { error: 'Méthode non autorisée' }, req);
        return;
    }


    try {
        const handler = options[req.method as keyof HandleRequestOptions];
        if (!handler) {
            sendJson(res, 400, { error: 'Gestionnaire non trouvé' }, req);
            return;
        }

        const result = await handler(req);
        sendJson(res, 200, result, req);
        return;
    } catch (error: unknown) {
        logger.error('requestHandler', error);
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Erreur inconnue' }, req);
    }
}

export const getUrlParam = (req: IncomingMessage, res: ServerResponse, position: number): string => {
    const urlParam = req.url?.split('/')[position];
    if (!urlParam) {
        sendJson(res, 400, { error: 'URL paramètre requis' }, req);
        return '';
    }
    return urlParam;
}

export async function verifyAuthentication(res: ServerResponse, req: IncomingMessage): Promise<boolean> {
    try {
        await getAuthenticationData(req.headers);
        return true;
    } catch (error: unknown) {
        logger.error('verifyAuthentication', error);
        sendJson(res, 401, { error: 'Non autorisé' }, req);
        return false;
    }
}
