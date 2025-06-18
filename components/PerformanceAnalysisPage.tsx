
import React, { useState, useMemo } from 'react';
import { SavedQuizData, LearningObjective, LearningObjectiveStatus, Course, PersonalizedQuizType } from '../types';
import EmptyState from './EmptyState';

interface PerformanceAnalysisPageProps {
  savedQuizzes: SavedQuizData[];
  allCourses: Course[];
  learningObjectives: LearningObjective[];
  onBack?: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; iconColorClass?: string, iconBgClass?: string, subValue?: string }> = React.memo(({ title, value, icon, iconColorClass = 'text-primary-600 dark:text-primary-400', iconBgClass = 'bg-primary-100 dark:bg-primary-500/10', subValue }) => (
  <div className="bg-white dark:bg-secondary-800 p-5 rounded-xl shadow-lg flex items-center space-x-4 ring-1 ring-gray-200 dark:ring-secondary-700/50 min-h-[100px]">
    <div className={`p-3.5 rounded-lg ${iconBgClass} ${iconColorClass} self-start mt-1`}>
      <i className={`${icon} text-3xl`}></i>
    </div>
    <div className="flex-grow">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subValue && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subValue}</p>}
    </div>
  </div>
));

const PieSegment: React.FC<{ percentage: number; color: string; label: string; title: string }> = ({ percentage, color, label, title }) => (
  <div 
    style={{ '--p': `${percentage}%`, '--c': color } as React.CSSProperties}
    className="pie-segment flex-shrink-0"
    title={`${title}: ${percentage.toFixed(1)}%`}
  >
    {percentage > 5 && <span className="pie-label">{label}</span>}
  </div>
);


