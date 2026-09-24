import { useState, useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LazyStore } from "@tauri-apps/plugin-store";
import Settings from "./Settings";
import { formatPathForClipboard } from "./utils";
import "./App.css";

const appWindow = getCurrentWindow();

// Shared store instance for settings
const settingsStore = new LazyStore("settings.json");

function App() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [savedPath, setSavedPath] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [useWslPath, setUseWslPath] = useState<boolean>(true);
  const [clipboardPrefix, setClipboardPrefix] = useState<string>("");

  // Use refs to avoid stale closures in the paste handler
  const maxWidthRef = useRef(maxWidth);
  const useWslPathRef = useRef(useWslPath);
  const clipboardPrefixRef = useRef(clipboardPrefix);

  // Keep refs in sync with state
  useEffect(() => { maxWidthRef.current = maxWidth; }, [maxWidth]);
  useEffect(() => { useWslPathRef.current = useWslPath; }, [useWslPath]);
  useEffect(() => { clipboardPrefixRef.current = clipboardPrefix; }, [clipboardPrefix]);

  // Load settings on mount from Tauri store
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMaxWidth = await settingsStore.get<number>("maxWidth");
        if (savedMaxWidth !== null && savedMaxWidth !== undefined) {
          setMaxWidth(savedMaxWidth);
        }

        const savedUseWslPath = await settingsStore.get<boolean>("useWslPath");
        // Default to true (WSL path), only set to false if explicitly stored as false
        if (savedUseWslPath === false) {
          setUseWslPath(false);
        }

        const savedPrefix = await settingsStore.get<string>("clipboardPrefix");
        if (savedPrefix) {
          setClipboardPrefix(savedPrefix);
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    };
    loadSettings();
  }, []);

  // Handle settings modal close - receive values directly from Settings component
  const handleSettingsClose = (settings: { maxWidth: number | null; clipboardPrefix: string }) => {
    setShowSettings(false);
    setMaxWidth(settings.maxWidth);
    setClipboardPrefix(settings.clipboardPrefix);
  };

  // Handle paste event - uses refs to get current values
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
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
            // Get current values from refs (avoids stale closure)
            const currentMaxWidth = maxWidthRef.current;
            const currentUseWslPath = useWslPathRef.current;
            const currentClipboardPrefix = clipboardPrefixRef.current;

            // Save image to Downloads folder via Rust backend
            // Pass maxWidth for resizing if set
            const filePath = await invoke<string>("save_image", {
              imageData: base64Data,
              maxWidth: currentMaxWidth,
            });

            setSavedPath(filePath);

            // Format path based on user preference (Windows or WSL)
            const pathToCopy = formatPathForClipboard(filePath, currentUseWslPath);

            // Build clipboard text with optional prefix (wrap path in quotes if prefix is set)
            const clipboardText = currentClipboardPrefix
              ? `${currentClipboardPrefix}"${pathToCopy}"`
              : pathToCopy;

            // Copy file path to clipboard
            await invoke("copy_to_clipboard", { text: clipboardText });

            // Show success toast
            const pathFormat = currentUseWslPath ? "WSL " : "";
            showToast(`✅ Saved & ${pathFormat}path copied!`);
          } catch (error) {
            console.error("Error saving image:", error);
            showToast("❌ Error saving image");
          }
        };

        reader.readAsDataURL(blob);
        break;
      }
    }
  }, []);

  // Show toast notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  // Setup paste listener (handlePaste uses refs so no need to re-register)
  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

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
            className="titlebar-button wsl-toggle"
            onClick={async (e) => {
              e.stopPropagation();
              const newValue = !useWslPath;
              setUseWslPath(newValue);
              try {
                await settingsStore.set("useWslPath", newValue);
                await settingsStore.save();
              } catch (err) {
                console.error("Failed to save WSL path setting:", err);
              }
            }}
            title={useWslPath ? "Switch to Windows path" : "Switch to WSL path"}
          >
            {useWslPath ? "🐧" : "🪟"}
          </button>
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
