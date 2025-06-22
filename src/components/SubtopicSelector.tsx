
import React, { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { getThemeClasses } from '../utils/themeUtils';

interface SubtopicSelectorProps {
  newSubtopics: string[];
  confirmedExistingSubtopics: string[];
  onConfirm: (selectedSubtopics: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
  selectionContext?: 'pdf_scan' | 'weak_topics';
  theme?: string;
}

const SubtopicSelector: React.FC<SubtopicSelectorProps> = ({
  newSubtopics,
  confirmedExistingSubtopics,
  onConfirm,
  onCancel,
  isLoading,
  selectionContext = 'pdf_scan',
  theme,
}) => {
  const themeClasses = getThemeClasses(theme);
  const allAvailableSubtopics = useMemo(() => {
    if (selectionContext === 'weak_topics') {
      return Array.from(new Set([...newSubtopics]));
    }
    return Array.from(new Set([...newSubtopics, ...confirmedExistingSubtopics]));
  }, [newSubtopics, confirmedExistingSubtopics, selectionContext]);
  
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (allAvailableSubtopics.length > 0) {
      const halfLength = Math.ceil(allAvailableSubtopics.length / 2);
      setSelected(allAvailableSubtopics.slice(0, halfLength));
    } else {
      setSelected([]);
    }
  }, [allAvailableSubtopics]);

  const handleToggleSubtopic = (subtopic: string) => {
    setSelected(prevSelected =>
      prevSelected.includes(subtopic)
        ? prevSelected.filter(s => s !== subtopic)
        : [...prevSelected, subtopic]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === allAvailableSubtopics.length) {
      setSelected([]); 
    } else {
      setSelected([...allAvailableSubtopics]); 
    }
  };

  const handleSubmit = () => {
    onConfirm(selected);
  };
  
  const isSubmitDisabled = () => {
    return false; // Allow submitting with zero selected topics
  };

  if (isLoading) {
    return <LoadingSpinner text="Alt konular işleniyor..." />;
  }

  const pageTitle = selectionContext === 'weak_topics' ? "Zayıf Konuları Seçin" : "Alt Konuları Seçin";
  let selectionGuidance: string;
  let cancelButtonText: string;

  if (selectionContext === 'weak_topics') {
    selectionGuidance = "Sınavınız için odaklanmak istediğiniz zayıf olduğunuz konuları seçin.";
    cancelButtonText = "İptal Et (Varsayılanla Oluştur)";
    if (allAvailableSubtopics.length > 0) {
      selectionGuidance += ` (${selected.length} / ${allAvailableSubtopics.length} zayıf konu seçili)`;
    }
  } else { // pdf_scan
    selectionGuidance = "Sınavınız için odaklanmak istediğiniz alt konuları seçin. İstemediğiniz konuların seçimini kaldırabilirsiniz.";
    cancelButtonText = "İptal Et (Tüm Metinden Oluştur)";
    if (allAvailableSubtopics.length > 0) {
      selectionGuidance += ` (${selected.length} / ${allAvailableSubtopics.length} seçili)`;
    }
  }
  
  const getTopicTypeDetails = (topic: string): { label: string; colorClasses: string } | null => {
    if (selectionContext !== 'pdf_scan') return null;
    const isDark = theme === 'dark';
    
    if (newSubtopics.includes(topic)) {
      return { 
        label: 'Yeni', 
        colorClasses: isDark 
          ? 'bg-teal-700/30 text-teal-300' 
          : 'bg-teal-100 text-teal-700' 
      };
    }
    if (confirmedExistingSubtopics.includes(topic)) {
      return { 
        label: 'Mevcut', 
        colorClasses: isDark 
          ? 'bg-sky-700/30 text-sky-300' 
          : 'bg-sky-100 text-sky-700' 
      };
    }
    return null;
  };


  return (
    <div className={`w-full max-w-2xl p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl ${themeClasses.bg.card} ${themeClasses.text.secondary}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h2 className={`text-xl sm:text-2xl font-semibold ${themeClasses.text.primary}`}>{pageTitle}</h2>
        <button 
            onClick={onCancel} 
            className={`text-sm transition-colors flex items-center touch-target ${themeClasses.text.muted} hover:${themeClasses.text.primary.replace('text-', 'hover:text-')}`}
            title={cancelButtonText}
          >
            <i className="fas fa-times mr-1.5"></i> 
            <span className="hidden sm:inline">{cancelButtonText}</span>
            <span className="sm:hidden">İptal</span>
        </button>
      </div>
      
      <p className={`mb-4 sm:mb-6 text-sm ${themeClasses.text.tertiary}`}>
        {selectionGuidance}
      </p>

      {allAvailableSubtopics.length === 0 ? (
        <p className={`text-center py-4 ${themeClasses.text.muted}`}>
          {selectionContext === 'weak_topics' 
            ? "Bu ders için görüntülenecek zayıf konu bulunmuyor." 
            : "Bu PDF'ten alt konu çıkarılamadı veya PDF içeriği yetersiz."
          } İptal edip {selectionContext === 'weak_topics' ? 'varsayılan zayıf konu ayarlarıyla' : 'tüm metinden'} sınav oluşturmayı deneyebilirsiniz.
        </p>
      ) : (
        <>
          <div className="mb-4 text-center sm:text-right">
            <button
              onClick={handleSelectAll}
              className={`px-4 py-2 text-sm rounded-md transition-colors shadow-sm touch-target ${
                theme === 'dark' 
                  ? 'bg-secondary-700 text-gray-200 hover:bg-secondary-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selected.length === allAvailableSubtopics.length ? 'Tüm Seçimi Kaldır' : 'Tümünü Seç'}
            </button>
          </div>
          <div className="max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar space-y-3 mobile-scroll">
            {allAvailableSubtopics.map((subtopic, index) => {
                const topicDetails = getTopicTypeDetails(subtopic);
                const isSelected = selected.includes(subtopic);
                const checkboxId = `subtopic-checkbox-${index}`;
                const textId = `subtopic-text-${index}`;
                const isDark = theme === 'dark';
                
                const getCardClasses = () => {
                  let cardClasses = 'block p-4 rounded-lg transition-all duration-150 ease-in-out border cursor-pointer ';
                  
                  if (isSelected) {
                    cardClasses += isDark 
                      ? 'bg-primary-900/40 border-primary-600 ring-2 ring-primary-600 shadow-md' 
                      : 'bg-primary-50 border-primary-500 ring-2 ring-primary-500 shadow-md';
                  } else {
                    cardClasses += isDark 
                      ? 'bg-secondary-700/80 border-secondary-600 hover:border-primary-500/70 hover:bg-secondary-700/90' 
                      : 'bg-white border-gray-300 hover:border-primary-400 hover:bg-gray-50';
                  }
                  
                  return cardClasses;
                };
                
                const getCheckboxClasses = () => {
                  const baseClasses = 'form-checkbox h-5 w-5 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mr-4 shrink-0 rounded ';
                  const themeClasses = isDark 
                    ? 'text-primary-400 focus:ring-offset-secondary-800 bg-secondary-600 border-secondary-500' 
                    : 'text-primary-600 focus:ring-offset-white bg-gray-200 border-gray-400';
                  
                  return baseClasses + themeClasses;
                };
                
                const getTextClasses = () => {
                  let textClasses = 'text-base font-medium break-words ';
                  
                  if (isSelected) {
                    textClasses += isDark ? 'text-primary-100' : 'text-primary-700';
                  } else {
                    textClasses += isDark ? 'text-gray-100' : 'text-gray-800';
                  }
                  
                  return textClasses;
                };
                
              return (
                <label
                  key={`${index}-${subtopic.replace(/\s+/g, '-')}`}
                  htmlFor={checkboxId}
                  className={getCardClasses()}
                >
                  <div className="flex items-center">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSubtopic(subtopic)}
                      className={getCheckboxClasses()}
                      aria-labelledby={textId}
                    />
                    <div className="flex-grow min-w-0">
                      <span 
                        id={textId}
                        className={getTextClasses()}
                      >
                        {subtopic}
                      </span>
                    </div>
                    {topicDetails && topicDetails.label && (
                      <span className={`ml-3 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${topicDetails.colorClasses}`}>
                        {topicDetails.label}
                      </span>
                    )}
                    {isSelected && <i className={`fas fa-check-circle ml-3 text-lg ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}></i>}
                  </div>
                </label>
              )
            })}
          </div>
        </>
      )}

      <div className={`flex justify-center sm:justify-end items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${theme === 'dark' ? 'border-secondary-700' : 'border-gray-300'}`}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled()} 
          className={`px-6 sm:px-8 py-3 text-white rounded-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed touch-target ${
            theme === 'dark' 
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
              : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
          }`}
          aria-label="Seçili Konularla Devam Et"
        >
          Devam Et <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--scrollbar-track-color);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-color);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
        }
      `}</style>
    </div>
  );
};

export default React.memo(SubtopicSelector);
