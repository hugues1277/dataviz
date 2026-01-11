import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { handleCORS, readBody, sendJson } from './utils/request';

// Use cases
import { getUserCountUseCase } from './core/useCases/getUserCountUseCase';
import { createFirstUserUseCase } from './core/useCases/createFirstUserUseCase';
import { betterAuthProxyUseCase } from './core/useCases/betterAuthProxyUseCase';
import { requestHandler } from './utils/requestHandler';
import logger from '../shared/utils/logger';

/**
 * Plugin Vite pour gérer toutes les routes API
 * 
 * Architecture:
 * - Gestion des requêtes/réponses HTTP dans ce fichier
 * - Logique métier dans les use cases (src/api/core/)
 * - Providers pour les services externes (database, auth)
 * 
 * Routes:
 * - /api/auth/* -> Better Auth (tous les endpoints)
 * - /api/admin/create-first-user -> Créer le premier utilisateur admin
 * - /api/admin/check-has-users -> Vérifier si des utilisateurs existent
 * - /health -> Health check
 */
export function authApiPlugin(): Plugin {
  return {
    name: 'api-plugin',
    configureServer(server) {
      // Better Auth - tous les endpoints Better Auth (sign-in, sign-up, get-session, etc.)
      server.middlewares.use('/api/auth', async (req: IncomingMessage, res: ServerResponse) => {
        handleCORS(res, req);
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          // Lire le body si présent
          const body = req.method !== 'GET' && req.method !== 'HEAD'
            ? await readBody(req)
            : undefined;

          // Appeler le use case Better Auth
          const result = await betterAuthProxyUseCase.execute({
            method: req.method || 'GET',
            url: req.url || '',
            headers: req.headers,
            body,
          });

          // Copier les headers de la réponse (notamment les cookies de session)
          result.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });

          // Définir le code de statut et envoyer le body
          res.statusCode = result.status;
          if (result.body) {
            res.end(result.body);
          } else {
            res.end();
          }
        } catch (error: unknown) {
          logger.error('authApiPlugin', error);

          if (!res.headersSent) {
            sendJson(res, 500, { error: error instanceof Error ? error.message : 'Erreur serveur' }, req);
          }
        }
      });

      // POST /api/admin/create-first-user - Créer le premier utilisateur admin
      server.middlewares.use('/api/admin/create-first-user', async (req: IncomingMessage, res: ServerResponse) => {
        requestHandler(req, res, {
          'POST':
            async () => {
              const body = await readBody(req);
              const { email, password, name } = JSON.parse(body);
              return await createFirstUserUseCase.execute({ email, password, name });
            },
        },
          { allowAnonymous: true }
        );
      });

      // GET /api/admin/check-users - Vérifier si des utilisateurs existent
      server.middlewares.use('/api/admin/check-has-users', async (req: IncomingMessage, res: ServerResponse) => {
        requestHandler(req, res, {
          'GET':
            async () => {
              const { hasUsers } = await getUserCountUseCase.execute();
              return hasUsers;
            },
        },
          { allowAnonymous: true }
        );
      });

      // GET /health - Health check
      server.middlewares.use('/health', (req: IncomingMessage, res: ServerResponse) => {
        sendJson(res, 200, { status: 'ok' }, req);
      });
    },
  };
}
