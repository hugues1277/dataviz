import { executeQuery as executeQueryTauri, getQueryKey as getQueryKeyTauri } from "./tauriQueryProvider";
import { executeQuery as executeQueryApi, getQueryKey as getQueryKeyApi } from "./apiQueryProvider";
import { isTauri } from '../../../shared/utils/platform';

export const executeQuery = isTauri() ? executeQueryTauri : executeQueryApi;
export const getQueryKey = isTauri() ? getQueryKeyTauri : getQueryKeyApi;