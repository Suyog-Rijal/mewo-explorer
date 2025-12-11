use std::fs::Metadata;
use std::time::SystemTime;
use chrono::{DateTime, Utc};

pub fn system_time_to_string(time: SystemTime) -> String {
    let datetime: DateTime<Utc> = time.into();
    datetime.to_rfc3339()
}

#[cfg(windows)]
pub fn is_hidden_from_meta(meta: &Metadata) -> bool {
    use std::os::windows::fs::MetadataExt;
    const FILE_ATTRIBUTE_HIDDEN: u32 = 0x2;
    meta.file_attributes() & FILE_ATTRIBUTE_HIDDEN != 0
}

#[cfg(not(windows))]
pub fn is_hidden_from_meta(_meta: &Metadata) -> bool {
    false
}