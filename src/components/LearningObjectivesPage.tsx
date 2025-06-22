import React, { useState, useMemo } from 'react';
import { LearningObjective, LearningObjectiveStatus, Course } from '../types';
import EmptyState from './EmptyState';

interface LearningObjectivesPageProps {
  objectives: LearningObjective[];
  allCourses?: Course[];
  filterByCourse?: Course | null; 
  onBack?: () => void;
  onDeleteObjectives?: (objectiveIds: string[]) => Promise<boolean>;
  theme: 'light' | 'dark';
}

const LearningObjectivesPage: React.FC<LearningObjectivesPageProps> = ({ 
  objectives, 
  allCourses = [],
  filterByCourse, 
  onBack, 
  onDeleteObjectives,
  theme 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<LearningObjectiveStatus | 'all'>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string | 'all'>('all');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status: LearningObjectiveStatus) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' 
          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
          : 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'success':
        return theme === 'dark' 
          ? 'bg-green-500/20 text-green-300 border-green-500/30'
          : 'bg-green-100 text-green-700 border-green-300';
      case 'failure':
        return theme === 'dark' 
          ? 'bg-red-500/20 text-red-300 border-red-500/30'
          : 'bg-red-100 text-red-700 border-red-300';
      case 'intermediate':
        return theme === 'dark' 
          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          : 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return theme === 'dark' 
          ? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
          : 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: LearningObjectiveStatus) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'success': return 'Başarılı';
      case 'failure': return 'Başarısız';
      case 'intermediate': return 'Orta Seviye';
      default:
        return status;
    }
  };

  const filteredObjectives = useMemo(() => {
    return (objectives || [])
    .filter(obj => {
        // Course filter (existing filterByCourse takes precedence)
        const courseMatch = filterByCourse 
          ? obj.courseId === filterByCourse.id
          : selectedCourseFilter === 'all' || obj.courseId === selectedCourseFilter;
        
        if (!courseMatch) return false;
        
        // Status filter
        const statusMatch = selectedStatusFilter === 'all' || obj.status === selectedStatusFilter;
        if (!statusMatch) return false;
        
        // Search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const nameMatch = obj.name.toLowerCase().includes(term);
            const pdfMatch = obj.sourcePdfName.toLowerCase().includes(term);
            const courseNameMatch = filterByCourse && filterByCourse.name ? filterByCourse.name.toLowerCase().includes(term) : false;
            const generalCourseNameMatch = !filterByCourse && obj.courseName ? obj.courseName.toLowerCase().includes(term) : false;
            return nameMatch || pdfMatch || courseNameMatch || generalCourseNameMatch;
        }
        return true; 
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [objectives, filterByCourse, selectedCourseFilter, selectedStatusFilter, searchTerm]);


  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const pageTitle = filterByCourse
    ? `"${filterByCourse.name}" Dersinin Öğrenme Hedefleri`
    : "Tüm Öğrenme Hedeflerim";

  const pageDescription = filterByCourse
    ? `Bu derse ait kişiselleştirilmiş sınavlardan çıkarılan hedefler.`
    : `Tüm kişiselleştirilmiş sınavlarınızdan çıkarılan ve takip ettiğiniz öğrenme hedefleri.`;

  const backButtonText = filterByCourse ? "Dersler Sayfasına Dön" : "Ana Sayfaya Dön";
  const backButtonIcon = filterByCourse ? "fas fa-layer-group" : "fas fa-arrow-left";


  const handleSelectObjective = (objectiveId: string, isSelected: boolean) => {
    setSelectedObjectives(prev => 
      isSelected 
        ? [...prev, objectiveId]
        : prev.filter(id => id !== objectiveId)
    );
  };

  const handleSelectAll = () => {
    if (selectedObjectives.length === filteredObjectives.length) {
      setSelectedObjectives([]);
    } else {
      setSelectedObjectives(filteredObjectives.map(obj => obj.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!onDeleteObjectives || selectedObjectives.length === 0) return;
    
    const confirmMessage = selectedObjectives.length === 1 
      ? 'Bu öğrenme hedefini silmek istediğinizden emin misiniz?'
      : `${selectedObjectives.length} öğrenme hedefini silmek istediğinizden emin misiniz?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setIsDeleting(true);
    try {
      const success = await onDeleteObjectives(selectedObjectives);
      if (success) {
        setSelectedObjectives([]);
      }
    } catch (error) {
      console.error('Silme işleminde hata:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusOptions = (): { value: LearningObjectiveStatus | 'all', label: string }[] => [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'pending', label: 'Beklemede' },
    { value: 'success', label: 'Başarılı' },
    { value: 'failure', label: 'Başarısız' },
    { value: 'intermediate', label: 'Orta Seviye' },
  ];

  const getCourseOptions = () => {
    const options = [{ value: 'all', label: 'Tüm Dersler' }];
    if (!filterByCourse) {
      // If not filtering by a specific course, show all available courses
      const uniqueCourses = allCourses.filter(course => 
        objectives.some(obj => obj.courseId === course.id)
      );
      uniqueCourses.forEach(course => {
        options.push({ value: course.id, label: course.name });
      });
    }
    return options;
  };

  return (
    <div className={`w-full h-full flex flex-col p-0 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="mb-6 px-1 flex justify-between items-center">
        <div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pageTitle}</h1>
            <p className={`text-sm md:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{pageDescription}</p>
        </div>
        {onBack && (
             <button
                onClick={onBack}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center whitespace-nowrap ${
                  theme === 'dark' 
                    ? 'bg-secondary-700 hover:bg-secondary-600 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                aria-label={backButtonText}
            >
                <i className={`${backButtonIcon} mr-2`}></i> {backButtonText}
            </button>
        )}
      </div>

      <div className="mb-6 space-y-4 px-1">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-grow lg:max-w-md">
            <input
              type="text"
              placeholder="Hedef, PDF veya ders adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                theme === 'dark' 
                  ? 'bg-secondary-800 border-secondary-700 text-gray-200 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
              aria-label="Hedef arama"
            />
            <i className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}></i>
          </div>

          {/* Delete Selected Button */}
          {onDeleteObjectives && selectedObjectives.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center whitespace-nowrap ${
                isDeleting
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <i className={`fas ${isDeleting ? 'fa-spinner fa-spin' : 'fa-trash'} mr-2`}></i>
              {isDeleting ? 'Siliniyor...' : `Seçilenleri Sil (${selectedObjectives.length})`}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Durum Filtresi
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as LearningObjectiveStatus | 'all')}
              className={`w-full p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                theme === 'dark' 
                  ? 'bg-secondary-800 border-secondary-700 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Course Filter (only show if not already filtering by a specific course) */}
          {!filterByCourse && (
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Ders Filtresi
              </label>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  theme === 'dark' 
                    ? 'bg-secondary-800 border-secondary-700 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                {getCourseOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-grow overflow-y-auto rounded-lg shadow-xl ring-1 ${
        theme === 'dark' 
          ? 'bg-secondary-800 ring-secondary-700/50' 
          : 'bg-white ring-gray-200'
      }`}>
        {filteredObjectives.length === 0 ? (
          <EmptyState
            iconClass="fas fa-bullseye-pointer"
            title={filterByCourse ? 'Bu Derse Ait Hedef Bulunmuyor' : 'Henüz Öğrenme Hedefi Yok'}
            message={
              filterByCourse
                ? 'Bu ders için kişiselleştirilmiş sınavlar oluşturduğunuzda hedefler burada listelenecektir.'
                : 'Kişiselleştirilmiş sınavlar oluşturduğunuzda, belirlenen alt konular burada hedefleriniz olarak listelenir. Yeni bir kişisel sınav oluşturarak başlayabilirsiniz.'
            }
            actionButton={!filterByCourse && onBack ? {
              text: "Ana Sayfaya Dön",
              onClick: onBack,
              iconClass: "fas fa-home",
            } : undefined}
            theme={theme}
          />
        ) : (
          <table className={`w-full min-w-full divide-y ${theme === 'dark' ? 'divide-secondary-700' : 'divide-gray-200'}`}>
            <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-secondary-700/50' : 'bg-gray-50'}`}>
              <tr>
                {onDeleteObjectives && (
                  <th scope="col" className="px-6 py-3.5 text-left">
                    <input
                      type="checkbox"
                      checked={filteredObjectives.length > 0 && selectedObjectives.length === filteredObjectives.length}
                      onChange={handleSelectAll}
                      className={`rounded border focus:ring-primary-500 ${
                        theme === 'dark'
                          ? 'bg-secondary-800 border-secondary-600 text-primary-500'
                          : 'bg-white border-gray-300 text-primary-500'
                      }`}
                      aria-label="Tümünü seç"
                    />
                  </th>
                )}
                <th scope="col" className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>Hedef Adı</th>
                <th scope="col" className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>Durum</th>
                <th scope="col" className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>Kaynak PDF</th>
                {!filterByCourse && <th scope="col" className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>Ders</th>}
                <th scope="col" className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>Son Güncelleme</th>
                {onDeleteObjectives && (
                  <th scope="col" className={`px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>İşlemler</th>
                )}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-secondary-700' : 'divide-gray-200'}`}>
              {filteredObjectives.map((obj) => (
                <tr key={obj.id} className={`transition-colors duration-150 ${
                  theme === 'dark' ? 'hover:bg-secondary-700/30' : 'hover:bg-gray-50'
                } ${selectedObjectives.includes(obj.id) ? (theme === 'dark' ? 'bg-secondary-700/20' : 'bg-blue-50') : ''}`}>
                  {onDeleteObjectives && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedObjectives.includes(obj.id)}
                        onChange={(e) => handleSelectObjective(obj.id, e.target.checked)}
                        className={`rounded border focus:ring-primary-500 ${
                          theme === 'dark'
                            ? 'bg-secondary-800 border-secondary-600 text-primary-500'
                            : 'bg-white border-gray-300 text-primary-500'
                        }`}
                        aria-label={`${obj.name} seç`}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-normal break-words">
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{obj.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(obj.status)}`}>
                      {getStatusText(obj.status)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-normal break-words text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>{obj.sourcePdfName}</td>
                  {!filterByCourse && (
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                       {obj.courseName || <span className="italic opacity-60">Belirtilmemiş</span>}
                    </td>
                  )}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>{formatDate(obj.updatedAt)}</td>
                  {onDeleteObjectives && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (window.confirm('Bu öğrenme hedefini silmek istediğinizden emin misiniz?')) {
                            onDeleteObjectives([obj.id]);
                          }
                        }}
                        className={`text-sm font-medium transition-colors ${
                          theme === 'dark'
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        aria-label={`${obj.name} sil`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default React.memo(LearningObjectivesPage);