use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DiskInfo {
    pub disk_name: String,
    pub disk_letter: String,
    pub mount_point: PathBuf,
    pub file_system: String,
    pub disk_type: String,
    pub removable: bool,
    pub total_space: u64,
    pub available_space: u64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryInfo {
    pub name: String,
    pub path: PathBuf,
    pub content_type: String,
    pub is_file: bool,
    pub is_dir: bool,
    pub is_hidden: bool,
    pub size: u64,
    pub modified: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[derive(Debug)]
pub struct SidebarDefault {
    pub name: String,
    pub path: PathBuf,
    pub icon: String,
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SidebarInfo {
    pub(crate) default: Vec<SidebarDefault>,
    pub(crate) volume: Vec<DiskInfo>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Response<T> {
    pub code: u16,
    pub message: String,
    pub data: Option<T>,
}
impl<T> Response<T> {
    pub fn ok(data: T) -> Self {
        Self {
            code: 200,
            message: "success".into(),
            data: Some(data),
        }
    }

    pub fn err(message: impl Into<String>) -> Self {
        Self {
            code: 500,
            message: message.into(),
            data: None,
        }
    }

    pub fn executed(message: impl Into<String>) -> Self {
        Self {
            code: 204,
            message: message.into(),
            data: None,
        }
    }
}