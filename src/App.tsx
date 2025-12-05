import { useState, useEffect, useCallback } from 'react'
import { DragDrop } from './components/DragDrop'
import { MetadataEditor } from './components/MetadataEditor'

// Window sizes
const WINDOW_COMPACT = { width: 800, height: 290 };
const WINDOW_EXPANDED = { width: 800, height: 825 };

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Resize window based on content
  const resizeWindow = useCallback((expanded: boolean) => {
    const size = expanded ? WINDOW_EXPANDED : WINDOW_COMPACT;
    window.ipcRenderer.invoke('resize-window', size.width, size.height);
  }, []);

  const loadMetadata = useCallback(async (filePath: string) => {
    setLoading(true);
    setHasError(false);
    try {
      const data = await window.ipcRenderer.invoke('read-metadata', filePath);
      console.log('Metadata:', data);
      setMetadata(data);
      // Resize window after successful load
      resizeWindow(true);
    } catch (err) {
      console.error('Error reading metadata:', err);
      setMetadata(null);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [resizeWindow]);

  useEffect(() => {
    if (file && file.path) {
      loadMetadata(file.path);
    } else {
      setMetadata(null);
      setHasError(false);
      // Resize back to compact when no file
      resizeWindow(false);
    }
  }, [file, loadMetadata, resizeWindow]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleSaveMetadata = async (newMetadata: Record<string, string>) => {
    if (!file?.path) return;
    await window.ipcRenderer.invoke('write-metadata', file.path, newMetadata);
  };

  const handleReload = () => {
    if (file?.path) {
      loadMetadata(file.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5 font-sans overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <header className="mb-6 text-center shrink-0">
          <p className="text-gray-600">Impulsado por FFmpeg y Electron</p>
        </header>

        <main className="space-y-8">
          {!file ? (
            <DragDrop onFileSelect={handleFileSelect} />
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-400">Archivo Seleccionado</h2>
                <button 
                  onClick={() => setFile(null)}
                  className="text-sm text-gray-400 hover:text-white hover:underline"
                >
                  Cambiar Archivo
                </button>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg mb-6 font-mono text-sm break-all">
                {file.path}
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="animate-spin h-8 w-8 mx-auto mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cargando metadatos...
                </div>
              ) : metadata ? (
                <MetadataEditor 
                  metadata={metadata}
                  filePath={file.path}
                  onSave={handleSaveMetadata}
                  onReload={handleReload}
                />
              ) : hasError ? (
                <div className="text-center py-12 text-red-400 border border-red-900/50 bg-red-900/10 rounded-lg">
                  Error al cargar metadatos o archivo no soportado.
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
