import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Settings from "./Settings";
import "./App.css";

const appWindow = getCurrentWindow();

function App() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [savedPath, setSavedPath] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);

  // Load settings on mount
  useEffect(() => {
    const savedMaxWidth = localStorage.getItem("maxWidth");
    if (savedMaxWidth) {
      const width = parseInt(savedMaxWidth, 10);
      setMaxWidth(width);
    }
  }, []);

  // Reload settings when settings modal closes
  const handleSettingsClose = () => {
    setShowSettings(false);

    // Reload the max width setting
    const savedMaxWidth = localStorage.getItem("maxWidth");
    if (savedMaxWidth) {
      const width = parseInt(savedMaxWidth, 10);
      setMaxWidth(width);
    } else {
      setMaxWidth(null);
    }
  };

  // Handle paste event
  const handlePaste = async (e: ClipboardEvent) => {
    e.preventDefault();

    const items = e.clipboardData?.items;
    if (!items) return;

    // Find image item in clipboard
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (!blob) continue;

        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;

          // Display image preview
          setImageUrl(base64Data);

          try {
            // Save image to Downloads folder via Rust backend
            // Pass maxWidth for resizing if set
            const filePath = await invoke<string>("save_image", {
              imageData: base64Data,
              maxWidth: maxWidth,
            });

            setSavedPath(filePath);

            // Copy file path to clipboard
            await invoke("copy_to_clipboard", { text: filePath });

            // Show success toast
            showToast("✅ Saved & path copied!");
          } catch (error) {
            showToast("❌ Error saving image");
          }
        };

        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  // Show toast notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  // Setup paste listener
  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [maxWidth]); // Re-register when maxWidth changes

  // Handle drag start for the image
  const handleDragStart = (e: React.DragEvent<HTMLImageElement>) => {
    if (savedPath) {
      // Set the file path as the drag data
      e.dataTransfer.setData("text/plain", savedPath);
      e.dataTransfer.effectAllowed = "copy";
    }
  };

  return (
    <div className="app">
      {/* Custom window controls */}
      <div className="titlebar" data-tauri-drag-region>
        <div className="titlebar-title">PasteBox</div>
        <div className="titlebar-buttons" style={{ pointerEvents: 'auto' }}>
          <button
            className="titlebar-button settings"
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(true);
            }}
            title="Settings"
          >
            ⚙
          </button>
          <button
            className="titlebar-button minimize"
            onClick={(e) => {
              e.stopPropagation();
              appWindow.minimize();
            }}
            title="Minimize"
          >
            −
          </button>
          <button
            className="titlebar-button close"
            onClick={(e) => {
              e.stopPropagation();
              appWindow.close();
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="content">
        {imageUrl ? (
          <div className="image-container">
            <img
              src={imageUrl}
              alt="Pasted"
              draggable="true"
              onDragStart={handleDragStart}
              title="Drag to another app"
            />
            <div className="image-info">
              <small>{savedPath.split(/[\\/]/).pop()}</small>
            </div>
          </div>
        ) : (
          <div className="placeholder">
            <div className="placeholder-icon">📋</div>
            <p>Paste an image</p>
            <small>Ctrl+V</small>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Settings modal */}
      {showSettings && <Settings onClose={handleSettingsClose} />}
    </div>
  );
}

export default App;
