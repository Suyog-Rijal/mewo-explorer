use crate::model::{DiskInfo, EntryInfo, Response, SidebarDefault, SidebarInfo};
use crate::utils::is_hidden_from_meta;
use chrono::{DateTime, Local};
use std::fs::{create_dir, read_dir, File};
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use std::{env, fs};
use sysinfo::Disks;

#[tauri::command]
pub fn list_disk() -> Response<Vec<DiskInfo>> {
    let mut res = Vec::new();
    let disks = Disks::new_with_refreshed_list();
    for each in disks.list() {
        let mount_point = each.mount_point();
        if mount_point.as_os_str().is_empty() {
            continue;
        }
        res.push(DiskInfo {
            disk_name: each.name().to_string_lossy().to_string(),
            disk_letter: mount_point
                .to_string_lossy()
                .to_string()
                .split(":")
                .next()
                .unwrap_or("")
                .to_string(),
            mount_point: mount_point.to_path_buf(),
            file_system: each.file_system().to_string_lossy().to_string(),
            disk_type: each.kind().to_string(),
            removable: each.is_removable(),
            total_space: each.total_space(),
            available_space: each.available_space(),
        })
    }
    Response::ok(res)
}

#[tauri::command]
pub fn get_sidebar() -> Response<SidebarInfo> {
    let mut default: Vec<SidebarDefault> = Vec::new();
    let home = env::var("USERPROFILE").ok().map(PathBuf::from);
    let volume = list_disk().data.unwrap_or_default();
    if let Some(home_path) = home {
        default.push(SidebarDefault {
            name: "Desktop".to_string(),
            path: home_path.join("Desktop"),
            icon: "/sidebar-desktop.png".to_string(),
        });

        default.push(SidebarDefault {
            name: "Downloads".to_string(),
            path: home_path.join("Downloads"),
            icon: "/sidebar-downloads.png".to_string(),
        });

        default.push(SidebarDefault {
            name: "Documents".to_string(),
            path: home_path.join("Documents"),
            icon: "/sidebar-documents.png".to_string(),
        });

        default.push(SidebarDefault {
            name: "Pictures".to_string(),
            path: home_path.join("Pictures"),
            icon: "/sidebar-pictures.png".to_string(),
        });

        default.push(SidebarDefault {
            name: "Music".to_string(),
            path: home_path.join("Music"),
            icon: "/sidebar-music.png".to_string(),
        });

        default.push(SidebarDefault {
            name: "Videos".to_string(),
            path: home_path.join("Videos"),
            icon: "/sidebar-videos.png".to_string(),
        });
    }

    let res = SidebarInfo { default, volume };
    Response::ok(res)
}

#[tauri::command]
pub fn list_entries(path: PathBuf) -> Response<Vec<EntryInfo>> {
    if path.is_file() {
        let res = open_file(path.clone());
        if res.code == 200 {
            return Response::executed("Executed successfully");
        }
    }

    let entries = match read_dir(&path) {
        Ok(v) => v,
        Err(_) => return Response::err("Failed to read directory"),
    };

    let mut res = Vec::with_capacity(64);

    for entry in entries {
        let entry = match entry {
            Ok(v) => v,
            Err(e) => return Response::err(e.to_string()),
        };

        let meta = match entry.metadata() {
            Ok(v) => v,
            Err(e) => return Response::err(e.to_string()),
        };

        let file_name = entry.file_name().to_string_lossy().into_owned();
        let is_hidden = is_hidden_from_meta(&meta);
        let is_dir = meta.is_dir();

        res.push(EntryInfo {
            name: file_name,
            path: entry.path(),
            content_type: if is_dir {
                "Directory".to_string()
            } else {
                match entry.path().extension().and_then(|s| s.to_str()) {
                    Some(ext) => ext.to_string(),
                    None => "Unknown".to_string(),
                }
            },
            is_file: meta.is_file(),
            is_dir: meta.is_dir(),
            is_hidden,
            size: meta.len(),
            modified: match meta.modified() {
                Ok(st) => {
                    let dt: DateTime<Local> = st.into();
                    dt.format("%Y-%m-%d %H:%M:%S").to_string()
                }
                Err(_) => "Unknown".to_string(),
            },
        });
    }

    Response::ok(res)
}

#[tauri::command]
pub fn create_directory(path: PathBuf, name: String) -> Response<()> {
    match create_dir(path.join(name)) {
        Ok(_) => Response::ok(()),
        Err(_) => Response::err("Failed to create directory"),
    }
}

