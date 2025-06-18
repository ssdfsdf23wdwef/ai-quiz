
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QuizQuestion } from '../types';
import jsPDF from 'jspdf';

interface QuizViewProps {
  questions: QuizQuestion[];
  onSubmitQuiz: (answers: Record<string, number>) => void;
  onCancel: () => void;
  isTimerEnabled?: boolean;
  totalTimeInSeconds?: number;
  pdfSourceFilename?: string; 
}

const QuizView: React.FC<QuizViewProps> = ({ 
  questions, 
  onSubmitQuiz, 
  onCancel,
  isTimerEnabled = false,
  totalTimeInSeconds = 0,
  pdfSourceFilename,
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remainingTime, setRemainingTime] = useState<number>(totalTimeInSeconds);
  const timerRef = useRef<number | null>(null);
  const fontDataRef = useRef<string | null>(null);
  const [fontLoadingError, setFontLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const loadFont = async () => {
      try {
        const response = await fetch('./fonts/NotoSans-Regular.ttf');
        if (!response.ok) {
          throw new Error(`Font dosyası yüklenemedi: ${response.statusText} (${response.status})`);
        }
        const fontBuffer = await response.arrayBuffer();
        
        // Heuristic: A real NotoSans TTF is much larger than a few KBs.
        // If the file is very small, assume it's a placeholder.
        if (fontBuffer.byteLength < 1000) { // e.g., less than 1KB
          console.warn("Yüklenen font dosyası (NotoSans-Regular.ttf) bir yer tutucu gibi görünüyor veya çok küçük. Özel font gömülmeyecek, Helvetica kullanılacak.");
          throw new Error("Yer tutucu font dosyası algılandı. Helvetica kullanılacak.");
        }

        let binary = '';
        const bytes = new Uint8Array(fontBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        fontDataRef.current = btoa(binary);
        setFontLoadingError(null); // Clear any previous loading error
        console.log("NotoSans fontu başarıyla yüklendi ve base64'e çevrildi.");
      } catch (error) {
        console.error("Özel font (NotoSans) yüklenirken hata:", error);
        setFontLoadingError((error as Error).message || "Özel font yüklenemedi.");
        fontDataRef.current = null; // Ensure no data is used if loading failed
      }
    };
    loadFont();
  }, []);


  useEffect(() => {
    setAnswers({});
    setRemainingTime(totalTimeInSeconds);
  }, [questions, totalTimeInSeconds]);

  useEffect(() => {
    if (isTimerEnabled && remainingTime > 0 && questions.length > 0) {
      timerRef.current = window.setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleSubmit(true); 
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (remainingTime <= 0 && isTimerEnabled && questions.length > 0) {
        handleSubmit(true); 
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerEnabled, remainingTime, questions.length]);


  const handleOptionChange = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = (isAutoSubmit: boolean = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const answeredCount = Object.keys(answers).length;
    if (!isAutoSubmit && answeredCount < questions.length) {
      if (!window.confirm("Tüm soruları yanıtlamadınız. Yine de bitirmek istediğinize emin misiniz?")) {
        return;
      }
    }
    onSubmitQuiz(answers);
  };

  const handleCancelQuiz = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel();
  }

  const handleDownloadPdf = () => {
    if (!questions || questions.length === 0) {
      alert("Sınavda soru bulunmadığı için PDF oluşturulamıyor.");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
      
      let fontNameToUse = "Helvetica"; // Default to Helvetica

      // Attempt to use custom font only if it was loaded successfully and no error occurred during loading
      if (fontDataRef.current && !fontLoadingError) {
        try {
          doc.addFileToVFS('NotoSans-Regular.ttf', fontDataRef.current);
          doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
          doc.setFont('NotoSans', 'normal'); // Attempt to set NotoSans
          
          // Validate if font metrics are available for NotoSans
          // This might throw if NotoSans is not properly processed by jsPDF
          doc.getTextWidth("test string with NotoSans"); 

          fontNameToUse = "NotoSans"; // If all above succeed, use NotoSans
          console.log("NotoSans fontu PDF'e başarıyla gömüldü ve kullanılabilir.");
        } catch (e) {
          console.error("NotoSans fontunu PDF'e gömerken veya test ederken hata:", e);
          fontNameToUse = "Helvetica"; // Fallback to Helvetica
          doc.setFont(fontNameToUse, "normal"); // Explicitly set active font to Helvetica
          alert("Özel font (NotoSans) PDF'e işlenirken bir hata oluştu. Bazı Türkçe karakterler doğru görüntülenmeyebilir. Varsayılan font (Helvetica) kullanılacak.");
        }
      } else {
        // This block is entered if fontDataRef.current is null (e.g., placeholder detected, fetch failed)
        // OR if fontLoadingError was set during the font loading effect.
        fontNameToUse = "Helvetica"; // Ensure Helvetica
        doc.setFont(fontNameToUse, "normal"); // Explicitly set active font
        
        const fontWarningBase = "Bazı Türkçe karakterler PDF'te doğru görüntülenmeyebilir. Varsayılan font (Helvetica) kullanılacak.";
        if (fontLoadingError) {
            if (fontLoadingError.includes("Yer tutucu font dosyası algılandı")) {
                 alert(`Uyarı: Özel font (NotoSans-Regular.ttf) bir yer tutucu dosya olarak algılandı veya çok küçük. ${fontWarningBase}`);
            } else {
                 alert(`Uyarı: Özel font yüklenemedi ('${fontLoadingError}'). ${fontWarningBase}`);
            }
        } else if (!fontDataRef.current) { 
            alert(`Uyarı: Özel font (NotoSans) yüklenmedi veya bir yer tutucu olarak algılandı. ${fontWarningBase}`);
        }
      }
      
      const setFontWithStyle = (style: 'normal' | 'bold' | 'italic') => {
        if (fontNameToUse === 'NotoSans') {
            // NotoSans was only registered with 'normal' style. Forcing it.
            doc.setFont('NotoSans', 'normal'); 
        } else {
            // Helvetica can handle these styles by default.
            doc.setFont('Helvetica', style); 
        }
      };

      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      let yPosition = margin;
      const lineHeight = 7; 
      const questionSpacing = 10;
      const optionSpacing = 5;

      doc.setFontSize(16);
      setFontWithStyle("bold"); 
      const titleText = pdfSourceFilename ? `${pdfSourceFilename.replace(/\.pdf$/i, '')} Sınavı` : 'Oluşturulan Sınav';
      const titleWidth = doc.getTextWidth(titleText);
      doc.text(titleText, (pageWidth - titleWidth) / 2, yPosition);
      yPosition += lineHeight * 2.5;

      doc.setFontSize(12);
      setFontWithStyle("normal"); 

      questions.forEach((question, index) => {
        const questionTextLinesEstimate = doc.splitTextToSize(question.question, pageWidth - margin * 2).length;
        let optionsHeightEstimate = question.options.length * lineHeight;
        if (question.subtopic) optionsHeightEstimate += lineHeight; 

        if (yPosition + (questionTextLinesEstimate * lineHeight) + optionsHeightEstimate + questionSpacing > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          doc.setFontSize(10);
          setFontWithStyle("normal");
          doc.text(`Sayfa ${doc.getNumberOfPages()}`, pageWidth - margin - 10, margin -5 );
          doc.setFontSize(12);
        }
        
        setFontWithStyle("bold"); 
        const questionNumberText = `Soru ${index + 1}:`;
        doc.text(questionNumberText, margin, yPosition);
        
        setFontWithStyle("normal"); 
        const questionXOffset = margin + doc.getTextWidth(questionNumberText) + 1;
        const questionContentWidth = pageWidth - questionXOffset - margin;
        const questionLines = doc.splitTextToSize(question.question, questionContentWidth);
        doc.text(questionLines, questionXOffset , yPosition); 
        yPosition += questionLines.length * lineHeight;


        if (question.subtopic) {
          yPosition += optionSpacing / 2.5;
          setFontWithStyle("italic"); 
          doc.setFontSize(10);
          const subtopicText = `Alt Konu: ${question.subtopic}`;
          const subtopicLines = doc.splitTextToSize(subtopicText, pageWidth - margin * 2);
          doc.text(subtopicLines, margin, yPosition);
          yPosition += subtopicLines.length * (lineHeight - 1.5) ; 
          doc.setFontSize(12);
          setFontWithStyle("normal"); 
          yPosition += optionSpacing / 2;
        } else {
          yPosition += optionSpacing * 0.8;
        }
        
        setFontWithStyle("normal");
        question.options.forEach((option, optIndex) => {
          if (yPosition + lineHeight > pageHeight - margin) { 
            doc.addPage();
            yPosition = margin;
            doc.setFontSize(10);
            setFontWithStyle("normal");
            doc.text(`Sayfa ${doc.getNumberOfPages()}`, pageWidth - margin - 10, margin - 5);
            doc.setFontSize(12);
          }
          setFontWithStyle("normal");
          const optionLabel = `${String.fromCharCode(65 + optIndex)}) `;
          const optionXOffset = margin + 7;
          const optionTextWidth = pageWidth - optionXOffset - margin - doc.getTextWidth(optionLabel);
          const optionTextLines = doc.splitTextToSize(option, optionTextWidth);
          
          doc.text(optionLabel, optionXOffset, yPosition); 
          doc.text(optionTextLines, optionXOffset + doc.getTextWidth(optionLabel), yPosition);
          yPosition += optionTextLines.length * lineHeight;
        });
        yPosition += questionSpacing;
      });

      const safeFilename = (pdfSourceFilename ? pdfSourceFilename.replace(/\.pdf$/i, '').replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s_.-]/gi, '_') : 'sınav') + '_quiz.pdf';
      doc.save(safeFilename);
    } catch (error) {
      console.error("PDF oluşturulurken hata:", error);
      alert(`PDF oluşturulurken bir hata oluştu: ${(error as Error).message}. Lütfen konsolu kontrol edin.`);
    }
  };


  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8 text-center">
        <i className="fas fa-box-open text-5xl mb-6 text-primary-500 dark:text-primary-400"></i>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Sınav Yüklenemedi</p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Görüntülenecek soru bulunamadı. Lütfen geri dönüp tekrar deneyin.</p>
        <button
            onClick={handleCancelQuiz}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-md font-medium flex items-center"
        >
            <i className="fas fa-arrow-left mr-2"></i> Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-secondary-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="p-4 sm:p-5 border-b border-gray-200 dark:border-secondary-700 sticky top-0 bg-white dark:bg-secondary-900 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
                <button
                    onClick={handleCancelQuiz}
                    className="flex items-center text-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Sınavdan Çık"
                    aria-label="Sınavdan çık ve ana sayfaya dön"
                >
                    <i className="fas fa-chevron-left mr-2 text-xl"></i> 
                    <span className="font-medium">Sınav</span>
                </button>
            </div>
          
            <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                    onClick={handleDownloadPdf}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-secondary-600 rounded-md transition-colors text-sm font-medium flex items-center shadow-sm"
                    title="Sınavı PDF Olarak İndir"
                    aria-label="Sınavı PDF olarak indir"
                >
                    <i className="fas fa-file-pdf mr-2 text-red-500 dark:text-red-400"></i>
                    <span className="hidden sm:inline">PDF İndir</span>
                </button>
                {isTimerEnabled && (
                    <div className={`text-sm font-medium p-1.5 px-3 rounded-md flex items-center shadow-sm ${remainingTime <= 60 ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-500/50' : 'bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300'}`}>
                        <i className="far fa-clock mr-2"></i>
                        <span>{formatTime(remainingTime)}</span>
                    </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-secondary-700 p-1.5 px-3 rounded-md shadow-sm">
                {answeredCount} / {totalQuestions} yanıtlandı
                </div>
            </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${Math.round(progressPercentage)}% tamamlandı`}
          ></div>
        </div>
      </header>

      {/* Questions List */}
      <main id="quiz-main-content" className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0 relative">
        {questions.map((question, index) => {
          const questionId = `question-${question.id}`;
          return (
            <section key={question.id} aria-labelledby={`${questionId}-text`} className="bg-white dark:bg-secondary-800 p-5 sm:p-6 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-secondary-700/50">
              <div className="flex items-start justify-between mb-3.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 px-2.5 py-1 rounded-full">
                  Soru {index + 1} / {totalQuestions}
                </h2>
                {question.subtopic && (
                  <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2.5 py-1 rounded-full font-medium">
                    <i className="fas fa-tags mr-1.5 opacity-70"></i>{question.subtopic}
                  </span>
                )}
              </div>

              <p id={`${questionId}-text`} className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100 mb-5 leading-relaxed">
                {question.question}
              </p>

              <div role="radiogroup" aria-labelledby={`${questionId}-text`} className="space-y-3">
                {question.options.map((option, optIndex) => {
                  const isSelected = answers[question.id] === optIndex;
                  const optionInputId = `${question.id}-option-${optIndex}`;
                  return (
                    <label
                      key={optionInputId}
                      htmlFor={optionInputId}
                      className={`flex items-center p-3.5 border-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-[1.01] focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-secondary-800 focus-within:ring-blue-500 dark:focus-within:ring-blue-400
                                  ${isSelected
                                      ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-500 text-white shadow-md'
                                      : 'bg-gray-50 dark:bg-secondary-700/80 border-gray-300 dark:border-secondary-600 hover:border-blue-400 dark:hover:border-blue-500/70 text-gray-700 dark:text-gray-300'
                                  }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mr-3 flex items-center justify-center transition-colors
                                        ${isSelected ? 'border-blue-300 bg-blue-400' : 'border-gray-400 dark:border-gray-500 group-hover:border-blue-400'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </span>
                      <input
                        type="radio"
                        id={optionInputId}
                        name={`question-${question.id}`} 
                        value={optIndex}
                        checked={isSelected}
                        onChange={() => handleOptionChange(question.id, optIndex)}
                        className="sr-only"
                        aria-label={`Seçenek ${optIndex + 1}: ${option}`}
                      />
                      <span className="text-sm sm:text-base flex-grow min-w-0 break-words">{option}</span>
                       {isSelected && <i className="fas fa-check-circle ml-auto text-blue-200 text-lg"></i>}
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className="mt-8 mb-4 pt-4 border-t border-gray-200 dark:border-secondary-700/50">
            <button
                onClick={() => handleSubmit(false)}
                disabled={totalQuestions === 0} 
                className="w-full px-6 py-3.5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-70 text-base flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Sınavı Bitir ve Sonuçları Gör"
            >
                Sınavı Bitir <i className="fas fa-check-circle ml-2 text-lg"></i>
            </button>
        </div>
      </main>
    </div>
  );
};

export default React.memo(QuizView);