const PerformanceAnalysisPage: React.FC<PerformanceAnalysisPageProps> = ({ 
    savedQuizzes, 
    allCourses, 
    learningObjectives, 
    onBack 
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedQuizTypeFilter, setSelectedQuizTypeFilter] = useState<string>('all');

  const filteredQuizzes = useMemo(() => {
    return (savedQuizzes || []).filter(quiz => {
      const courseMatch = selectedCourseId === 'all' || quiz.courseId === selectedCourseId;
      if (!courseMatch) return false;

      if (selectedQuizTypeFilter === 'all') return true;
      if (selectedQuizTypeFilter === 'quick') return quiz.quizType === 'Hızlı Sınav';
      if (selectedQuizTypeFilter === 'personalized_all') return quiz.quizType === 'Kişiselleştirilmiş Sınav';
      if (selectedQuizTypeFilter === 'personalized_comprehensive') return quiz.quizType === 'Kişiselleştirilmiş Sınav' && quiz.personalizedQuizType === 'comprehensive';
      if (selectedQuizTypeFilter === 'personalized_new_topics') return quiz.quizType === 'Kişiselleştirilmiş Sınav' && quiz.personalizedQuizType === 'new_topics';
      if (selectedQuizTypeFilter === 'personalized_weak_topics') return quiz.quizType === 'Kişiselleştirilmiş Sınav' && quiz.personalizedQuizType === 'weak_topics';
      return true;
    });
  }, [savedQuizzes, selectedCourseId, selectedQuizTypeFilter]);

  const filteredLearningObjectives = useMemo(() => {
    if (selectedCourseId === 'all') return learningObjectives || [];
    return (learningObjectives || []).filter(lo => lo.courseId === selectedCourseId);
  }, [learningObjectives, selectedCourseId]);

  const overallStats = useMemo(() => {
    if (filteredQuizzes.length === 0) {
      return { totalQuizzes: 0, averageScore: 0, highestScore: 0, lowestScore: 0 };
    }
    let totalScoreSum = 0;
    let highestScore = 0;
    let lowestScore = 100;
    filteredQuizzes.forEach(quiz => {
      const percentage = quiz.totalQuestions > 0 ? (quiz.score / quiz.totalQuestions) * 100 : 0;
      totalScoreSum += percentage;
      if (percentage > highestScore) highestScore = percentage;
      if (percentage < lowestScore) lowestScore = percentage;
    });
    return {
      totalQuizzes: filteredQuizzes.length,
      averageScore: Math.round(totalScoreSum / filteredQuizzes.length),
      highestScore: Math.round(highestScore),
      lowestScore: Math.round(lowestScore === 100 ? Math.min(...filteredQuizzes.map(q => q.totalQuestions > 0 ? (q.score/q.totalQuestions)*100 : 0)) : lowestScore),
    };
  }, [filteredQuizzes]);

  const quizTypeStats = useMemo(() => {
    const stats: Record<string, { count: number; totalScore: number; scores: number[] }> = {
      quick: { count: 0, totalScore: 0, scores: [] },
      personalized_comprehensive: { count: 0, totalScore: 0, scores: [] },
      personalized_new_topics: { count: 0, totalScore: 0, scores: [] },
      personalized_weak_topics: { count: 0, totalScore: 0, scores: [] },
      personalized_other: { count: 0, totalScore: 0, scores: [] }, // For personalized without specific type
    };

    filteredQuizzes.forEach(quiz => {
      const percentage = quiz.totalQuestions > 0 ? (quiz.score / quiz.totalQuestions) * 100 : 0;
      if (quiz.quizType === 'Hızlı Sınav') {
        stats.quick.count++;
        stats.quick.totalScore += percentage;
        stats.quick.scores.push(percentage);
      } else if (quiz.quizType === 'Kişiselleştirilmiş Sınav') {
        const pType = quiz.personalizedQuizType;
        if (pType === 'comprehensive') {
          stats.personalized_comprehensive.count++;
          stats.personalized_comprehensive.totalScore += percentage;
          stats.personalized_comprehensive.scores.push(percentage);
        } else if (pType === 'new_topics') {
          stats.personalized_new_topics.count++;
          stats.personalized_new_topics.totalScore += percentage;
          stats.personalized_new_topics.scores.push(percentage);
        } else if (pType === 'weak_topics') {
          stats.personalized_weak_topics.count++;
          stats.personalized_weak_topics.totalScore += percentage;
          stats.personalized_weak_topics.scores.push(percentage);
        } else {
          stats.personalized_other.count++;
          stats.personalized_other.totalScore += percentage;
          stats.personalized_other.scores.push(percentage);
        }
      }
    });
    
    const calculateAvg = (typeKey: string) => stats[typeKey].count > 0 ? Math.round(stats[typeKey].totalScore / stats[typeKey].count) : 0;

    return {
      quick: { count: stats.quick.count, averageScore: calculateAvg('quick') },
      personalized_comprehensive: { count: stats.personalized_comprehensive.count, averageScore: calculateAvg('personalized_comprehensive') },
      personalized_new_topics: { count: stats.personalized_new_topics.count, averageScore: calculateAvg('personalized_new_topics') },
      personalized_weak_topics: { count: stats.personalized_weak_topics.count, averageScore: calculateAvg('personalized_weak_topics') },
      personalized_other: { count: stats.personalized_other.count, averageScore: calculateAvg('personalized_other') },
      totalPersonalized: stats.personalized_comprehensive.count + stats.personalized_new_topics.count + stats.personalized_weak_topics.count + stats.personalized_other.count,
      averagePersonalizedScore: (stats.personalized_comprehensive.count + stats.personalized_new_topics.count + stats.personalized_weak_topics.count + stats.personalized_other.count) > 0 ?
        Math.round(
            (stats.personalized_comprehensive.totalScore + stats.personalized_new_topics.totalScore + stats.personalized_weak_topics.totalScore + stats.personalized_other.totalScore) /
            (stats.personalized_comprehensive.count + stats.personalized_new_topics.count + stats.personalized_weak_topics.count + stats.personalized_other.count)
        ) : 0,
    };
  }, [filteredQuizzes]);

  const learningObjectiveStats = useMemo(() => {
    const stats: Record<LearningObjectiveStatus, number> = {
      pending: 0, success: 0, failure: 0, intermediate: 0,
    };
    filteredLearningObjectives.forEach(lo => {
      stats[lo.status]++;
    });
    const totalLOs = filteredLearningObjectives.length;
    return {
      totalLOs,
      counts: stats,
      percentages: {
        pending: totalLOs > 0 ? (stats.pending / totalLOs) * 100 : 0,
        success: totalLOs > 0 ? (stats.success / totalLOs) * 100 : 0,
        failure: totalLOs > 0 ? (stats.failure / totalLOs) * 100 : 0,
        intermediate: totalLOs > 0 ? (stats.intermediate / totalLOs) * 100 : 0,
      },
    };
  }, [filteredLearningObjectives]);

  const sortedQuizzesForChart = useMemo(() => {
    return [...filteredQuizzes].sort((a, b) => a.savedAt - b.savedAt);
  }, [filteredQuizzes]);

  const getScoreColorAndType = (quiz: SavedQuizData): { color: string; typeLabel: string; specificTypeLabel?: string } => {
    const percentage = quiz.totalQuestions > 0 ? (quiz.score / quiz.totalQuestions) * 100 : 0;
    let baseColorClass = '';
    let typeLabel = '';
    let specificTypeLabel = '';

    if (quiz.quizType === 'Kişiselleştirilmiş Sınav') {
      typeLabel = 'Kişisel';
      switch (quiz.personalizedQuizType) {
        case 'comprehensive': baseColorClass = 'bg-purple-500'; specificTypeLabel = 'Kapsamlı'; break;
        case 'new_topics': baseColorClass = 'bg-pink-500'; specificTypeLabel = 'Yeni Konular'; break;
        case 'weak_topics': baseColorClass = 'bg-fuchsia-500'; specificTypeLabel = 'Zayıf Konular'; break;
        default: baseColorClass = 'bg-indigo-500'; specificTypeLabel = 'Diğer Kişisel';
      }
    } else { // Hızlı Sınav
      typeLabel = 'Hızlı';
      baseColorClass = 'bg-cyan-500';
    }

    if (percentage < 50) return { color: `${baseColorClass} opacity-60`, typeLabel, specificTypeLabel };
    if (percentage < 75) return { color: `${baseColorClass} opacity-80`, typeLabel, specificTypeLabel };
    return { color: baseColorClass, typeLabel, specificTypeLabel };
  };
  
  const formatDate = (timestamp: number, full: boolean = false) => {
    if (full) {
         return new Date(timestamp).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return new Date(timestamp).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  };

  const getStatusText = (status: LearningObjectiveStatus) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'success': return 'Başarılı';
      case 'failure': return 'Başarısız';
      case 'intermediate': return 'Orta';
      default: return status;
    }
  };
   const getStatusColorsForPie = (status: LearningObjectiveStatus): string => {
    switch (status) {
      case 'success': return '#22c55e'; // green-500
      case 'failure': return '#ef4444'; // red-500
      case 'intermediate': return '#3b82f6'; // blue-500
      case 'pending': return '#f59e0b'; // amber-500
      default: return '#6b7280'; // gray-500
    }
  };


  const quizTypeFilterOptions = [
    { value: 'all', label: 'Tüm Sınav Türleri' },
    { value: 'quick', label: 'Hızlı Sınavlar' },
    { value: 'personalized_all', label: 'Tüm Kişiselleştirilmiş' },
    { value: 'personalized_comprehensive', label: 'Kişisel - Kapsamlı' },
    { value: 'personalized_new_topics', label: 'Kişisel - Yeni Konular' },
    { value: 'personalized_weak_topics', label: 'Kişisel - Zayıf Konular' },
  ];

  const personalizedQuizTypeLabels: Record<PersonalizedQuizType, string> = {
    comprehensive: "Kapsamlı",
    new_topics: "Yeni Konular",
    weak_topics: "Zayıf Konular",
  };
  
  return (
    <div className="w-full h-full flex flex-col p-0 text-gray-800 dark:text-gray-200">
      <div className="mb-6 px-1 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mb-3 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Performans Analizi</h1>
          <p className="text-gray-500 dark:text-gray-400">Sınav performansınızı ve öğrenme ilerlemenizi takip edin.</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 dark:bg-secondary-700 hover:bg-gray-300 dark:hover:bg-secondary-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center self-start sm:self-center"
            aria-label="Ana Sayfaya Dön"
          >
            <i className="fas fa-arrow-left mr-2"></i> Ana Sayfa
          </button>
        )}
      </div>

      {/* Filters Card */}
      <section className="mb-6 bg-white dark:bg-secondary-800 p-4 sm:p-5 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-secondary-700/50">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Filtreler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ders Seçin</label>
            <select
              id="courseFilter"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tüm Dersler</option>
              {allCourses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quizTypeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sınav Türü Seçin</label>
            <select
              id="quizTypeFilter"
              value={selectedQuizTypeFilter}
              onChange={(e) => setSelectedQuizTypeFilter(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500"
            >
              {quizTypeFilterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {savedQuizzes.length === 0 ? (
        <EmptyState
          iconClass="fas fa-chart-pie"
          title="Veri Yok"
          message="Performans analizi için henüz kaydedilmiş sınav verisi bulunmamaktadır. Sınavları tamamladıkça verileriniz burada görünecektir."
           actionButton={onBack ? {
            text: "Ana Sayfaya Dön",
            onClick: onBack, 
            iconClass: "fas fa-home",
          } : undefined}
        />
      ) : filteredQuizzes.length === 0 && savedQuizzes.length > 0 ? (
         <EmptyState
          iconClass="fas fa-filter"
          title="Filtre Sonucu Boş"
          message="Seçtiğiniz filtre kriterlerine uygun sınav bulunamadı. Lütfen filtrelerinizi değiştirerek tekrar deneyin."
        />
      ) : (
        <div className="flex-grow overflow-y-auto space-y-8 custom-scrollbar pr-1 pb-4">
          {/* Overall Stats */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 px-1">Genel Filtrelenmiş İstatistikler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Toplam Sınav" value={overallStats.totalQuizzes} icon="fas fa-graduation-cap" />
              <StatCard title="Ortalama Skor" value={`${overallStats.averageScore}%`} icon="fas fa-percentage" iconColorClass="text-blue-600 dark:text-blue-400" iconBgClass="bg-blue-100 dark:bg-blue-500/10"/>
              <StatCard title="En Yüksek Skor" value={`${overallStats.highestScore}%`} icon="fas fa-arrow-trend-up" iconColorClass="text-green-600 dark:text-green-400" iconBgClass="bg-green-100 dark:bg-green-500/10" />
              <StatCard title="En Düşük Skor" value={`${overallStats.lowestScore}%`} icon="fas fa-arrow-trend-down" iconColorClass="text-red-600 dark:text-red-400" iconBgClass="bg-red-100 dark:bg-red-500/10" />
            </div>
          </section>

          {/* Quiz Type Detailed Stats */}
          <section className="bg-white dark:bg-secondary-800 p-5 sm:p-6 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-secondary-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Sınav Türü Detayları (Filtrelenmiş)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {quizTypeStats.quick.count > 0 && (
                <StatCard 
                    title="Hızlı Sınavlar" 
                    value={quizTypeStats.quick.count} 
                    subValue={`Ort. Skor: ${quizTypeStats.quick.averageScore}%`}
                    icon="fas fa-bolt" 
                    iconColorClass="text-cyan-600 dark:text-cyan-400" 
                    iconBgClass="bg-cyan-100 dark:bg-cyan-500/10"
                />
              )}
              {quizTypeStats.totalPersonalized > 0 && (
                <StatCard 
                    title="Kişiselleştirilmiş Sınavlar (Toplam)" 
                    value={quizTypeStats.totalPersonalized} 
                    subValue={`Ort. Skor: ${quizTypeStats.averagePersonalizedScore}%`}
                    icon="fas fa-user-cog" 
                    iconColorClass="text-purple-600 dark:text-purple-400" 
                    iconBgClass="bg-purple-100 dark:bg-purple-500/10"
                />
              )}
              {Object.entries(personalizedQuizTypeLabels).map(([typeKey, label]) => {
                  const key = `personalized_${typeKey}` as keyof typeof quizTypeStats;
                  const stats = quizTypeStats[key] as { count: number; averageScore: number };
                  if (stats && stats.count > 0) {
                      return (
                          <StatCard 
                              key={key}
                              title={`Kişisel - ${label}`} 
                              value={stats.count} 
                              subValue={`Ort. Skor: ${stats.averageScore}%`}
                              icon={typeKey === 'comprehensive' ? 'fas fa-book-reader' : typeKey === 'new_topics' ? 'fas fa-lightbulb' : 'fas fa-crosshairs'}
                              iconColorClass={typeKey === 'comprehensive' ? 'text-purple-500 dark:text-purple-300' : typeKey === 'new_topics' ? 'text-pink-500 dark:text-pink-300' : 'text-fuchsia-500 dark:text-fuchsia-300'}
                              iconBgClass={typeKey === 'comprehensive' ? 'bg-purple-100 dark:bg-purple-500/15' : typeKey === 'new_topics' ? 'bg-pink-100 dark:bg-pink-500/15' : 'bg-fuchsia-100 dark:bg-fuchsia-500/15'}
                          />
                      );
                  }
                  return null;
              })}
            </div>
          </section>

          {/* Learning Objectives Stats */}
           { (selectedCourseId !== 'all' || learningObjectiveStats.totalLOs > 0) && (
            <section className="bg-white dark:bg-secondary-800 p-5 sm:p-6 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-secondary-700/50">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Öğrenme Hedefleri Analizi {selectedCourseId !== 'all' && allCourses.find(c=>c.id === selectedCourseId) ? `(${allCourses.find(c=>c.id === selectedCourseId)?.name})` : '(Tüm Dersler)'}</h2>
                {learningObjectiveStats.totalLOs > 0 ? (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-full md:w-1/2">
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Toplam Hedef: <span className="font-bold text-primary-600 dark:text-primary-400">{learningObjectiveStats.totalLOs}</span></p>
                        <ul className="space-y-1.5 text-sm">
                        {(Object.keys(learningObjectiveStats.counts) as LearningObjectiveStatus[]).map(status => (
                            <li key={status} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-secondary-700/50 rounded-md">
                            <span className="text-gray-700 dark:text-gray-300">{getStatusText(status)}:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                                {learningObjectiveStats.counts[status]} ({learningObjectiveStats.percentages[status].toFixed(1)}%)
                            </span>
                            </li>
                        ))}
                        </ul>
                    </div>
                    <div className="w-full md:w-1/2">
                         <div className="pie-chart-container relative mx-auto my-4" title="Öğrenme Hedefi Durum Dağılımı">
                             {(Object.keys(learningObjectiveStats.percentages) as LearningObjectiveStatus[]).map(status => (
                                learningObjectiveStats.percentages[status] > 0 && (
                                    <PieSegment 
                                        key={status} 
                                        percentage={learningObjectiveStats.percentages[status]} 
                                        color={getStatusColorsForPie(status)}
                                        label={getStatusText(status).substring(0,1)}
                                        title={getStatusText(status)}
                                    />
                                )
                             ))}
                        </div>
                    </div>
                </div>
                ) : (
                <p className="text-gray-500 dark:text-gray-400">Bu ders için henüz öğrenme hedefi bulunmuyor veya hiç kişiselleştirilmiş sınav oluşturulmamış.</p>
                )}
            </section>
            )}


          {/* Score Timeline Chart */}
          <section className="bg-white dark:bg-secondary-800 p-5 sm:p-6 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-secondary-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sınav Skorları Zaman Çizelgesi (Filtrelenmiş)</h2>
            {sortedQuizzesForChart.length > 0 ? (
              <div className="flex items-end space-x-1.5 h-72 bg-gray-100 dark:bg-secondary-700/30 p-4 rounded-lg overflow-x-auto custom-scrollbar-chart">
                {sortedQuizzesForChart.map((quiz) => {
                  const percentage = quiz.totalQuestions > 0 ? (quiz.score / quiz.totalQuestions) * 100 : 0;
                  const barHeight = Math.max(5, percentage); 
                  const { color: barColor, typeLabel, specificTypeLabel } = getScoreColorAndType(quiz);
                  const tooltipText = `${quiz.pdfName || (quiz.courseName ? `${quiz.courseName} Sınavı` : 'Sınav')}\nTür: ${typeLabel}${specificTypeLabel ? ' - ' + specificTypeLabel : ''}\nTarih: ${formatDate(quiz.savedAt, true)}\nSkor: ${Math.round(percentage)}% (${quiz.score}/${quiz.totalQuestions})`;
                  return (
                    <div key={quiz.id} className="flex flex-col items-center flex-shrink-0 w-12 group relative" title={tooltipText}>
                      <div
                        className={`w-8 rounded-t-md transition-all duration-300 ease-out ${barColor} group-hover:opacity-75`}
                        style={{ height: `${barHeight}%` }}
                        aria-label={`Sınav skoru: ${Math.round(percentage)}%`}
                      ></div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 whitespace-nowrap group-hover:font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-300">
                        {formatDate(quiz.savedAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Zaman çizelgesi için filtrelenmiş veri yok.</p>
            )}
          </section>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: var(--scrollbar-track-color); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb-color); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover-color); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color); }

        .custom-scrollbar-chart::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar-chart::-webkit-scrollbar-track { background: var(--scrollbar-track-color); border-radius: 10px; }
        .custom-scrollbar-chart::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb-color); border-radius: 10px; }
        .custom-scrollbar-chart::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover-color); }
        .custom-scrollbar-chart { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color); }
        
        @property --p { syntax: '<percentage>'; inherits: true; initial-value: 0%; }
        .pie-chart-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: conic-gradient(
                var(--c, #6b7280) var(--p, 0%) 
            ); /* Default for remaining part */
            position: relative;
        }
        .pie-chart-container::before { /* Makes it a donut */
            content: "";
            position: absolute;
            inset: 30%; /* Adjust for donut thickness */
            border-radius: 50%;
            background: var(--bg-color-pie-center, white); /* Use CSS var for dark/light mode compatibility */
            
        }
        html.dark .pie-chart-container::before {
             --bg-color-pie-center: #1e293b; /* secondary-800 */
        }
        html:not(.dark) .pie-chart-container::before {
             --bg-color-pie-center: white;
        }

        .pie-segment {
            width: 100%; height: 100%; border-radius: 50%;
            background: conic-gradient(var(--c) var(--p), transparent 0);
            position: absolute; top:0; left:0;
            display: flex; align-items: center; justify-content: center;
        }
        .pie-label {
            font-size: 0.6rem; color: white; text-shadow: 0 0 2px rgba(0,0,0,0.5);
            transform: rotate(calc(var(--p) / 2)); /* Basic attempt to center label, might need adjustment */
        }
      `}</style>
    </div>
  );
};

export default React.memo(PerformanceAnalysisPage);
