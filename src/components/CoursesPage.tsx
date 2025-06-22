import React, { useState } from 'react';
import { Course, LearningObjective } from '../types';
import EmptyState from './EmptyState';
import { getThemeClasses } from '../utils/themeUtils';

interface CoursesPageProps {
  courses: Course[];
  learningObjectives: LearningObjective[]; 
  onAddCourse: (courseName: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onViewCourseLOs: (course: Course) => void; 
  onBack?: () => void;
  theme?: string;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ 
  courses, 
  learningObjectives,
  onAddCourse, 
  onDeleteCourse, 
  onViewCourseLOs,
  onBack,
  theme
}) => {
  const [newCourseName, setNewCourseName] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddNewCourse = () => {
    if (newCourseName.trim()) {
      onAddCourse(newCourseName.trim());
      setNewCourseName('');
      setIsAddingCourse(false);
    }
  };

  const getLOCountForCourse = (courseId: string): number => {
    return learningObjectives.filter(lo => lo.courseId === courseId).length;
  };

  const filteredCourses = (courses || [])
    .filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className={`w-full h-full flex flex-col p-0 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="mb-6 px-1 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Derslerim</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Oluşturduğunuz dersleri yönetin ve kişiselleştirilmiş sınavlar için kullanın.</p>
        </div>
        {onBack && !isAddingCourse && (
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${theme === 'dark' ? 'bg-secondary-700 hover:bg-secondary-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            aria-label="Ana Sayfaya Dön"
          >
            <i className="fas fa-arrow-left mr-2"></i> Ana Sayfa
          </button>
        )}
      </div>

      {isAddingCourse ? (
        <div className={`mb-6 p-6 rounded-lg shadow-xl ring-1 transition-all duration-300 ease-in-out ${
          theme === 'dark' 
            ? 'bg-secondary-800 ring-secondary-700/50' 
            : 'bg-white ring-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Yeni Ders Oluştur</h2>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Ders adı (örn: Matematik 101)"
              className={`flex-grow p-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                theme === 'dark' 
                  ? 'bg-secondary-700 border-secondary-600 text-gray-200 placeholder-gray-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
              aria-label="Yeni ders adı"
            />
            <button
              onClick={handleAddNewCourse}
              disabled={!newCourseName.trim()}
              className={`px-5 py-3 text-white rounded-lg disabled:opacity-50 flex items-center font-medium ${
                theme === 'dark' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              <i className="fas fa-plus mr-2"></i> Oluştur
            </button>
            <button
              onClick={() => { setIsAddingCourse(false); setNewCourseName(''); }}
              className={`px-5 py-3 rounded-lg flex items-center font-medium ${
                theme === 'dark' 
                  ? 'bg-secondary-600 hover:bg-secondary-500 text-gray-300' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              <i className="fas fa-times mr-2"></i> İptal
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
          <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
            <input
              type="text"
              placeholder="Ders ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                theme === 'dark' 
                  ? 'bg-secondary-800 border-secondary-700 text-gray-200 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
              aria-label="Ders arama"
            />
            <i className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}></i>
          </div>
          <button
            onClick={() => setIsAddingCourse(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center justify-center"
          >
            <i className="fas fa-plus mr-2"></i> Yeni Ders Oluştur
          </button>
        </div>
      )}

      <div className="flex-grow overflow-y-auto custom-scrollbar-courses pr-1">
        {filteredCourses.length === 0 && !isAddingCourse ? (
          <EmptyState
            iconClass="fas fa-layer-group"
            title="Henüz Ders Oluşturulmadı"
            message="Kişiselleştirilmiş sınavlar ve öğrenme hedefleri için dersler oluşturarak öğrenme deneyiminizi organize edin."
            theme={theme}
            actionButton={{
              text: "Yeni Ders Oluştur",
              onClick: () => setIsAddingCourse(true),
              iconClass: "fas fa-plus",
              gradientClasses: "bg-gradient-to-r from-blue-500 to-purple-600",
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
            {filteredCourses.map((course) => {
              const loCount = getLOCountForCourse(course.id);
              return (
              <div 
                key={course.id} 
                className={`p-5 rounded-xl shadow-lg hover:shadow-2xl ring-1 flex flex-col justify-between cursor-pointer transition-all duration-200 ease-in-out hover:ring-primary-500 hover:scale-[1.02] ${
                  theme === 'dark' 
                    ? 'bg-secondary-800 ring-secondary-700/50' 
                    : 'bg-white ring-gray-200'
                }`}
                onClick={() => onViewCourseLOs(course)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && onViewCourseLOs(course)}
                aria-label={`${course.name} ders detaylarını gör`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <i className={`fas fa-chalkboard-teacher text-3xl opacity-80 ${
                      theme === 'dark' ? 'text-primary-400' : 'text-primary-500'
                    }`}></i>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteCourse(course.id);}}
                      className={`text-red-500/70 hover:text-red-400 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
                        theme === 'dark' ? 'hover:bg-red-500/10' : 'hover:bg-red-100'
                      }`}
                      aria-label={`'${course.name}' dersini sil`}
                      title="Dersi Sil"
                    >
                      <i className="fas fa-trash-alt text-base"></i>
                    </button>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1.5 truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`} title={course.name}>{course.name}</h3>
                  <p className={`text-xs mb-3 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>Oluşturulma: {formatDate(course.createdAt)}</p>
                </div>
                <div className={`mt-3 pt-3 border-t flex justify-between items-center text-sm ${
                  theme === 'dark' ? 'border-secondary-700' : 'border-gray-200'
                }`}>
                  <span className={`flex items-center ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <i className={`fas fa-bullseye mr-2 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                    }`}></i> {loCount} Öğrenme Hedefi
                  </span>
                   <span className={`text-xs font-medium ${
                     theme === 'dark' 
                       ? 'text-primary-400 group-hover:text-primary-300' 
                       : 'text-primary-600 group-hover:text-primary-500'
                   }`}>
                     Detaylar <i className="fas fa-arrow-right ml-1 text-xs"></i>
                   </span>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
       <style>{`
        .custom-scrollbar-courses::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-courses::-webkit-scrollbar-track {
          background: var(--scrollbar-track-color);
        }
        .custom-scrollbar-courses::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color);
          border-radius: 10px;
        }
        .custom-scrollbar-courses::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-color);
        }
        .custom-scrollbar-courses {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
        }
      `}</style>
    </div>
  );
};

export default React.memo(CoursesPage);