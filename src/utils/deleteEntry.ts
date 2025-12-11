import {invoke} from "@tauri-apps/api/core";

export const delete_entry = (path: string, name?: string) => {
    const fullPath = name ? `${path}\\${name}` : path;
    invoke('delete_entry', {path: fullPath})
        .then(() => {
            return true;
        })
        .catch((error) => {
            console.error("Error deleting entry:", error);
            return false;
        });
}