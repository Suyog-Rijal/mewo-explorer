import {invoke} from "@tauri-apps/api/core";

export const create_directory = (path: string, name: String) => {
    invoke('create_directory', {path: path, name: name})
        .then(() => {
            return true;
        })
        .catch((error) => {
            console.error("Error creating directory:", error);
            return false;
        });
}

export const create_file = (path: string, name: String) => {
    invoke('create_file', {path: path, name: name})
        .then(() => {
            return true;
        })
        .catch((error) => {
            console.error("Error creating file:", error);
            return false;
        });
}