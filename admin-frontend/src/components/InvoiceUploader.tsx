import React, { useCallback, useState } from 'react';
import { cn } from '../utils/cn';
import type { UploadState } from '../types/invoice.types';

interface InvoiceUploaderProps {
    onFileUpload: (file: File) => void;
}

export const InvoiceUploader: React.FC<InvoiceUploaderProps> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
    });

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const xmlFile = files.find(file => file.name.toLowerCase().endsWith('.xml'));

        if (xmlFile) {
            processFile(xmlFile);
        } else {
            setUploadState({
                isUploading: false,
                progress: 0,
                error: 'Por favor, sube un archivo XML válido',
            });
        }
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    }, []);

    const processFile = (file: File) => {
        setUploadState({
            isUploading: true,
            progress: 0,
            error: null,
        });

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadState(prev => {
                if (prev.progress >= 100) {
                    clearInterval(interval);
                    return { ...prev, isUploading: false };
                }
                return { ...prev, progress: prev.progress + 20 };
            });
        }, 100);

        onFileUpload(file);
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200",
                    isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 bg-white"
                )}
            >
                <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                />

                <div className="space-y-4">
                    <div className="flex justify-center">
                        <svg
                            className={cn(
                                "w-16 h-16",
                                isDragging ? "text-blue-500" : "text-gray-400"
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>

                    <div>
                        <p className="text-lg font-medium text-gray-700">
                            Arrastra tu archivo XML aquí
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            o haz clic para seleccionar
                        </p>
                    </div>

                    <div className="text-xs text-gray-400">
                        Formatos soportados: XML
                    </div>
                </div>

                {uploadState.isUploading && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadState.progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Procesando... {uploadState.progress}%
                        </p>
                    </div>
                )}

                {uploadState.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{uploadState.error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
