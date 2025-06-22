import React, { useState, useMemo } from 'react';
import { LearningObjective, LearningObjectiveStatus, Course } from '../types';
import EmptyState from './EmptyState';

interface LearningObjectivesPageProps {
  objectives: LearningObjective[];
  filterByCourse?: Course | null; 
  onBack?: () => void;
  theme: 'light' | 'dark';
}

const LearningObjectivesPage: React.FC<LearningObjectivesPageProps> = ({ objectives, filterByCourse, onBack, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
        const courseMatch = !filterByCourse || (filterByCourse && obj.courseId === filterByCourse.id);
        if (!courseMatch) {
            return false;
        }
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
  }, [objectives, filterByCourse, searchTerm]);


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

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
        <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
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
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-secondary-700' : 'divide-gray-200'}`}>
              {filteredObjectives.map((obj) => (
                <tr key={obj.id} className={`transition-colors duration-150 ${
                  theme === 'dark' ? 'hover:bg-secondary-700/30' : 'hover:bg-gray-50'
                }`}>
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