import React, { useCallback, useState, useRef } from 'react';

interface DragDropProps {
  onFileSelect: (file: File) => void;
}

export const DragDrop: React.FC<DragDropProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/10 scale-[1.02]' 
          : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }
      `}
    >
      <div className="text-center p-6 pointer-events-none">
        <p className="text-xl font-medium text-gray-200 mb-2">
          {isDragging ? '¡Suéltalo aquí!' : 'Arrastra tu archivo multimedia'}
        </p>
        <p className="text-sm text-gray-400">
          Soporta formatos de Video y Audio
        </p>
      </div>
    </div>
  );
};

