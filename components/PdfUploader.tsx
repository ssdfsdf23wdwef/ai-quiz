import React from 'react';
import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import LoadingSpinner from './LoadingSpinner';
import UploadIcon from './icons/UploadIcon';
import { getConfig } from '../services/configService'; // Import config service

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  const workerUrl = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

interface PdfUploaderProps {
  onPdfTextExtracted: (text: string, pdfName: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  onError: (errorMessage: string) => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ 
  onPdfTextExtracted, 
  onProcessingStateChange, 
  onError,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const appConfig = getConfig(); // Get config

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      onError("Lütfen geçerli bir PDF dosyası seçin.");
      if (event.target) event.target.value = ''; // Reset file input
      return;
    }

    setFileName(file.name);
    setIsProcessing(true); 
    onProcessingStateChange(true); 
    onError(""); 

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      const maxPdfTextLength = appConfig.maxPdfTextLength;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + "\n";
        if (fullText.length > maxPdfTextLength) {
            console.warn(`PDF metni ${maxPdfTextLength} karakter sınırına ulaştığı için kesildi.`);
            fullText = fullText.substring(0, maxPdfTextLength);
            break; 
        }
      }
      
      if (!fullText.trim()) {
        onError("PDF dosyasından metin çıkarılamadı veya dosya boş.");
        setIsProcessing(false); 
        onProcessingStateChange(false); 
        if (event.target) event.target.value = ''; 
        setFileName(null);
        return;
      }

      onPdfTextExtracted(fullText, file.name);
    } catch (error) {
      console.error("Error processing PDF:", error);
      onError(`PDF işlenirken hata oluştu: ${(error as Error).message}`);
      setIsProcessing(false); 
      onProcessingStateChange(false); 
      if (event.target) { 
        event.target.value = '';
      }
      setFileName(null); 
    }
  }, [onPdfTextExtracted, onProcessingStateChange, onError, appConfig.maxPdfTextLength]);
  
  return (
    <div className="w-full text-center">
      <label
        htmlFor="pdf-upload"
        className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-secondary-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors bg-gray-50 dark:bg-secondary-700/50 hover:bg-gray-100 dark:hover:bg-secondary-700/80"
      >
        <UploadIcon className="w-16 h-16 text-primary-500 dark:text-primary-400 mb-4" />
        <span className="text-xl font-semibold text-gray-700 dark:text-gray-100">PDF Dosyanızı Seçin</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sınav oluşturmak için bir PDF yükleyin</span>
        {fileName && !isProcessing && ( 
          <p className="mt-2 text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-700/30 px-2 py-1 rounded">Yüklendi: {fileName}</p>
        )}
        {isProcessing && fileName && <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Yükleniyor: {fileName}</p>}
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
      </label>
    </div>
  );
};

export default React.memo(PdfUploader);