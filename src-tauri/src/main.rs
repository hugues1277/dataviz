// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

#[derive(Debug, Deserialize)]
struct PostgresConnection {
    host: String,
    port: u16,
    database: String,
    user: String,
    password: String,
    ssl: bool,
}

#[derive(Debug, Serialize)]
struct QueryResult {
    columns: Vec<String>,
    rows: Vec<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

/// Convertit une valeur PostgreSQL en JSON de manière générique et robuste
fn postgres_value_to_json(row: &tokio_postgres::Row, idx: usize) -> serde_json::Value {
    use tokio_postgres::types::Type;
    
    let pg_type = row.columns()[idx].type_();
    
    // Essayer de convertir selon le type PostgreSQL avec gestion d'erreur améliorée
    match *pg_type {
        Type::BOOL => {
            if let Ok(Some(val)) = row.try_get::<_, Option<bool>>(idx) {
                return serde_json::Value::Bool(val);
            }
        }
        Type::INT2 => {
            if let Ok(Some(val)) = row.try_get::<_, Option<i16>>(idx) {
                return serde_json::Value::Number(serde_json::Number::from(val));
            }
        }
        Type::INT4 => {
            if let Ok(Some(val)) = row.try_get::<_, Option<i32>>(idx) {
                return serde_json::Value::Number(serde_json::Number::from(val));
            }
        }
        Type::INT8 => {
            if let Ok(Some(val)) = row.try_get::<_, Option<i64>>(idx) {
                return serde_json::Value::Number(serde_json::Number::from(val));
            }
        }
        Type::FLOAT4 => {
            if let Ok(Some(val)) = row.try_get::<_, Option<f32>>(idx) {
                if let Some(num) = serde_json::Number::from_f64(val as f64) {
                    return serde_json::Value::Number(num);
                }
            }
        }
        Type::FLOAT8 => {
            if let Ok(Some(val)) = row.try_get::<_, Option<f64>>(idx) {
                if let Some(num) = serde_json::Number::from_f64(val) {
                    return serde_json::Value::Number(num);
                }
            }
        }
        Type::JSON | Type::JSONB => {
            // Pour JSON/JSONB, lire comme string puis parser en JSON
            if let Ok(Some(val)) = row.try_get::<_, Option<String>>(idx) {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&val) {
                    return parsed;
                }
                // Si le parsing échoue, retourner la string brute
                return serde_json::Value::String(val);
            }
        }
        Type::DATE => {
            // Pour DATE, utiliser chrono::NaiveDate
            if let Ok(Some(val)) = row.try_get::<_, Option<chrono::NaiveDate>>(idx) {
                return serde_json::Value::String(val.format("%Y-%m-%d").to_string());
            }
            // Fallback : essayer comme string
            if let Ok(Some(val)) = row.try_get::<_, Option<String>>(idx) {
                return serde_json::Value::String(val);
            }
        }
        Type::TIME => {
            // Pour TIME, utiliser chrono::NaiveTime
            if let Ok(Some(val)) = row.try_get::<_, Option<chrono::NaiveTime>>(idx) {
                return serde_json::Value::String(val.format("%H:%M:%S%.f").to_string());
            }
            // Fallback : essayer comme string
            if let Ok(Some(val)) = row.try_get::<_, Option<String>>(idx) {
                return serde_json::Value::String(val);
            }
        }
        Type::TIMESTAMP => {
            // Pour TIMESTAMP, utiliser chrono::NaiveDateTime
            if let Ok(Some(val)) = row.try_get::<_, Option<chrono::NaiveDateTime>>(idx) {
                return serde_json::Value::String(val.format("%Y-%m-%d %H:%M:%S%.f").to_string());
            }
            // Fallback : essayer comme string
            if let Ok(Some(val)) = row.try_get::<_, Option<String>>(idx) {
                return serde_json::Value::String(val);
            }
        }
        Type::TIMESTAMPTZ => {
            // Pour TIMESTAMPTZ, utiliser chrono::DateTime<Utc>
            if let Ok(Some(val)) = row.try_get::<_, Option<chrono::DateTime<chrono::Utc>>>(idx) {
                return serde_json::Value::String(val.format("%Y-%m-%d %H:%M:%S%.f %Z").to_string());
            }
            // Fallback : essayer comme string
            if let Ok(Some(val)) = row.try_get::<_, Option<String>>(idx) {
                return serde_json::Value::String(val);
            }
        }
        Type::TEXT | Type::VARCHAR | Type::BPCHAR | Type::NAME => {
            if let Ok(Some(val)) = row.try_get::<_, Option<String>>(idx) {
                return serde_json::Value::String(val);
            }
        }
        Type::BYTEA => {
            // Pour les données binaires, convertir en représentation hexadécimale PostgreSQL
            if let Ok(Some(val)) = row.try_get::<_, Option<Vec<u8>>>(idx) {
                let hex: String = val.iter().map(|b| format!("{:02x}", b)).collect();
                return serde_json::Value::String(format!("\\x{}", hex));
            }
        }
        _ => {
            // Pour tous les autres types, essayer de convertir en string
            if let Ok(Some(val)) = row.try_get::<_, Option<String>>(idx) {
                return serde_json::Value::String(val);
            }
        }
    }
    
