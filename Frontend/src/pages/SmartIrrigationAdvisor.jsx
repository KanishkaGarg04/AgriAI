import { useState, useRef, useEffect } from "react";
import { Droplets, Thermometer, CloudRain, Leaf, Loader2, AlertTriangle } from "lucide-react";

export default function SmartIrrigationAdvisor() {
  const [formData, setFormData] = useState({
    moisture: "", humidity: "", temp: "", et: ""
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        moisture: parseFloat(formData.moisture),
        humidity: parseFloat(formData.humidity),
        temp: parseFloat(formData.temp),
        et: parseFloat(formData.et || 4.5)
      };

      const response = await fetch('http://127.0.0.1:5004/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Backend not running");
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll to result
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-[#FDFEFC] pt-16 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-emerald-100 rounded-3xl">
              <Droplets className="w-14 h-14 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-emerald-900">Smart Irrigation Advisor</h1>
          <p className="text-xl text-emerald-700 mt-3 max-w-2xl mx-auto">
            Enter current field conditions. Our AI will recommend optimal irrigation strategy.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow p-10 mb-10">
          <h2 className="text-2xl font-semibold mb-8 text-center text-emerald-900">Field Conditions</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
            <div>
              <label className="flex items-center gap-2 text-emerald-700 mb-2">
                <Droplets className="w-5 h-5" /> Soil Moisture (%)
              </label>
              <input type="number" name="moisture" value={formData.moisture} onChange={handleChange}
                placeholder="e.g. 25" step="0.1" required className="w-full px-5 py-4 border border-emerald-100 rounded-2xl focus:border-emerald-500" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-emerald-700 mb-2">
                <CloudRain className="w-5 h-5" /> Air Humidity (%)
              </label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleChange}
                placeholder="e.g. 65" step="0.1" required className="w-full px-5 py-4 border border-emerald-100 rounded-2xl focus:border-emerald-500" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-emerald-700 mb-2">
                <Thermometer className="w-5 h-5" /> Temperature (°C)
              </label>
              <input type="number" name="temp" value={formData.temp} onChange={handleChange}
                placeholder="e.g. 32" step="0.1" required className="w-full px-5 py-4 border border-emerald-100 rounded-2xl focus:border-emerald-500" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-emerald-700 mb-2">
                <Leaf className="w-5 h-5" /> Evapotranspiration (mm/day)
              </label>
              <input type="number" name="et" value={formData.et} onChange={handleChange}
                placeholder="e.g. 5.2" step="0.1" className="w-full px-5 py-4 border border-emerald-100 rounded-2xl focus:border-emerald-500" />
            </div>
          </form>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full mt-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-lg">
            {loading ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : "Get AI Irrigation Recommendation"}
          </button>
        </div>

        {/* Result - Auto Scroll Target */}
        <div ref={resultRef}>
          {result && (
            <div className="bg-white rounded-3xl shadow p-10">
              <h2 className="text-2xl font-semibold mb-8 text-center text-emerald-900">AI Recommendation</h2>
              {/* ... rest of result content same as previous ... */}
              <div className="text-center mb-10">
                <div className="text-7xl mb-4">{result.recommendation.includes("Irrigate") ? "💧" : "🌱"}</div>
                <h3 className="text-5xl font-bold text-emerald-900">{result.recommendation}</h3>
                <p className="text-xl text-emerald-600 mt-2">Urgency: {result.urgency}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="bg-emerald-50 p-8 rounded-2xl">
                  <p className="font-medium text-lg mb-2">💧 Water Requirement</p>
                  <p className="text-4xl font-bold text-emerald-700">{result.water_amount_mm} mm</p>
                </div>
                <div className="bg-emerald-50 p-8 rounded-2xl">
                  <p className="font-medium text-lg mb-2">📝 Advice</p>
                  <p className="text-lg leading-relaxed">{result.advice}</p>
                </div>
              </div>

              {result.insights && result.insights.length > 0 && (
                <div className="mt-8 bg-amber-50 p-8 rounded-2xl">
                  <p className="font-medium flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5" /> Key Insights</p>
                  <ul className="space-y-3">
                    {result.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-3">• <span>{insight}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}