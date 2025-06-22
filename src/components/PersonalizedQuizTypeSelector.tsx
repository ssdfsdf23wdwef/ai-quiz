
import React, { useState, useMemo, useEffect } from 'react';
import { PersonalizedQuizType, LearningObjective } from '../types';

interface PersonalizedQuizTypeSelectorProps {
  learningObjectives: LearningObjective[];
  currentCourseId: string | null;
  onQuizTypeSelected: (quizType: PersonalizedQuizType) => void;
  onBack: () => void;
  theme?: string;
}

const PersonalizedQuizTypeSelector: React.FC<PersonalizedQuizTypeSelectorProps> = ({
  learningObjectives,
  currentCourseId,
  onQuizTypeSelected,
  onBack,
  theme,
}) => {
  const [selectedType, setSelectedType] = useState<PersonalizedQuizType | null>(null);

  const weakLearningObjectivesCount = useMemo(() => {
    if (!currentCourseId) return 0;
    return learningObjectives.filter(
      lo => lo.courseId === currentCourseId && (lo.status === 'failure' || lo.status === 'intermediate' || lo.status === 'pending')
    ).length;
  }, [learningObjectives, currentCourseId]);

  const courseHasAnyLOs = useMemo(() => {
    if (!currentCourseId) return false;
    return learningObjectives.some(lo => lo.courseId === currentCourseId);
  }, [learningObjectives, currentCourseId]);

  const quizTypes: Array<{ type: PersonalizedQuizType; title: string; description: string; icon: string; disabledText?: string }> = [
    {
      type: 'comprehensive',
      title: 'Kapsamlı Sınav',
      description: 'Hem zayıf olduğunuz konuları pekiştirin hem de belgedeki yeni konuları öğrenin. PDF yüklemeniz gerekecektir.',
      icon: 'fas fa-book-reader',
      disabledText: !courseHasAnyLOs 
        ? "Bu ders için henüz öğrenme hedefi bulunmuyor. Kapsamlı sınav oluşturabilmek için önce 'Yeni Konular' sınavı ile veya diğer sınavlardan dersinize öğrenme hedefleri eklenmelidir."
        : undefined,
    },
    {
      type: 'new_topics',
      title: 'Yeni Konular Sınavı',
      description: 'Yükleyeceğiniz PDF belgesinden tamamen yeni konular öğrenin ve test edin. Bu konular öğrenme hedeflerinize eklenecektir.',
      icon: 'fas fa-lightbulb',
    },
    {
      type: 'weak_topics',
      title: 'Zayıf Konular Sınavı',
      description: `Sadece bu dersteki mevcut zayıf öğrenme hedeflerinize odaklanın. ${weakLearningObjectivesCount > 0 ? '('+weakLearningObjectivesCount+' zayıf hedef bulundu)' : ''}. Belge yüklemeniz gerekmez.`,
      icon: 'fas fa-crosshairs',
      disabledText: weakLearningObjectivesCount === 0 ? 'Bu ders için zayıf konu bulunmuyor. Bu seçeneği kullanmak için önce bu derse ait sınavlarda bazı konularda düşük başarı elde etmelisiniz veya yeni konular eklemelisiniz.' : undefined,
    },
  ];
  
   useEffect(() => {
    const enabledTypes = quizTypes.filter(qt => !qt.disabledText);
    if (enabledTypes.length === 1 && selectedType !== enabledTypes[0].type) {
        // Otomatik seçimi kullanıcıya bırakmak daha iyi olabilir.
        // setSelectedType(enabledTypes[0].type); 
    }
     // Eğer mevcut seçili tip, yeni durum nedeniyle pasif hale geldiyse, seçimi kaldır.
     if (selectedType) {
        const currentSelectedQuizTypeInfo = quizTypes.find(qt => qt.type === selectedType);
        if (currentSelectedQuizTypeInfo?.disabledText) {
            setSelectedType(null);
        }
     }

  }, [quizTypes, selectedType]);


  const handleSubmit = () => {
    if (selectedType) {
      onQuizTypeSelected(selectedType);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-0">
      <h2 className={`text-xl font-semibold mb-6 text-left ${
        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
      }`}>
        Kişiselleştirilmiş Sınav Türünü Seçin
      </h2>
      <p className={`text-sm mb-8 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Öğrenme hedeflerinize en uygun sınav türünü seçerek deneyiminizi kişiselleştirin.
      </p>

      <div className="space-y-4">
        {quizTypes.map(({ type, title, description, icon, disabledText }) => {
          const isDisabled = !!disabledText;
          return (
            <label
              key={type}
              htmlFor={`quiz-type-${type}`}
              className={`flex flex-col p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
                selectedType === type
                  ? `${theme === 'dark' ? 'bg-primary-600 border-primary-500' : 'bg-primary-500 border-primary-600'} text-white shadow-xl scale-[1.02]`
                  : isDisabled
                    ? `${theme === 'dark' ? 'bg-secondary-800 border-secondary-700 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-400'} opacity-60 cursor-not-allowed`
                    : `${theme === 'dark' ? 'bg-secondary-800 border-secondary-600 hover:border-primary-400 text-gray-200' : 'bg-white border-gray-300 hover:border-primary-500 text-gray-700'} hover:shadow-lg`
              }`}
            title={isDisabled ? disabledText : title} // title'a disabledText'i ekledim, daha iyi erişilebilirlik
            >
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded-md mr-3 text-lg ${
                  selectedType === type 
                    ? (theme === 'dark' ? 'bg-primary-500' : 'bg-primary-400')
                    : isDisabled 
                      ? (theme === 'dark' ? 'bg-secondary-700' : 'bg-gray-200')
                      : (theme === 'dark' ? 'bg-primary-500/20' : 'bg-primary-100')
                }`}>
                    <i className={`${icon} ${
                      selectedType === type 
                        ? 'text-white' 
                        : isDisabled 
                          ? (theme === 'dark' ? 'text-gray-600' : 'text-gray-400')
                          : (theme === 'dark' ? 'text-primary-400' : 'text-primary-600')
                    }`}></i>
                </div>
                <h3 className={`font-semibold text-lg ${
                  selectedType === type 
                    ? 'text-white' 
                    : (theme === 'dark' ? 'text-white' : 'text-gray-800')
                }`}>{title}</h3>
                <input
                  type="radio"
                  id={`quiz-type-${type}`}
                  name="personalizedQuizType"
                  value={type}
                  checked={selectedType === type}
                  onChange={() => !isDisabled && setSelectedType(type)}
                  className={`ml-auto form-radio h-5 w-5 focus:ring-transparent focus:ring-offset-0 bg-transparent border-transparent ${
                    theme === 'dark' ? 'text-primary-200' : 'text-primary-300'
                  }`}
                  disabled={isDisabled}
                  style={selectedType === type ? { filter: 'brightness(2)'} : {}}
                  aria-label={title} // Erişilebilirlik için label eklendi
                />
              </div>
              <p className={`text-sm ${
                selectedType === type 
                  ? (theme === 'dark' ? 'text-primary-200' : 'text-primary-100')
                  : isDisabled 
                    ? (theme === 'dark' ? 'text-gray-600' : 'text-gray-500')
                    : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
              }`}>
                {description}
              </p>
              {isDisabled && <p className={`mt-2 text-xs ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>{disabledText}</p>}
            </label>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-10">
        <button
          onClick={onBack}
          className={`px-7 py-3 transition-colors text-base flex items-center ${
            theme === 'dark' 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          aria-label="Geri dön"
        >
          <i className="fas fa-arrow-left mr-2"></i> Geri
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedType}
          className={`px-7 py-3 text-white rounded-lg font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-base flex items-center ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          aria-label="Devam et"
        >
          Devam Et <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default React.memo(PersonalizedQuizTypeSelector);
