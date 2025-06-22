
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
      {/* Header */}
      <header className={`p-4 sm:p-5 border-b sticky top-0 z-20 shadow-sm ${themeClasses.border.primary} ${themeClasses.bg.primary}`}>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
                <button
                    onClick={handleCancelQuiz}
                    className={`flex items-center text-lg transition-colors ${themeClasses.text.secondary} hover:${themeClasses.text.primary.replace('text-', 'hover:text-')}`}
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
                    className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium flex items-center shadow-sm ${themeClasses.bg.button.secondary} ${themeClasses.text.secondary}`}
                    title="Sınavı PDF Olarak İndir"
                    aria-label="Sınavı PDF olarak indir"
                >
                    <i className={`fas fa-file-pdf mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}></i>
                    <span className="hidden sm:inline">PDF İndir</span>
                </button>
                {isTimerEnabled && (
                    <div className={`text-sm font-medium p-1.5 px-3 rounded-md flex items-center shadow-sm ${
                      remainingTime <= 60 
                        ? (theme === 'dark' 
                            ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50' 
                            : 'bg-red-100 text-red-600 ring-1 ring-red-300')
                        : (theme === 'dark' 
                            ? 'bg-secondary-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-700')
                    }`}>
                        <i className="far fa-clock mr-2"></i>
                        <span>{formatTime(remainingTime)}</span>
                    </div>
                )}
                <div className={`text-sm font-medium p-1.5 px-3 rounded-md shadow-sm ${
                  theme === 'dark' 
                    ? 'text-gray-400 bg-secondary-700' 
                    : 'text-gray-500 bg-gray-100'
                }`}>
                {answeredCount} / {totalQuestions} yanıtlandı
                </div>
            </div>
        </div>
        <div className={`w-full rounded-full h-1.5 ${theme === 'dark' ? 'bg-secondary-700' : 'bg-gray-200'}`}>
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
          const isDark = theme === 'dark';
          return (
            <section key={question.id} aria-labelledby={`${questionId}-text`} className={`p-5 sm:p-6 rounded-xl shadow-lg ring-1 ${
              isDark 
                ? 'bg-secondary-800 ring-secondary-700/50' 
                : 'bg-white ring-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-3.5">
                <h2 className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  isDark 
                    ? 'text-blue-400 bg-blue-500/10' 
                    : 'text-blue-600 bg-blue-100'
                }`}>
                  Soru {index + 1} / {totalQuestions}
                </h2>
                {question.subtopic && (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    isDark 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-purple-600 bg-purple-100'
                  }`}>
                    <i className="fas fa-tags mr-1.5 opacity-70"></i>{question.subtopic}
                  </span>
                )}
              </div>

              <p id={`${questionId}-text`} className={`text-base sm:text-lg font-medium mb-5 leading-relaxed ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {question.question}
              </p>

              <div role="radiogroup" aria-labelledby={`${questionId}-text`} className="space-y-3">
                {question.options.map((option, optIndex) => {
                  const isSelected = answers[question.id] === optIndex;
                  const optionInputId = `${question.id}-option-${optIndex}`;
                  
                  const getOptionClasses = () => {
                    let optionClasses = 'flex items-center p-3.5 border-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-[1.01] ';
                    
                    if (isSelected) {
                      optionClasses += isDark 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                        : 'bg-blue-500 border-blue-500 text-white shadow-md';
                    } else {
                      optionClasses += isDark 
                        ? 'bg-secondary-700/80 border-secondary-600 hover:border-blue-500/70 text-gray-300' 
                        : 'bg-gray-50 border-gray-300 hover:border-blue-400 text-gray-700';
                    }
                    
                    return optionClasses;
                  };
                  
                  const getFocusClasses = () => {
                    const baseClasses = 'focus-within:ring-2 focus-within:ring-offset-2 ';
                    const offsetClasses = isDark 
                      ? 'focus-within:ring-offset-secondary-800' 
                      : 'focus-within:ring-offset-white';
                    const ringClasses = isDark 
                      ? 'focus-within:ring-blue-400' 
                      : 'focus-within:ring-blue-500';
                    
                    return baseClasses + offsetClasses + ' ' + ringClasses;
                  };
                  
                  return (
                    <label
                      key={optionInputId}
                      htmlFor={optionInputId}
                      className={`${getOptionClasses()} ${getFocusClasses()}`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mr-3 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'border-blue-300 bg-blue-400' 
                          : (isDark 
                              ? 'border-gray-500 group-hover:border-blue-400' 
                              : 'border-gray-400 group-hover:border-blue-400')
                      }`}>
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

        <div className={`mt-8 mb-4 pt-4 border-t ${theme === 'dark' ? 'border-secondary-700/50' : 'border-gray-200'}`}>
            <button
                onClick={() => handleSubmit(false)}
                disabled={totalQuestions === 0} 
                className={`w-full px-6 py-3.5 text-white rounded-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-70 text-base flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed ${
                  theme === 'dark' 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                }`}
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