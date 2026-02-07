import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { DBConnection } from '../../../../shared/types/types';
import { DEFAULT_CONNECTION } from '../../../../shared/constants';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../../i18n';

export async function addConnectionUseCase(connection?: Partial<DBConnection>): Promise<string> {
    const store = useConnectionsStore.getState();

    try {
        const id = crypto.randomUUID();
        const newConnection: DBConnection = {
            ...DEFAULT_CONNECTION,
            ...connection,
            id,
        };

        await storageProvider.putConnection(newConnection);

        const connections = [...(store.connections || []), newConnection];
        store.setConnections(connections);

        return id;
    } catch (error: unknown) {
        logger.error('addConnection', error);
        toast.error(i18n.t('common.errorOccurred'));
    }

    return "";
}
