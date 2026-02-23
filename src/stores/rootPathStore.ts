import { create } from 'zustand';
import { apiRemoteService } from '../services/APIRequest';

interface RootPathState {
    rootPaths: Record<string, string>; // mapping "workspace_id:device_mac" to root path
    fetchRootPath: (workspaceId: string, userId: string, deviceMac: string) => Promise<void>;
    getRootPath: (workspaceId: string, deviceMac: string) => string | undefined;
}

export const useRootPathStore = create<RootPathState>((set, get) => ({
    rootPaths: {},

    fetchRootPath: async (workspaceId: string, userId: string, deviceMac: string) => {
        try {
            const response = await apiRemoteService.get(`/users/local-root-path`, {
                params: {
                    device_mac: deviceMac,
                    user_id: userId,
                    workspace_id: workspaceId,
                },
            });

            if (response.data && response.data.local_root_path) {
                set((state) => ({
                    rootPaths: {
                        ...state.rootPaths,
                        [`${workspaceId}:${deviceMac}`]: response.data.local_root_path,
                    },
                }));
            }
        } catch (error) {
            console.error('Error fetching root path:', error);
        }
    },

    getRootPath: (workspaceId: string, deviceMac: string) => {
        return get().rootPaths[`${workspaceId}:${deviceMac}`];
    },
}));
