import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '../../../providers/apiProvider';

export async function deleteConnectionUseCase(id: string): Promise<void> {
    const store = useConnectionsStore.getState();

    await storageProvider.deleteConnection(id);
    
    const connections = store.connections.filter(c => c.id !== id);
    store.setConnections(connections);
}
