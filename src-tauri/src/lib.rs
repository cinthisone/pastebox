// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri::Manager;
use image::GenericImageView;

/// Save base64 image data to Downloads folder
/// Optionally resizes the image if max_width is provided and image is wider
/// Returns the full file path where the image was saved
#[tauri::command]
async fn save_image(
    app: tauri::AppHandle,
    image_data: String,
    max_width: Option<u32>,
) -> Result<String, String> {
    use base64::Engine;

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    let base64_data = if image_data.contains("base64,") {
        image_data.split("base64,").nth(1).unwrap_or(&image_data)
    } else {
        &image_data
    };

    // Decode base64 to bytes
    let image_bytes = base64::engine::general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    // Load the image
    let img = image::load_from_memory(&image_bytes)
        .map_err(|e| format!("Failed to load image: {}", e))?;

    // Resize if needed
    let final_img = if let Some(max_w) = max_width {
        let (width, height) = img.dimensions();
        if width > max_w {
            // Calculate new height to maintain aspect ratio
            let new_height = (height as f64 * (max_w as f64 / width as f64)) as u32;
            img.resize(max_w, new_height, image::imageops::FilterType::Lanczos3)
        } else {
            img
        }
    } else {
        img
    };

    // Generate filename with timestamp
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("pastebox-{}.png", timestamp);

    // Get Downloads directory path
    let downloads_dir = app
        .path()
        .download_dir()
        .map_err(|e| format!("Failed to get downloads directory: {}", e))?;

    let file_path = downloads_dir.join(&filename);

    // Save the image
    final_img
        .save(&file_path)
        .map_err(|e| format!("Failed to save image: {}", e))?;

    // Return the full path as a string
    Ok(file_path.to_string_lossy().to_string())
}

/// Copy text to system clipboard
#[tauri::command]
async fn copy_to_clipboard(
    app: tauri::AppHandle,
    text: String,
) -> Result<(), String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;
    app.clipboard()
        .write_text(text)
        .map_err(|e| format!("Failed to copy to clipboard: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            save_image,
            copy_to_clipboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
