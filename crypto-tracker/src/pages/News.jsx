import React from 'react';
import useNews from '../hooks/news'; // Cập nhật đường dẫn tùy theo cấu trúc dự án

const News = () => {
  const { articles, loading, error } = useNews();

  console.log('Fetched news articles:', articles);

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800">📰 Tin Tức Mới Nhất</h2>

      {loading && (
        <p className="text-center text-lg text-gray-500 animate-pulse">Đang tải tin tức...</p>
      )}

      {error && (
        <p className="text-center text-red-500 text-lg">{error.message}</p>
      )}

      {!loading && !error && articles.length === 0 && (
        <p className="text-center text-gray-600">Không có tin tức nào được tìm thấy.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col"
          >
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="h-48 w-full object-cover"
              />
            )}

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">{article.description}</p>
              </div>
              <span className="mt-4 text-sm text-blue-600 font-medium hover:underline">
                Đọc thêm →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default News;
