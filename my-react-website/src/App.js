import './App.css';
import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import PageIntro from './components/PageIntro';
import Home from './pages/Home';
import Solutions from './pages/Solutions';
import About from './pages/About';
import Contact from './pages/Contact';
import NetworkVoice from './pages/solutions/NetworkVoice';
import UnifiedCommunications from './pages/solutions/UnifiedCommunications';
import ContactCenter from './pages/solutions/ContactCenter';
import Cybersecurity from './pages/solutions/Cybersecurity';
import CloudComputing from './pages/solutions/CloudComputing';
import MobilityIoT from './pages/solutions/MobilityIoT';
import ManagedServices from './pages/solutions/ManagedServices';
import SDWAN from './pages/solutions/SDWAN';

function App() {
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  return (
    <BrowserRouter>
      <PageIntro onDone={handleIntroDone} />
      <div className="App" style={{ visibility: introDone ? 'visible' : 'hidden' }}>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solutions" element={<><Solutions /><Footer /></>} />
          <Route path="/solutions/network-voice" element={<><NetworkVoice /><Footer /></>} />
          <Route path="/solutions/unified-communications" element={<><UnifiedCommunications /><Footer /></>} />
          <Route path="/solutions/contact-center" element={<><ContactCenter /><Footer /></>} />
          <Route path="/solutions/cybersecurity" element={<><Cybersecurity /><Footer /></>} />
          <Route path="/solutions/cloud-computing" element={<><CloudComputing /><Footer /></>} />
          <Route path="/solutions/mobility-iot-ai" element={<><MobilityIoT /><Footer /></>} />
          <Route path="/solutions/managed-services" element={<><ManagedServices /><Footer /></>} />
          <Route path="/solutions/sd-wan" element={<><SDWAN /><Footer /></>} />
          <Route path="/about" element={<><About /><Footer /></>} />
          <Route path="/contact" element={<><Contact /><Footer /></>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
