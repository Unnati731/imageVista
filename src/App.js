import React, { useState, useEffect } from 'react';
import './App.css';

const accessKey = 'bVg8ISxEMUVXwuvkRUFK6co-aERfvcXBoeXdOrH43ss';

function App() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(storedHistory);

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowTopBar(false);
      } else {
        setShowTopBar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const searchImages = async () => {
    setLoading(true); // Show spinner
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=25`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults(prevResults => [...prevResults, ...data.results]);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Failed to fetch images. Please try again.');
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setResults([]);
    searchImages();
    setSearchHistory(prevHistory => {
      const newHistory = [keyword, ...prevHistory];
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleShowMore = () => {
    setPage(prevPage => prevPage + 1);
    searchImages();
  };

  return (
    <div className="App">
      {showTopBar && <div className="top-bar">Image Vista</div>}
      <div className={`content ${showTopBar ? '' : 'content-expanded'}`}>
        <form id="search-form" onSubmit={handleSubmit}>
          <input
            id="search-box"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search anything here ..."
          />
          <button type="submit">Search</button>
        </form>

        {loading && (
          <>
            <div id="loading-spinner" style={{display: 'block'}}></div>
            <div id="overlay"></div>
          </>
        )}

        <div id="search-result" className={loading ? 'blur' : ''}>
          {results.map((result, index) => (
            <div key={index}>
              <a href={result.links.html} target="_blank" rel="noopener noreferrer">
                <img src={result.urls.small} alt={result.alt_description} />
              </a>
              <div>
                <p>Picture by {result.user.name}</p>
                <a href={result.links.download} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>

        {results.length > 0 && !loading && (
          <button id="show-more-btn" onClick={handleShowMore}>Show More</button>
        )}
      </div>
    </div>
  );
}

export default App;
