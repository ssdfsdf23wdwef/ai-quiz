import React, { useState, useEffect } from 'react';
import { Course } from '../types';

interface CourseSelectionForQuizStepProps {
  courses: Course[];
  onCourseSelected: (courseId: string) => void;
  onNewCourseCreated: (newCourseName: string) => void;
  onCancel: () => void;
  theme?: string;
}

const CourseSelectionForQuizStep: React.FC<CourseSelectionForQuizStepProps> = ({
  courses,
  onCourseSelected,
  onNewCourseCreated,
  onCancel,
  theme,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [newCourseNameInput, setNewCourseNameInput] = useState<string>('');
  const [showNewCourseInput, setShowNewCourseInput] = useState<boolean>(false);

  useEffect(() => {
    if (courses.length === 0) {
      setShowNewCourseInput(true);
    } else {
      if (!showNewCourseInput && courses.length > 0 && !selectedCourseId) {
         // setSelectedCourseId(courses[0].id); 
      }
    }
  }, [courses, showNewCourseInput, selectedCourseId]);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setNewCourseNameInput('');
    setShowNewCourseInput(false);
  };

  const handleToggleNewCourseInput = () => {
    setShowNewCourseInput(prev => {
      if (!prev) { 
        setSelectedCourseId(''); 
      }
      return !prev;
    });
    if (!showNewCourseInput) setNewCourseNameInput(''); 
  };
  
  const handleNewCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCourseNameInput(e.target.value);
    if(selectedCourseId) setSelectedCourseId(''); 
    if(!showNewCourseInput) setShowNewCourseInput(true);
  };


  const handleSubmit = () => {
    if (selectedCourseId && !showNewCourseInput) {
      onCourseSelected(selectedCourseId);
    } else if (showNewCourseInput && newCourseNameInput.trim()) {
      onNewCourseCreated(newCourseNameInput.trim());
    }
  };

  const canSubmit =
    (selectedCourseId && !showNewCourseInput) ||
    (showNewCourseInput && newCourseNameInput.trim().length > 0);

  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-0">
      <h2 className={`text-xl font-semibold mb-6 text-left ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
        Çalışmak istediğiniz dersi seçin
      </h2>

      {courses.length > 0 && (
        <div className="mb-4">
          <select
            id="existing-course-select"
            value={selectedCourseId}
            onChange={(e) => handleSelectCourse(e.target.value)}
            className={`w-full p-3.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base ${theme === 'dark' ? 'bg-secondary-700 border-secondary-600 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'}`}
          >
            <option value="" disabled={selectedCourseId !== ""}>Mevcut bir ders seçin...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleToggleNewCourseInput}
        className={`w-full flex items-center justify-center p-3.5 mb-4 border-2 border-dashed rounded-lg transition-colors
                    ${showNewCourseInput ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-400 dark:border-secondary-500 text-gray-500 dark:text-gray-400 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
      >
        <i className={`fas ${showNewCourseInput ? 'fa-minus-circle' : 'fa-plus-circle'} mr-2.5`}></i>
        {showNewCourseInput && courses.length > 0 ? 'Veya Yeni Ders Oluştur' : 'Yeni Ders Oluştur'}
      </button>

      {showNewCourseInput && (
        <div className="mb-6">
          <input
            type="text"
            id="new-course-name"
            value={newCourseNameInput}
            onChange={handleNewCourseNameChange}
            placeholder="Yeni ders adını yazın (örn: İleri Cebir)"
            className="w-full p-3.5 bg-gray-50 dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-500 text-base"
            aria-label="Yeni ders adı"
          />
        </div>
      )}

      <div className="flex justify-between items-center mt-10">
        <button
          onClick={onCancel}
          className="px-7 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors text-base flex items-center"
          aria-label="Geri dön"
        >
          <i className="fas fa-arrow-left mr-2"></i> Geri
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-7 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-base flex items-center"
          aria-label="Devam et"
        >
          Devam Et <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default React.memo(CourseSelectionForQuizStep);
