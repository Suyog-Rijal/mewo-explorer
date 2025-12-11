import {DiskInfo} from "@/types/diskInfo";
import {TauriResponse} from "@/types/response";

export type SidebarDefault = {
    name: string;
    path: string;
    icon: string;
};

export type SidebarInfo = {
    default: SidebarDefault[];
    volume: DiskInfo[];
};

export type SidebarInfoResponse = TauriResponse<SidebarInfo>