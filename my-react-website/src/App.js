import './App.css';
import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import About from './pages/About';
import DowntownAustin from './pages/DowntownAustin';

export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('br-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('br-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <div className="App">
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio/downtown-austin" element={<DowntownAustin />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;
