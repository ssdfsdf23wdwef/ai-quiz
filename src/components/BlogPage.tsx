import React from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'AI Quiz Nasıl Çalışır: Yapay Zeka Destekli Quiz Platformu',
    excerpt: 'AI Quiz platformumuzun yapay zeka teknolojisi ile nasıl kişiselleştirilmiş sınavlar oluşturduğunu öğrenin.',
    content: 'AI Quiz, Google Gemini yapay zeka teknolojisini kullanarak kullanıcıların öğrenme ihtiyaçlarına göre kişiselleştirilmiş quizler oluşturur...',
    date: '2025-06-23',
    tags: ['ai', 'yapay zeka', 'quiz', 'eğitim teknolojisi']
  },
  {
    id: '2',
    title: 'Online Quiz Oluşturmanın Avantajları',
    excerpt: 'Geleneksel sınavlara göre online quiz platformlarının sunduğu avantajları keşfedin.',
    content: 'Online quiz platformları, eğitim sürecini daha etkili ve ölçülebilir hale getirir...',
    date: '2025-06-22',
    tags: ['online eğitim', 'quiz', 'dijital öğrenme']
  },
  {
    id: '3',
    title: 'Kişiselleştirilmiş Öğrenme ile Başarınızı Artırın',
    excerpt: 'AI Quiz\'in kişiselleştirilmiş öğrenme algoritmaları ile nasıl daha etkili öğrenebileceğinizi öğrenin.',
    content: 'Kişiselleştirilmiş öğrenme, her bireyin öğrenme tarzına ve hızına göre özelleştirilmiş içerik sunar...',
    date: '2025-06-21',
    tags: ['kişiselleştirilmiş öğrenme', 'ai', 'eğitim']
  }
];

export const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* SEO Optimized Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            AI Quiz Blog - Yapay Zeka ve Eğitim Teknolojisi
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Yapay zeka destekli quiz platformları, online eğitim teknolojileri ve 
            kişiselleştirilmiş öğrenme hakkında en güncel bilgiler.
          </p>
        </header>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <header className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {post.title}
                </h2>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.date).toLocaleDateString('tr-TR')}
                </time>
              </header>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {post.excerpt}
              </p>
              
              <footer>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 font-medium">
                  Devamını Oku →
                </button>
              </footer>
            </article>
          ))}
        </div>

        {/* SEO Content Section */}
        <section className="mt-16 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            AI Quiz Hakkında
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Yapay Zeka Destekli Quiz Platformu
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                AI Quiz, yapay zeka teknolojisini kullanarak kişiselleştirilmiş sınavlar oluşturan 
                modern bir eğitim platformudur. Google Gemini AI ile desteklenen sistemimiz, 
                kullanıcıların öğrenme ihtiyaçlarını analiz ederek en uygun soruları üretir.
              </p>
              
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Özellikler:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Akıllı soru üretimi</li>
                <li>Kişiselleştirilmiş öğrenme deneyimi</li>
                <li>Gerçek zamanlı performans analizi</li>
                <li>Çoklu format desteği</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Neden AI Quiz?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Geleneksel quiz platformlarından farklı olarak, AI Quiz her kullanıcının 
                bireysel öğrenme tarzını ve seviyesini dikkate alarak optimize edilmiş 
                bir öğrenme deneyimi sunar.
              </p>
              
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Avantajlar:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>%100 ücretsiz kullanım</li>
                <li>Türkçe dil desteği</li>
                <li>Mobil uyumlu tasarım</li>
                <li>Anında sonuç ve geri bildirim</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogPage;
