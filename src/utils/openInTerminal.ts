import {invoke} from "@tauri-apps/api/core";

export const open_in_terminal = (path: string) => {
    invoke('open_in_terminal', {path: path})
        .then(() => {
            return true;
        })
        .catch((error) => {
            console.error("Error opening terminal:", error);
            return false;
        });
}