import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { DBConnection } from '../../../../shared/types/types';

export async function updateConnectionUseCase(connection: DBConnection): Promise<void> {
    const store = useConnectionsStore.getState();

    await storageProvider.updateConnection(connection);
    
    const connections = store.connections.map(c => c.id === connection.id ? connection : c);
    store.setConnections(connections);
}
