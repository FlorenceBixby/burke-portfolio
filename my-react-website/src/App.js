import './App.css';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Photos from './components/Photos';
import Contact from './components/Contact';

function App() {
  return (
    <div className="App">
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Photos />
        <Contact />
      </main>
    </div>
  );
}

export default App;
