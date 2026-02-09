import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { handleCORS, readBody, sendJson } from './utils/request';

// Use cases
import { getUserCountUseCase } from './core/useCases/getUserCountUseCase';
import { createFirstUserUseCase } from './core/useCases/createFirstUserUseCase';
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
 * - /api/admin/create-first-user -> Créer le premier utilisateur admin
 * - /api/admin/check-has-users -> Vérifier si des utilisateurs existent
 * - /health -> Health check
 * 
 * Note: Better Auth est maintenant géré directement via Next.js App Router dans app/api/auth/[...all]/route.ts
 */
export function authApiPlugin(): Plugin {
  return {
    name: 'api-plugin',
    configureServer(server) {

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
              return { hasUsers };
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
