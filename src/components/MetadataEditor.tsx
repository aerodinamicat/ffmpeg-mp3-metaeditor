import React, { useState, useEffect } from 'react';

interface MetadataEditorProps {
  metadata: any;
  filePath: string;
  onSave: (metadata: Record<string, string>) => Promise<void>;
  onReload: () => void;
}

interface EditableMetadata {
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
  comment: string;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({ 
  metadata, 
  onSave,
  onReload 
}) => {
  const [editedMetadata, setEditedMetadata] = useState<EditableMetadata>({
    title: '',
    artist: '',
    album: '',
    year: '',
    genre: '',
    comment: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Extract existing metadata from format.tags
  useEffect(() => {
    const tags = metadata?.format?.tags || {};
    setEditedMetadata({
      title: tags.title || tags.TITLE || '',
      artist: tags.artist || tags.ARTIST || '',
      album: tags.album || tags.ALBUM || '',
      year: tags.date || tags.DATE || tags.year || tags.YEAR || '',
      genre: tags.genre || tags.GENRE || '',
      comment: tags.comment || tags.COMMENT || '',
    });
  }, [metadata]);

  const handleChange = (field: keyof EditableMetadata, value: string) => {
    setEditedMetadata(prev => ({
      ...prev,
      [field]: value,
    }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await onSave({ ...editedMetadata });
      setSaveStatus('success');
      // Auto-reload after successful save
      setTimeout(() => {
        onReload();
      }, 1000);
    } catch (error) {
      console.error('Failed to save metadata:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof EditableMetadata; label: string }[] = [
    { key: 'title', label: 'Título' },
    { key: 'artist', label: 'Artista' },
    { key: 'album', label: 'Álbum' },
    { key: 'year', label: 'Año' },
    { key: 'genre', label: 'Género' },
    { key: 'comment', label: 'Comentario' },
  ];

  // Get format info for display
  const format = metadata?.format || {};
  const duration = format.duration ? `${Math.floor(format.duration / 60)}:${String(Math.floor(format.duration % 60)).padStart(2, '0')}` : 'N/A';
  const bitrate = format.bit_rate ? `${Math.round(format.bit_rate / 1000)} kbps` : 'N/A';

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Información del Archivo</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Formato:</span>
            <span className="ml-2 text-gray-200">{format.format_name || 'Desconocido'}</span>
          </div>
          <div>
            <span className="text-gray-500">Duración:</span>
            <span className="ml-2 text-gray-200">{duration}</span>
          </div>
          <div>
            <span className="text-gray-500">Tasa de bits:</span>
            <span className="ml-2 text-gray-200">{bitrate}</span>
          </div>
        </div>
      </div>

      {/* Metadata Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Metadatos</h3>
        <div className="grid grid-cols-2 gap-4">
          {fields.map(({ key, label }) => (
            <div key={key} className={key === 'comment' ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {label}
              </label>
              {key === 'comment' ? (
                <textarea
                  value={editedMetadata[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder="Sin definir"
                  rows={2}
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={editedMetadata[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder="Sin definir"
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {saveStatus === 'success' && (
            <span className="text-green-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              ¡Metadatos guardados correctamente!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error al guardar. Inténtalo de nuevo.
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all
            ${saving 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25'
            }
          `}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </span>
          ) : (
            'Guardar Cambios'
          )}
        </button>
      </div>
    </div>
  );
};
