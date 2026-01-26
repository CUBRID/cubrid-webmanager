import { HostInfo } from '@type/host-info';

/**
 * Request type for updating a host.
 * Contains host information with hostUid instead of uid for client requests.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type UpdateHostClientRequest = Omit<HostInfo, 'uid' | 'token'> & {
    hostUid: string;
};
