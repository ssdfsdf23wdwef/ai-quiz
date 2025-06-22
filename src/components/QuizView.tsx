import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QuizQuestion } from '../types';
import jsPDF from 'jspdf';
import { getThemeClasses } from '../utils/themeUtils';

interface QuizViewProps {
  questions: QuizQuestion[];
  onSubmitQuiz: (answers: Record<string, number>) => void;
  onCancel: () => void;
  isTimerEnabled?: boolean;
  totalTimeInSeconds?: number;
  pdfSourceFilename?: string; 
  theme?: string;
}

const QuizView: React.FC<QuizViewProps> = ({ 
  questions, 
  onSubmitQuiz, 
  onCancel,
  isTimerEnabled = false,
  totalTimeInSeconds = 0,
  pdfSourceFilename,
  theme,
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remainingTime, setRemainingTime] = useState<number>(totalTimeInSeconds);
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const timerRef = useRef<number | null>(null);
  const fontDataRef = useRef<string | null>(null);
  
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    const loadFont = async () => {
      try {
        const response = await fetch('./fonts/NotoSans-Regular.ttf');
        if (!response.ok) {
          // Font file not found, using default font
          return;
        }
        const fontBuffer = await response.arrayBuffer();
        
        // Check if font file is valid
        if (fontBuffer.byteLength < 1000) {
          // Font file is too small, probably a placeholder
          return;
        }

        let binary = '';
        const bytes = new Uint8Array(fontBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        fontDataRef.current = btoa(binary);
        console.log("NotoSans fontu başarıyla yüklendi ve base64'e çevrildi.");
      } catch (error) {
        // Font loading failed, using default font
        fontDataRef.current = null;
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

      // Attempt to use custom font only if it was loaded successfully
      if (fontDataRef.current) {
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
        }
      } else {
        // Font not loaded, use default
        fontNameToUse = "Helvetica";
        doc.setFont(fontNameToUse, "normal");
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

  const toggleExplanation = (questionId: string) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (!questions || questions.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${themeClasses.text.muted}`}>
        <i className={`fas fa-box-open text-5xl mb-6 ${themeClasses.text.accent}`}></i>
        <p className={`text-xl font-semibold mb-2 ${themeClasses.text.secondary}`}>Sınav Yüklenemedi</p>
        <p className={`mb-8 ${themeClasses.text.muted}`}>Görüntülenecek soru bulunamadı. Lütfen geri dönüp tekrar deneyin.</p>
        <button
            onClick={handleCancelQuiz}
            className={`px-6 py-3 text-white rounded-lg transition-colors shadow-md font-medium flex items-center ${themeClasses.bg.button.primary}`}
        >
            <i className="fas fa-arrow-left mr-2"></i> Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col ${themeClasses.bg.secondary} ${themeClasses.text.secondary}`}>
      {/* Compact Header */}
      <header className={`p-3 sm:p-4 border-b sticky top-0 z-20 backdrop-blur-sm ${themeClasses.border.primary} ${themeClasses.bg.primary}/95`}>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center">
            <button
              onClick={handleCancelQuiz}
              className={`flex items-center text-sm sm:text-base transition-colors touch-target rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.text.secondary}`}
              title="Sınavdan Çık"
              aria-label="Sınavdan çık ve ana sayfaya dön"
            >
              <i className="fas fa-times mr-1.5 text-base"></i> 
              <span className="font-medium">Çıkış</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all text-xs sm:text-sm font-medium flex items-center shadow-sm touch-target hover:shadow-md ${themeClasses.bg.button.secondary} ${themeClasses.text.secondary}`}
              title="PDF İndir"
              aria-label="Sınavı PDF olarak indir"
            >
              <i className={`fas fa-download mr-1 sm:mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}></i>
              <span className="hidden sm:inline">PDF</span>
            </button>
            
            {isTimerEnabled && (
              <div className={`text-xs sm:text-sm font-mono font-bold p-1.5 px-2 sm:px-3 rounded-lg flex items-center shadow-sm ${
                remainingTime <= 60 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
              }`}>
                <i className="far fa-clock mr-1 sm:mr-2"></i>
                <span>{formatTime(remainingTime)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
            <span className={`font-medium ${themeClasses.text.primary}`}>
              İlerleme: {answeredCount}/{totalQuestions}
            </span>
            <span className={`font-medium ${themeClasses.text.secondary}`}>
              %{Math.round(progressPercentage)}
            </span>
          </div>
          <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${Math.round(progressPercentage)}% tamamlandı`}
            ></div>
          </div>
        </div>
      </header>

      {/* Questions List */}
      <main className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
        {questions.map((question, index) => {
          const questionId = `question-${question.id}`;
          const isDark = theme === 'dark';
          const isAnswered = answers[question.id] !== undefined;
          
          return (
            <section 
              key={question.id} 
              aria-labelledby={`${questionId}-text`} 
              className={`relative rounded-xl border transition-all duration-200 ${
                isAnswered
                  ? (isDark 
                      ? 'bg-green-900/20 border-green-500/50 shadow-md' 
                      : 'bg-green-50 border-green-200 shadow-md')
                  : (isDark 
                      ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300')
              } hover:shadow-lg`}
            >
              {/* Question Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      isAnswered
                        ? 'bg-green-500 text-white'
                        : (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                    }`}>
                      {isAnswered ? <i className="fas fa-check"></i> : index + 1}
                    </span>
                    <span className={`text-xs font-medium ${themeClasses.text.secondary}`}>
                      Soru {index + 1} / {totalQuestions}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {question.subtopic && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-purple-600/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>
                        <i className="fas fa-tag mr-1"></i>
                        {question.subtopic}
                      </span>
                    )}
                    
                    {question.explanation && (
                      <button
                        onClick={() => toggleExplanation(question.id)}
                        className={`text-xs px-2 py-1 rounded-full transition-all touch-target ${
                          showExplanations[question.id]
                            ? (isDark ? 'bg-yellow-600/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                            : (isDark ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-100 text-gray-600')
                        } hover:scale-105`}
                        title={showExplanations[question.id] ? 'Açıklamayı Gizle' : 'Açıklamayı Göster'}
                      >
                        <i className={`fas ${showExplanations[question.id] ? 'fa-eye-slash' : 'fa-lightbulb'} mr-1`}></i>
                        {showExplanations[question.id] ? 'Gizle' : 'İpucu'}
                      </button>
                    )}
                  </div>
                </div>
                
                <h2 id={`${questionId}-text`} className={`text-sm sm:text-base font-medium leading-relaxed ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {question.question}
                </h2>
              </div>

              {/* Explanation Section */}
              {question.explanation && showExplanations[question.id] && (
                <div className={`p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 ${
                  isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <div className="flex items-start gap-2">
                    <i className={`fas fa-info-circle mt-0.5 text-sm ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}></i>
                    <div>
                      <h3 className={`font-medium text-xs mb-1 ${
                        isDark ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        Açıklama:
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="p-3 sm:p-4">
                <div role="radiogroup" aria-labelledby={`${questionId}-text`} className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answers[question.id] === optIndex;
                    const optionInputId = `${question.id}-option-${optIndex}`;
                    const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
                    
                    return (
                      <label
                        key={optionInputId}
                        htmlFor={optionInputId}
                        className={`group flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 touch-target ${
                          isSelected 
                            ? (isDark 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg transform scale-[1.02]' 
                                : 'bg-blue-500 border-blue-500 text-white shadow-lg transform scale-[1.02]')
                            : (isDark 
                                ? 'bg-gray-700/50 border-gray-600 hover:border-blue-400 text-gray-300 hover:bg-gray-700' 
                                : 'bg-gray-50 border-gray-300 hover:border-blue-400 text-gray-700 hover:bg-gray-100')
                        } hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50`}
                      >
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-3 text-xs font-bold ${
                          isSelected 
                            ? 'border-blue-200 bg-blue-400 text-white' 
                            : (isDark ? 'border-gray-500 text-gray-400' : 'border-gray-400 text-gray-600')
                        }`}>
                          {isSelected ? <i className="fas fa-check"></i> : optionLabel}
                        </div>
                        
                        <input
                          type="radio"
                          id={optionInputId}
                          name={`question-${question.id}`} 
                          value={optIndex}
                          checked={isSelected}
                          onChange={() => handleOptionChange(question.id, optIndex)}
                          className="sr-only"
                          aria-label={`Seçenek ${optionLabel}: ${option}`}
                        />
                        
                        <span className="text-xs sm:text-sm flex-grow min-w-0 break-words leading-relaxed">
                          {option}
                        </span>
                        
                        {isSelected && (
                          <i className="fas fa-check-circle ml-2 text-blue-200"></i>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        {/* Submit Button */}
        <div className="sticky bottom-0 pt-4 pb-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={totalQuestions === 0} 
            className={`w-full px-4 py-3 sm:py-4 text-white rounded-xl font-bold shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 text-sm sm:text-base flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed touch-target transition-all duration-200 ${
              answeredCount === totalQuestions
                ? (theme === 'dark' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 shadow-green-500/25' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:ring-green-500 shadow-green-500/25')
                : (theme === 'dark' 
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:ring-orange-500 shadow-orange-500/25' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:ring-orange-500 shadow-orange-500/25')
            } hover:shadow-2xl hover:transform hover:-translate-y-0.5`}
            aria-label="Sınavı Bitir ve Sonuçları Gör"
          >
            <span className="mr-2">
              {answeredCount === totalQuestions ? 'Sınavı Bitir' : `Eksik Sorularla Bitir (${totalQuestions - answeredCount} soru boş)`}
            </span>
            <i className={`fas ${answeredCount === totalQuestions ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-base sm:text-lg`}></i>
          </button>
        </div>
      </main>
    </div>
  );
};

export default React.memo(QuizView);