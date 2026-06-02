import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Solutions from './pages/Solutions';
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
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/solutions/network-voice" element={<NetworkVoice />} />
        <Route path="/solutions/unified-communications" element={<UnifiedCommunications />} />
        <Route path="/solutions/contact-center" element={<ContactCenter />} />
        <Route path="/solutions/cybersecurity" element={<Cybersecurity />} />
        <Route path="/solutions/cloud-computing" element={<CloudComputing />} />
        <Route path="/solutions/mobility-iot-ai" element={<MobilityIoT />} />
        <Route path="/solutions/managed-services" element={<ManagedServices />} />
        <Route path="/solutions/sd-wan" element={<SDWAN />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