    // Si la valeur est NULL ou si toutes les conversions échouent, retourner Null
    serde_json::Value::Null
}

#[tauri::command]
async fn execute_postgres_query(
    connection: PostgresConnection,
    query: String,
) -> Result<QueryResult, String> {

    // log the connection
    println!("connection: {:?}", connection.host);
    println!("connection: {:?}", connection.port);
    println!("connection: {:?}", connection.database);
    println!("connection: {:?}", connection.user);
    println!("connection: {:?}", connection.password);
    println!("connection: {:?}", connection.ssl);
    println!("query: {:?}", query);

    // Construire la configuration de connexion PostgreSQL avec timeout
    let mut config = tokio_postgres::Config::new();
    config.host(&connection.host);
    config.port(connection.port);
    config.dbname(&connection.database);
    config.user(&connection.user);
    config.password(&connection.password);
    
    // Configurer le timeout de connexion (10 secondes)
    config.connect_timeout(Duration::from_secs(10));
    
    // Configurer SSL si nécessaire
    if connection.ssl {
        config.ssl_mode(tokio_postgres::config::SslMode::Require);
    }

    // Se connecter à PostgreSQL avec ou sans SSL avec timeout
    // Séparer les deux cas pour éviter les problèmes de types incompatibles
    let (client, connection_task): (tokio_postgres::Client, tokio::task::JoinHandle<()>) = 
        if connection.ssl {
            let connector = postgres_native_tls::MakeTlsConnector::new(
                native_tls::TlsConnector::builder()
                    .danger_accept_invalid_certs(true)
                    .build()
                    .map_err(|e| format!("Erreur de configuration SSL: {}", e))?,
            );
            let (client, connection) = tokio::time::timeout(
                Duration::from_secs(10),
                config.connect(connector),
            )
            .await
            .map_err(|_| "Timeout lors de la connexion à PostgreSQL (10s)")?
            .map_err(|e| format!("Erreur de connexion PostgreSQL (SSL): {}", e))?;
            
            let connection_task = tokio::spawn(async move {
                if let Err(e) = connection.await {
                    eprintln!("Erreur de connexion PostgreSQL: {}", e);
                }
            });
            (client, connection_task)
        } else {
            let (client, connection) = tokio::time::timeout(
                Duration::from_secs(10),
                config.connect(tokio_postgres::NoTls),
            )
            .await
            .map_err(|_| "Timeout lors de la connexion à PostgreSQL (10s)")?
            .map_err(|e| format!("Erreur de connexion PostgreSQL: {}", e))?;
            
            let connection_task = tokio::spawn(async move {
                if let Err(e) = connection.await {
                    eprintln!("Erreur de connexion PostgreSQL: {}", e);
                }
            });
            (client, connection_task)
        };

    // Exécuter la requête avec un timeout (30 secondes)
    let rows: Vec<tokio_postgres::Row> = tokio::time::timeout(
        Duration::from_secs(30),
        client.query(&query, &[]),
    )
    .await
    .map_err(|_| "Timeout lors de l'exécution de la requête (30s)")?
    .map_err(|e| format!("Erreur lors de l'exécution de la requête: {}", e))?;
    
    // Fermer le client pour libérer la connexion
    // La tâche de connexion se terminera automatiquement
    drop(client);

    // Extraire les colonnes
    let columns: Vec<String> = if let Some(row) = rows.first() {
        row.columns()
            .iter()
            .map(|col| col.name().to_string())
            .collect()
    } else {
        Vec::new()
    };

    // Convertir les lignes en HashMap avec des valeurs JSON
    let mut result_rows: Vec<HashMap<String, serde_json::Value>> = Vec::new();
    
    for row in rows {
        let mut row_map: HashMap<String, serde_json::Value> = HashMap::new();
        
        for (idx, column) in row.columns().iter().enumerate() {
            let column_name = column.name().to_string();
            let value = postgres_value_to_json(&row, idx);
            row_map.insert(column_name, value);
        }
        
        result_rows.push(row_map);
    }

    Ok(QueryResult {
        columns,
        rows: result_rows,
        error: None,
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![execute_postgres_query])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