#[tauri::command]
pub fn create_file(path: PathBuf, name: String) -> Response<()> {
    let ext = match name.rfind('.') {
        Some(i) => &name[i + 1..],
        None => "",
    };

    let bytes: &[u8] = match ext {
        "docx" => include_bytes!("../templates/blank.docx"),
        "xlsx" => include_bytes!("../templates/blank.xlsx"),
        "pptx" => include_bytes!("../templates/blank.pptx"),
        _ => &[],
    };

    let target = path.join(&name);

    let res = if bytes.is_empty() {
        File::create_new(target).map(|_| ())
    } else {
        File::create(target).and_then(|mut f| f.write_all(bytes))
    };

    match res {
        Ok(_) => Response::ok(()),
        Err(_) => Response::err("Failed to create file"),
    }
}

#[tauri::command]
pub fn delete_entry(path: PathBuf) -> Response<()> {
    if !path.exists() {
        return Response::err("Path does not exist");
    }

    let metadata = match fs::metadata(&path) {
        Ok(m) => m,
        Err(_) => return Response::err("Failed to read metadata"),
    };

    let result = if metadata.is_dir() {
        fs::remove_dir_all(&path)
    } else {
        fs::remove_file(&path)
    };

    match result {
        Ok(_) => Response::ok(()),
        Err(e) => Response::err(format!("Failed to delete: {}", e)),
    }
}

#[tauri::command]
pub fn open_file(path: PathBuf) -> Response<()> {
    match opener::open(path) {
        Ok(_) => Response::ok(()),
        Err(e) => Response::err(format!("Failed to open file: {}", e)),
    }
}

#[tauri::command]
pub fn open_in_terminal(path: PathBuf) -> Result<(), String> {
    if Command::new("cmd")
        .args(&[
            "/C",
            "start",
            "pwsh",
            "-NoExit",
            "-Command",
            &format!("Set-Location -LiteralPath '{}'", path.display()),
        ])
        .spawn()
        .is_ok()
    {
        return Ok(());
    }

    if Command::new("cmd")
        .args(&["/C", "start", "wt", "-d", &path.to_string_lossy()])
        .spawn()
        .is_ok()
    {
        return Ok(());
    }

    if Command::new("cmd")
        .args(&[
            "/C",
            "start",
            "powershell",
            "-NoExit",
            "-Command",
            &format!("Set-Location -LiteralPath '{}'", path.display()),
        ])
        .spawn()
        .is_ok()
    {
        return Ok(());
    }

    if Command::new("cmd")
        .args(&[
            "/C",
            "start",
            "cmd",
            "/K",
            "cd",
            "/d",
            &path.to_string_lossy(),
        ])
        .spawn()
        .is_ok()
    {
        return Ok(());
    }

    Err("Failed to open any terminal".into())
}

#[tauri::command]
pub async fn open_with(path: PathBuf) -> Result<(), String> {
    let p = path.clone();

    tauri::async_runtime::spawn_blocking(move || {
        std::process::Command::new("rundll32.exe")
            .args(["shell32.dll,OpenAs_RunDLL", p.to_string_lossy().as_ref()])
            .spawn()
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(())
}


#[tauri::command]
pub fn search(path: PathBuf, keyword: String) -> Response<Vec<EntryInfo>> {
    let mut res = Vec::new();

    fn helper(path: &PathBuf, keyword: &str, res: &mut Vec<EntryInfo>) {
        if let Ok(entries) = read_dir(path) {
            for entry in entries.flatten() {
                let path = entry.path();
                let file_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");

                if file_name.contains(keyword) {
                    let metadata = match entry.metadata() {
                        Ok(v) => v,
                        Err(e) => continue,
                    };
                    let is_file = metadata.is_file();
                    let is_dir = metadata.is_dir();
                    let size = if is_file { metadata.len() } else { 0 };
                    let modified = match metadata.modified() {
                        Ok(st) => {
                            let dt: DateTime<Local> = st.into();
                            dt.format("%Y-%m-%d %H:%M:%S").to_string()
                        }
                        Err(_) => "Unknown".to_string(),
                    };
                    let is_hidden = is_hidden_from_meta(&metadata);

                    res.push(EntryInfo {
                        name: file_name.to_string(),
                        path: path.clone(),
                        content_type: if is_file { "file".to_string() } else { "dir".to_string() },
                        is_file,
                        is_dir,
                        is_hidden,
                        size,
                        modified,
                    });
                }

                if path.is_dir() {
                    helper(&path, keyword, res);
                }
            }
        }
    }

    helper(&path, &keyword, &mut res);
    Response::ok(res)
}