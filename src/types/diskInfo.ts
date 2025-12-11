import {TauriResponse} from "@/types/response";

export type DiskInfo = {
    diskName: string;
    diskLetter: string;
    mountPoint: string;
    fileSystem: string;
    diskType: string;
    removable: boolean;
    totalSpace: number;
    availableSpace: number;
};

export type DiskInfoResponse = TauriResponse<DiskInfo[]>