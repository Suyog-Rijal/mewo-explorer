use std::thread::sleep;
use std::time::Duration;
use tauri::tray::TrayIconBuilder;
use crate::indexer::{build_index};
use crate::model::AlertType;
use crate::view::{alert, create_directory, create_file, delete_entry, get_sidebar, list_disk, list_entries, open_file, open_in_terminal, open_with, search};

mod model;
mod utils;
mod view;
mod indexer;

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
            let thread_app_handle = app.handle().clone();
            tauri::async_runtime::spawn({
                let handle = thread_app_handle;
                async move {
                    pause(10);
                    alert("indexAlert", &handle, AlertType::Info, "Building index, please wait...");
                    build_index();
                    alert("indexAlert", &handle, AlertType::Success, "Indexing completed!");
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


pub fn pause(duration: u64) {
    sleep(Duration::from_secs(duration));
}