import {TauriResponse} from "@/types/response";

export type ListEntries = {
    name: string;
    path: string;
    contentType: string;
    isFile: boolean;
    isDir: boolean;
    isHidden: boolean;
    size: number;
    modified: string;
}

export type ListEntriesResponse = TauriResponse<ListEntries[]>