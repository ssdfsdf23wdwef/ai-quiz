
import React, { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SubtopicSelectorProps {
  newSubtopics: string[];
  confirmedExistingSubtopics: string[];
  onConfirm: (selectedSubtopics: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
  selectionContext?: 'pdf_scan' | 'weak_topics';
}

const SubtopicSelector: React.FC<SubtopicSelectorProps> = ({
  newSubtopics,
  confirmedExistingSubtopics,
  onConfirm,
  onCancel,
  isLoading,
  selectionContext = 'pdf_scan',
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
    if (newSubtopics.includes(topic)) {
      return { label: 'Yeni', colorClasses: 'bg-teal-100 dark:bg-teal-700/30 text-teal-700 dark:text-teal-300' };
    }
    if (confirmedExistingSubtopics.includes(topic)) {
      return { label: 'Mevcut', colorClasses: 'bg-sky-100 dark:bg-sky-700/30 text-sky-700 dark:text-sky-300' };
    }
    return null;
  };


  return (
    <div className="w-full max-w-2xl p-6 md:p-8 bg-white dark:bg-secondary-800 rounded-xl shadow-2xl text-gray-700 dark:text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{pageTitle}</h2>
        <button 
            onClick={onCancel} 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center"
            title={cancelButtonText}
          >
            <i className="fas fa-times mr-1.5"></i> {cancelButtonText}
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
        {selectionGuidance}
      </p>

      {allAvailableSubtopics.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          {selectionContext === 'weak_topics' 
            ? "Bu ders için görüntülenecek zayıf konu bulunmuyor." 
            : "Bu PDF'ten alt konu çıkarılamadı veya PDF içeriği yetersiz."
          } İptal edip {selectionContext === 'weak_topics' ? 'varsayılan zayıf konu ayarlarıyla' : 'tüm metinden'} sınav oluşturmayı deneyebilirsiniz.
        </p>
      ) : (
        <>
          <div className="mb-4 text-right">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors shadow-sm"
            >
              {selected.length === allAvailableSubtopics.length ? 'Tüm Seçimi Kaldır' : 'Tümünü Seç'}
            </button>
          </div>
          <div className="max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {allAvailableSubtopics.map((subtopic, index) => {
                const topicDetails = getTopicTypeDetails(subtopic);
                const isSelected = selected.includes(subtopic);
                const checkboxId = `subtopic-checkbox-${index}`;
                const textId = `subtopic-text-${index}`;
              return (
                <label
                  key={`${index}-${subtopic.replace(/\s+/g, '-')}`}
                  htmlFor={checkboxId}
                  className={`block p-4 rounded-lg transition-all duration-150 ease-in-out border
                              ${isSelected
                                  ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-500 dark:border-primary-600 ring-2 ring-primary-500 dark:ring-primary-600 shadow-md'
                                  : 'bg-white dark:bg-secondary-700/80 border-gray-300 dark:border-secondary-600 hover:border-primary-400 dark:hover:border-primary-500/70 hover:bg-gray-50 dark:hover:bg-secondary-700/90'
                              } cursor-pointer`}
                >
                  <div className="flex items-center">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSubtopic(subtopic)}
                      className="form-checkbox h-5 w-5 text-primary-600 dark:text-primary-400 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-secondary-800 mr-4 shrink-0 rounded bg-gray-200 dark:bg-secondary-600 border-gray-400 dark:border-secondary-500"
                      aria-labelledby={textId}
                    />
                    <div className="flex-grow min-w-0">
                      <span 
                        id={textId}
                        className={`text-base font-medium break-words ${isSelected ? 'text-primary-700 dark:text-primary-100' : 'text-gray-800 dark:text-gray-100'}`}
                      >
                        {subtopic}
                      </span>
                    </div>
                    {topicDetails && topicDetails.label && (
                      <span className={`ml-3 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${topicDetails.colorClasses}`}>
                        {topicDetails.label}
                      </span>
                    )}
                    {isSelected && <i className="fas fa-check-circle ml-3 text-primary-600 dark:text-primary-400 text-lg"></i>}
                  </div>
                </label>
              )
            })}
          </div>
        </>
      )}

      <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-300 dark:border-secondary-700">
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled()} 
          className="px-8 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
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
