use std::path::Path;
use std::sync::Mutex;
use rusqlite::{Connection, TransactionBehavior};
use std::env;
use walkdir::WalkDir;

pub struct Db(pub Mutex<Connection>);

pub fn init_db() -> Db {
    let user = env::current_dir().unwrap().parent().unwrap().to_str().unwrap().to_string();
    let conn = Connection::open(Path::new(&user).join("index.db")).unwrap();

    conn.execute_batch(
        r#"
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = OFF;
        PRAGMA temp_store = MEMORY;
        PRAGMA locking_mode = EXCLUSIVE;
        PRAGMA mmap_size = 30000000000;
        PRAGMA page_size = 32768;
        PRAGMA cache_size = -100000;
        PRAGMA wal_autocheckpoint = 10000;
        "#,
    )
        .unwrap();

    conn.execute_batch(
        r#"DROP TABLE IF EXISTS data;
        CREATE TABLE IF NOT EXISTS data (
            name  BLOB NOT NULL,
            path  BLOB NOT NULL,
            size  INTEGER NOT NULL,
            flags INTEGER NOT NULL
        );
        "#,
    )
        .unwrap();

    Db(Mutex::new(conn))
}

pub fn build_index() {
    return;
    let db = init_db();
    let root = r"D:\";
    let mut con = db.0.lock().unwrap();
    let tx = con.transaction_with_behavior(TransactionBehavior::Exclusive).unwrap();

    {
        let mut stmt =
            tx.prepare("INSERT INTO data VALUES (?1, ?2, ?3, ?4)").unwrap();

        for entry in WalkDir::new(root)
            .follow_links(false)
            .into_iter()
            .filter_map(Result::ok) {
            let meta = match entry.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };
            let name = entry.file_name().as_encoded_bytes();
            let path = entry.path().as_os_str().as_encoded_bytes();
            let size = meta.len() as i64;
            let is_file = meta.is_file() as i64;

            stmt.execute((name, path, size, is_file)).unwrap();
        }
    }
    tx.commit().unwrap();
}

pub fn index_search(path: &str, keyword: &str) -> Vec<String> {
    let user = env::current_dir().unwrap().to_str().unwrap().to_string();
    let db = init_db();
    let con = db.0.lock().unwrap();
    let mut results = Vec::new();

    let mut stmt = con.prepare(
        "SELECT path FROM data WHERE path LIKE ?1 AND LOWER(CAST(name AS TEXT)) LIKE LOWER(?2)"
    );

    match stmt {
        Ok(mut s) => {
            let path_pattern = format!("%{}%", path);
            let name_pattern = format!("%{}%", keyword);
            let mut rows = s.query([path_pattern.as_str(), name_pattern.as_str()]).unwrap();
            while let Some(row) = rows.next().unwrap() {
                let path: Vec<u8> = row.get(0).unwrap();
                let path = String::from_utf8_lossy(&path).to_string();
                results.push(path);
            }
        }
        Err(e) => {
            eprintln!("Query error: {}", e);
        }
    }

    results
}
