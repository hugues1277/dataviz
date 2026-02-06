import { create } from 'zustand';
import { DBConnection } from '../../../shared/types/types';
import { storageProvider } from '../../providers/apiProvider';
import { createConnectionsMap } from '../utils/storeUtils';
import logger from '../../../shared/utils/logger';

interface ConnectionsStore {
  connections: DBConnection[];
  isLoading: boolean;
  connectionsMap: Record<string, DBConnection>;
  initConnections: (connectionsData: DBConnection[]) => Promise<void>;
  addConnection: (conn: DBConnection) => Promise<void>;
  updateConnection: (conn: DBConnection) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  getConnectionById: (id: string) => DBConnection | undefined;
}

export const useConnectionsStore = create<ConnectionsStore>((set, get) => ({
  connections: [],
  isLoading: false,
  connectionsMap: {},

  initConnections: async (connectionsData: DBConnection[]) => {
    // Éviter les appels multiples simultanés
    if (get().isLoading) return;

    try {
      set({ isLoading: true });
      const data = connectionsData || await storageProvider.getAllConnections();
      const connectionsMap = createConnectionsMap(data);
      set({ connections: data, connectionsMap, isLoading: false });
    } catch (error: unknown) {
      logger.error('initConnections', error);
      set({ isLoading: false });
    }
  },

  addConnection: async (conn: DBConnection) => {
    await storageProvider.putConnection(conn);
    const connections = [...get().connections, conn];
    const connectionsMap = { ...get().connectionsMap, [conn.id]: conn };
    set({ connections, connectionsMap });
  },

  updateConnection: async (conn: DBConnection) => {
    await storageProvider.updateConnection(conn);
    const connections = get().connections.map(c => c.id === conn.id ? conn : c);
    const connectionsMap = { ...get().connectionsMap, [conn.id]: conn };
    set({ connections, connectionsMap });
  },

  deleteConnection: async (id: string) => {
    await storageProvider.deleteConnection(id);
    const connections = get().connections.filter(c => c.id !== id);
    const connectionsMap = { ...get().connectionsMap };
    delete connectionsMap[id];
    set({ connections, connectionsMap });
  },

  getConnectionById: (id: string) => {
    return get().connectionsMap[id];
  },
}));

