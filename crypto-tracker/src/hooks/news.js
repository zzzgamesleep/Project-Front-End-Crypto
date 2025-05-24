// hooks/useNews.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useNews = ({ q = '', category = '', country = 'us', pageSize = 10, page = 1 } = {}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // để tránh memory leak khi component bị unmount

    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:4000/api/news', {
          params: {
            q,
            category,
            country,
            pageSize,
            page,
          },
        });

        if (isMounted) {
          setArticles(res.data.articles || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [q, category, country, pageSize, page]); // chỉ fetch lại nếu các query thay đổi

  return { articles, loading, error };
};

export default useNews;
