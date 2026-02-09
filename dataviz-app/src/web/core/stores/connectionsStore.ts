import { create } from 'zustand';
import { DBConnection } from '../../../shared/types/types';
import { createConnectionsMap } from '../utils/storeUtils';

interface ConnectionsStore {
  connections: DBConnection[] | null;
  connectionsMap: Record<string, DBConnection>;
  setConnections: (connections: DBConnection[]) => void;
}

export const useConnectionsStore = create<ConnectionsStore>((set, get) => ({
  connections: null,
  connectionsMap: {},

  setConnections: (connections: DBConnection[]) => {
    const connectionsMap = createConnectionsMap(connections);
    set({ connections, connectionsMap });
  },
}));

