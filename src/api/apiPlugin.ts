import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { readBody } from './utils/request';

// Use cases
import { queryProxyUseCase } from './core/useCases/queryProxyUseCase';
import DashboardRepository from './repositories/dashboardRepository';
import { getUrlParam, requestHandler } from './utils/requestHandler';
import { getAppDatasUseCase } from './core/useCases/getAppDatasUseCase';
import { importAppDatasUseCase } from './core/useCases/importAppDatasUseCase';
import clearAllDatasUseCase from './core/useCases/clearAllDatasUseCase';
import exportDataUseCase from './core/useCases/exportDataUseCase';
import { testConnectionUseCase } from './core/useCases/testConnectionUseCase';
import ChartRepository from './repositories/chartRepository';
import ConnectionRepository from './repositories/connectionRepository';

/**
 * Plugin Vite pour gérer toutes les routes API
 * 
 * Architecture:
 * - Gestion des requêtes/réponses HTTP dans ce fichier
 * - Logique métier dans les use cases (src/api/core/)
 * - Providers pour les services externes (database, auth)
 * 
 * Routes:
 * - /api/app-datas -> Récupérer les données de l'application
 * - /api/dashboards -> CRUD dashboards 
 * - /api/charts -> CRUD charts
 * - /api/connections -> CRUD connections
 * - /api/query-proxy -> Proxy pour requêtes SQL externes
 * - /api/settings/import -> Importer les données de l'application
 * - /api/settings/export -> Exporter les données de l'application
 * - /api/settings/clear -> Supprimer toutes les données de l'application
 */
export function apiPlugin(): Plugin {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/app-datas', async (req: IncomingMessage, res: ServerResponse) => {
        requestHandler(req, res,
          {
            'GET':
              async () => {
                return await getAppDatasUseCase.execute();
              },
          });
      });

      server.middlewares.use('/api/dashboards', async (req: IncomingMessage, res: ServerResponse) => {
        const dashboardRepository = new DashboardRepository();

        requestHandler(req, res,
          {
            'GET':
              async () => {
                return await dashboardRepository.getAll();
              },
            'POST':
              async () => {
                const body = await readBody(req);
                const dashboard = JSON.parse(body);
                return await dashboardRepository.create(dashboard);
              },
            'DELETE':
              async () => {
                const dashboardId = getUrlParam(req, res, 1);
                return await dashboardRepository.delete(dashboardId);
              },
          });
      });

      // Charts
      server.middlewares.use('/api/charts', async (req: IncomingMessage, res: ServerResponse) => {
        const chartRepository = new ChartRepository();

        requestHandler(req, res, {
          'GET':
            async () => {
              return await chartRepository.getAll();
            },
          'POST':
            async () => {
              const body = await readBody(req);
              const chart = JSON.parse(body);
              return await chartRepository.create(chart);
            },
          'DELETE':
            async () => {
              const chartId = getUrlParam(req, res, 1);
              return await chartRepository.delete(chartId);
            },
        });
      });

      // POST /api/connections/test - Tester une connexion
      server.middlewares.use('/api/connections/test', async (req: IncomingMessage, res: ServerResponse) => {
        requestHandler(req, res, {
          'POST':
            async () => {
              const body = await readBody(req);
              const connection = JSON.parse(body);
              return await testConnectionUseCase.execute(connection);
            },
        });
      });

      // Connections
      server.middlewares.use('/api/connections', async (req: IncomingMessage, res: ServerResponse) => {
        const connectionRepository = new ConnectionRepository();

        requestHandler(req, res, {
          'GET':
            async () => {
              return await connectionRepository.getAll();
            },
          'POST':
            async () => {
              const body = await readBody(req);
              const connection = JSON.parse(body);
              return await connectionRepository.create(connection);
            },
          'PUT':
            async () => {
              const body = await readBody(req);
              const connection = JSON.parse(body);
              return await connectionRepository.update(connection);
            },
          'DELETE':
            async () => {
              const connectionId = getUrlParam(req, res, 1);
              return await connectionRepository.delete(connectionId);
            },
        });
      });

      // POST /api/query-proxy - Proxy pour requêtes SQL externes
      server.middlewares.use('/api/query-proxy', async (req: IncomingMessage, res: ServerResponse) => {
        requestHandler(req, res, {
          'POST':
            async () => {
              const body = await readBody(req);
              const { connectionId, query } = JSON.parse(body);
              return await queryProxyUseCase.execute({ connectionId, query });
            },
        });
      });

      // POST /api/settings/import - Importer les données de l'application
      server.middlewares.use('/api/settings/import', async (req: IncomingMessage, res: ServerResponse) => {
        requestHandler(req, res, {
          'POST':
            async () => {
              const body = await readBody(req);
              const appDatas = JSON.parse(body);
              return await importAppDatasUseCase.execute(appDatas);
            },
        },
        );
      });

      // GET /api/settings/export - Exporter les données de l'application
      server.middlewares.use('/api/settings/export', async (req: IncomingMessage, res: ServerResponse) => {
        requestHandler(req, res, {
          'GET':
            async () => {
              return await exportDataUseCase.execute();
            },
        });
      });

      // POST /api/settings/clear - Supprimer toutes les données de l'application
      server.middlewares.use('/api/settings/clear', async (req: IncomingMessage, res: ServerResponse) => {
        requestHandler(req, res, {
          'POST':
            async () => {
              return await clearAllDatasUseCase.execute();
            },
        });
      });
    },
  };
}
