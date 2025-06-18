import React, { useState, useMemo } from 'react';
import { LearningObjective, LearningObjectiveStatus, Course } from '../types';
import EmptyState from './EmptyState';

interface LearningObjectivesPageProps {
  objectives: LearningObjective[];
  filterByCourse?: Course | null; 
  onBack?: () => void;
}

const LearningObjectivesPage: React.FC<LearningObjectivesPageProps> = ({ objectives, filterByCourse, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: LearningObjectiveStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30';
      case 'success':
        return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30';
      case 'failure':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30';
      case 'intermediate':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30';
      default:
        return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500/30';
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
    <div className="w-full h-full flex flex-col p-0 text-gray-800 dark:text-gray-200">
      <div className="mb-6 px-1 flex justify-between items-center">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">{pageTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">{pageDescription}</p>
        </div>
        {onBack && (
             <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 dark:bg-secondary-700 hover:bg-gray-300 dark:hover:bg-secondary-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center whitespace-nowrap"
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
            className="w-full p-3 pl-10 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-500"
            aria-label="Hedef arama"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto bg-white dark:bg-secondary-800 rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-secondary-700/50">
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
          />
        ) : (
          <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
            <thead className="bg-gray-50 dark:bg-secondary-700/50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hedef Adı</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durum</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kaynak PDF</th>
                {!filterByCourse && <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ders</th>}
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Son Güncelleme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-secondary-700">
              {filteredObjectives.map((obj) => (
                <tr key={obj.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-normal break-words">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{obj.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(obj.status)}`}>
                      {getStatusText(obj.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-500 dark:text-gray-400">{obj.sourcePdfName}</td>
                  {!filterByCourse && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                       {obj.courseName || <span className="italic opacity-60">Belirtilmemiş</span>}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatDate(obj.updatedAt)}</td>
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