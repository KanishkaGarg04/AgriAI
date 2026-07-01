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
import DiseaseAI from "./components/DiseaseAI";

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
        <Route path="/disease-ai" element={<DiseaseAI />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;