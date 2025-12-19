use crate::view::{
    create_directory, create_file, delete_entry, get_sidebar, list_disk, list_entries, open_file,
    open_in_terminal, open_with, search
};

mod model;
mod utils;
mod view;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_disk,
            get_sidebar,
            list_entries,
            create_directory,
            create_file,
            delete_entry,
            open_file,
            open_in_terminal,
            open_with,
            search
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
