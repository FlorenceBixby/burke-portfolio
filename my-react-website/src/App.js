import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import About from './pages/About';
import DowntownAustin from './pages/DowntownAustin';

function App() {
  return (
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
  );
}

export default App;
