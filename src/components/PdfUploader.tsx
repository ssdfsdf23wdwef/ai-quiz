import React from 'react';
import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
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
  theme?: string;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ 
  onPdfTextExtracted, 
  onProcessingStateChange, 
  onError,
  theme,
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
    <div className="w-full">
      <label
        htmlFor="pdf-upload"
        className={`cursor-pointer flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-xl transition-all duration-200 hover:scale-[1.01] touch-target ${
          theme === 'dark' 
            ? 'border-secondary-600 hover:border-primary-500 bg-secondary-800/50 hover:bg-secondary-700/60' 
            : 'border-gray-300 hover:border-primary-500 bg-gray-50 hover:bg-gray-100'
        } ${isProcessing ? 'pointer-events-none opacity-75' : ''}`}
      >
        <div className={`p-3 rounded-full mb-3 ${
          theme === 'dark' 
            ? 'bg-primary-500/20 text-primary-400' 
            : 'bg-primary-100 text-primary-600'
        }`}>
          <UploadIcon className="w-8 h-8" />
        </div>
        
        <span className={`text-base sm:text-lg font-semibold mb-1 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        }`}>
          {isProcessing ? 'İşleniyor...' : 'PDF Dosyanızı Seçin'}
        </span>
        
        <span className={`text-xs sm:text-sm text-center px-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {isProcessing ? 'PDF dosyanız analiz ediliyor' : 'Tıklayın veya dosyayı sürükleyin'}
        </span>
        
        {fileName && (
          <div className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-medium max-w-full truncate ${
            isProcessing 
              ? (theme === 'dark' ? 'text-blue-300 bg-blue-500/20' : 'text-blue-600 bg-blue-100')
              : (theme === 'dark' ? 'text-green-300 bg-green-500/20' : 'text-green-600 bg-green-100')
          }`} title={fileName}>
            <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-check'} mr-1`}></i>
            {fileName}
          </div>
        )}
        
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