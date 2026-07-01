import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import FeatureShowcase from "./components/FeatureShowcase";
import Workflow from "./components/Workflow";
import ExploreFeatures from "./components/ExploreFeatures";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import SpeakSnapSow from "./components/SpeakSnapSow";
import ClimateSmart from "./components/ClimateSmart";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

import CropPrediction from "./pages/CropPrediction";
import FertilizerPrediction from "./pages/FertilizerPrediction";
import SmartIrrigationAdvisor from "./pages/SmartIrrigationAdvisor";   
// import DiseaseAI from "./components/DiseaseAI";
import ComingSoon from "./pages/ComingSoon";
import DiseaseDetection from "./pages/DiseaseDetection";

// 1. Import your new Market Price Prediction page here
import MarketPricePrediction from "./pages/MarketPricePrediction";

function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <FeatureShowcase />
      <Workflow />
      <AnalyticsDashboard />
      <SpeakSnapSow />
      <ClimateSmart />
      <ExploreFeatures />
      <CallToAction />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#FDFEFC] text-gray-900 font-sans">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crop-prediction" element={<CropPrediction />} />
        <Route path="/fertilizer-prediction" element={<FertilizerPrediction />} />
        <Route path="/features/irrigation" element={<SmartIrrigationAdvisor />} />
        <Route path="/disease-detection" element={<DiseaseDetection />} />
        <Route path="/features/voice-assistant" element={<ComingSoon feature="🎙️ AI Voice Assistant" />} />
        
        {/* 2. Replace the ComingSoon component with your actual MarketPricePrediction component */}
        <Route path="/features/price-prediction" element={<MarketPricePrediction />} />
        
        <Route path="/features/health-monitor" element={<ComingSoon feature="🌿 Crop Health Monitoring" />} />
        <Route path="/features/records" element={<ComingSoon feature="📑 Digital Farm Record" />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;