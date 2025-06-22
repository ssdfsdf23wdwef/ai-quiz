
import React, { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { getContainerClasses, getTextClasses, getButtonClasses } from '../utils/themeUtils';

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
    selectionGuidance = "Sınavınız için odaklanmak istediğiniz zayıf olduğunuz konuları listeden seçin.";
    cancelButtonText = "İptal Et (Varsayılanla Oluştur)";
    if (allAvailableSubtopics.length > 0) {
      selectionGuidance += ` (${selected.length} / ${allAvailableSubtopics.length} zayıf konu seçili)`;
    }
  } else { // pdf_scan
    selectionGuidance = "Sınavınız için odaklanmak istediğiniz alt konuları listeden seçin. İstemediğiniz konuların seçimini kaldırabilirsiniz.";
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
    <div className={`w-full max-w-4xl mx-auto ${getContainerClasses(theme)}`}>
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${getTextClasses(theme, 'primary')}`}>
              <i className={`fas ${selectionContext === 'weak_topics' ? 'fa-target' : 'fa-list-check'} mr-3 text-primary-500`}></i>
              {pageTitle}
            </h2>
            <p className={`text-sm sm:text-base ${getTextClasses(theme, 'secondary')}`}>
              {selectionGuidance}
            </p>
          </div>
          <button 
            onClick={onCancel} 
            className={`shrink-0 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 touch-target ${
              theme === 'dark' 
                ? 'bg-secondary-700 text-gray-300 hover:bg-secondary-600 border border-secondary-600 focus:ring-secondary-500' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 focus:ring-gray-400'
            }`}
            title={cancelButtonText}
          >
            <i className="fas fa-times"></i>
            <span className="hidden sm:inline">{cancelButtonText}</span>
            <span className="sm:hidden">İptal</span>
          </button>
        </div>
        
        {/* Statistics Bar */}
        {allAvailableSubtopics.length > 0 && (
          <div className={`mt-4 p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-secondary-800/50 border-secondary-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-2 ${getTextClasses(theme, 'primary')}`}>
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <span className="font-medium">Seçili: {selected.length}</span>
                </div>
                <div className={`flex items-center gap-2 ${getTextClasses(theme, 'secondary')}`}>
                  <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                  <span>Toplam: {allAvailableSubtopics.length}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className={`flex-1 sm:w-32 h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-secondary-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                    style={{ width: `${allAvailableSubtopics.length ? (selected.length / allAvailableSubtopics.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${getTextClasses(theme, 'primary')}`}>
                  {allAvailableSubtopics.length ? Math.round((selected.length / allAvailableSubtopics.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {allAvailableSubtopics.length === 0 ? (
        <div className={`text-center py-12 px-6 rounded-xl border-2 border-dashed ${
          theme === 'dark' 
            ? 'border-secondary-600 bg-secondary-800/30' 
            : 'border-gray-300 bg-gray-50'
        }`}>
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-secondary-700 text-gray-400' : 'bg-gray-200 text-gray-500'
          }`}>
            <i className="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${getTextClasses(theme, 'primary')}`}>
            Konu Bulunamadı
          </h3>
          <p className={`${getTextClasses(theme, 'secondary')} max-w-md mx-auto`}>
            {selectionContext === 'weak_topics' 
              ? "Bu ders için görüntülenecek zayıf konu bulunmuyor." 
              : "Bu PDF'ten alt konu çıkarılamadı veya PDF içeriği yetersiz."
            } İptal edip {selectionContext === 'weak_topics' ? 'varsayılan zayıf konu ayarlarıyla' : 'tüm metinden'} sınav oluşturmayı deneyebilirsiniz.
          </p>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {selectionContext === 'pdf_scan' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${
                      theme === 'dark' ? 'bg-teal-400' : 'bg-teal-500'
                    }`}></div>
                    <span className={getTextClasses(theme, 'secondary')}>Yeni Konular</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${
                      theme === 'dark' ? 'bg-sky-400' : 'bg-sky-500'
                    }`}></div>
                    <span className={getTextClasses(theme, 'secondary')}>Mevcut Konular</span>
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={handleSelectAll}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 touch-target ${
                theme === 'dark' 
                  ? 'bg-secondary-700 text-gray-200 hover:bg-secondary-600 border border-secondary-600 focus:ring-secondary-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 focus:ring-gray-400'
              }`}
            >
              <i className={`fas ${selected.length === allAvailableSubtopics.length ? 'fa-times-circle' : 'fa-check-double'}`}></i>
              {selected.length === allAvailableSubtopics.length ? 'Tüm Seçimi Kaldır' : 'Tümünü Seç'}
            </button>
          </div>
          
          {/* Topics List */}
          <div className="mb-8">
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-subtopic">
              <div className="space-y-2">
                {allAvailableSubtopics.map((subtopic, index) => {
                    const topicDetails = getTopicTypeDetails(subtopic);
                    const isSelected = selected.includes(subtopic);
                    const checkboxId = `subtopic-checkbox-${index}`;
                    const isDark = theme === 'dark';
                    
                    const getListItemClasses = () => {
                      let itemClasses = 'group relative flex items-center p-3 sm:p-4 rounded-lg transition-all duration-200 border cursor-pointer hover:shadow-md focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-50 ';
                      
                      if (isSelected) {
                        itemClasses += isDark 
                          ? 'bg-primary-900/40 border-primary-500 shadow-lg shadow-primary-500/20' 
                          : 'bg-primary-50 border-primary-400 shadow-lg shadow-primary-500/10';
                      } else {
                        itemClasses += isDark 
                          ? 'bg-secondary-800/30 border-secondary-600 hover:border-primary-400/70 hover:bg-secondary-700/50' 
                          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50';
                      }
                      
                      return itemClasses;
                    };
                    
                  return (
                    <label
                      key={`${index}-${subtopic.replace(/\s+/g, '-')}`}
                      htmlFor={checkboxId}
                      className={getListItemClasses()}
                    >
                      {/* Checkbox */}
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSubtopic(subtopic)}
                        className="h-5 w-5 rounded border-2 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shrink-0 checked:bg-primary-500 checked:border-primary-500 mr-4"
                      />
                      
                      {/* Topic Content */}
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <span className={`block text-sm sm:text-base font-medium leading-relaxed break-words ${
                            isSelected 
                              ? (isDark ? 'text-primary-100' : 'text-primary-700')
                              : (isDark ? 'text-gray-100' : 'text-gray-800')
                          }`}>
                            {subtopic}
                          </span>
                        </div>
                        
                        {/* Topic Type Badge */}
                        {topicDetails && topicDetails.label && (
                          <div className={`ml-3 text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${topicDetails.colorClasses}`}>
                            {topicDetails.label}
                          </div>
                        )}
                      </div>
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="ml-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-sm shrink-0">
                          <i className="fas fa-check text-white text-xs"></i>
                        </div>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className={`flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-3 pt-6 border-t ${
        theme === 'dark' ? 'border-secondary-700' : 'border-gray-200'
      }`}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled()} 
          className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed touch-target transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${getButtonClasses(theme, 'primary')}`}
          aria-label="Seçili Konularla Devam Et"
        >
          <span>Devam Et</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <style>{`
        .custom-scrollbar-subtopic::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-subtopic::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'};
          border-radius: 10px;
        }
        .custom-scrollbar-subtopic::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(156, 163, 175, 0.5)' : 'rgba(107, 114, 128, 0.5)'};
          border-radius: 10px;
        }
        .custom-scrollbar-subtopic::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(156, 163, 175, 0.7)' : 'rgba(107, 114, 128, 0.7)'};
        }
        .custom-scrollbar-subtopic {
          scrollbar-width: thin;
          scrollbar-color: ${theme === 'dark' ? 'rgba(156, 163, 175, 0.5) rgba(55, 65, 81, 0.5)' : 'rgba(107, 114, 128, 0.5) rgba(243, 244, 246, 0.5)'};
        }
        
        /* Touch feedback */
        @media (hover: none) and (pointer: coarse) {
          .group:active {
            transform: scale(0.99);
          }
        }
        
        /* Smooth animations */
        .group {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* List item hover effects */
        .group:hover {
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
};

export default React.memo(SubtopicSelector);
