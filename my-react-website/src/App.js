import './App.css';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Contact from './components/Contact';

function App() {
  return (
    <div className="App">
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Contact />
      </main>
    </div>
  );
}

export default App;
