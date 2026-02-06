import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { DBConnection } from '../../../../shared/types/types';
import { DEFAULT_CONNECTION } from '../../../../shared/constants';

export async function addConnectionUseCase(connection?: Partial<DBConnection>): Promise<string> {
    const store = useConnectionsStore.getState();

    const id = crypto.randomUUID();
    const newConnection: DBConnection = {
        ...DEFAULT_CONNECTION,
        ...connection,
        id,
    };

    await storageProvider.putConnection(newConnection);
    
    const connections = [...store.connections, newConnection];
    store.setConnections(connections);

    return id;
}
