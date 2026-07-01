import React, { useState } from "react";
import { TrendingUp, Leaf, CalendarDays, IndianRupee, Loader2, AlertCircle } from "lucide-react";

export default function MarketPricePrediction() {
  const [crop, setCrop] = useState("rice");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleForecast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null); // Clear previous results on a new submission
    
    try {
      const payload = {
        crop: crop,
        recent_prices: [2100, 2110, 2130, 2125, 2140, 2160, 2155, 2170, 2180, 2190] 
      };

      const response = await fetch("http://127.0.0.1:5000/api/market/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      setResult({ status: "error", message: "Failed to connect to the server. Please ensure the backend is running." });
    } finally {
      setLoading(false);
    }
  };

  // Helper logic to safely determine if there is an error in the payload
  const isError = result && (result.status === "error" || result.error);
  const errorMessage = result ? (result.message || result.error) : "";

  return (
    <div className="min-h-screen bg-[#f7fdf9] flex flex-col items-center pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header Section */}
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-[#064e3b] tracking-tight mb-4">
          Market Price Forecast
        </h1>
        <p className="text-lg text-emerald-700">
          Leverage LSTM AI models to predict upcoming market trends and maximize your harvest ROI.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl shadow-emerald-100/50 overflow-hidden border border-emerald-50">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-[#064e3b] mb-2">Forecast Parameters</h2>
          
          <p className="text-emerald-600 mb-8 text-sm">
            Due to limited dataset availability, select from our 5 supported crops to generate a 24-hour AI price prediction.
          </p>

          <form onSubmit={handleForecast} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Crop Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-emerald-800">
                  <Leaf className="w-4 h-4 mr-2 text-emerald-600" />
                  Select Crop
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-emerald-50/30 text-emerald-900"
                >
                  <option value="rice">Rice (Paddy)</option>
                  <option value="wheat">Wheat</option>
                  <option value="maize">Maize</option>
                  <option value="cotton">Cotton</option>
                  <option value="soybean">Soybean</option>
                </select>
              </div>

              {/* Time Horizon */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-emerald-800">
                  <CalendarDays className="w-4 h-4 mr-2 text-emerald-600" />
                  Forecast Horizon
                </label>
                <input
                  type="text"
                  disabled
                  value="Next 24 Hours"
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-[#059669] hover:bg-[#047857] text-white font-bold py-4 rounded-xl transition-all duration-200 flex justify-center items-center shadow-lg shadow-emerald-200 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Generate AI Forecast
                </>
              )}
            </button>
          </form>
        </div>

        {/* --- FIXED: Error Feedback Card --- */}
        {isError && (
          <div className="bg-red-50 p-6 mx-8 mb-8 rounded-2xl border border-red-100 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-md font-semibold text-red-900">Prediction Pipeline Error</h4>
              <p className="text-sm text-red-600 mt-1">{errorMessage || "The model could not verify data patterns."}</p>
            </div>
          </div>
        )}

        {/* Results Section - Updated with Warm Neutral Palette */}
        {result && result.status === "success" && (
          <div className="bg-[#fffdf5] p-8 sm:p-10 border-t border-amber-100">
            <h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-amber-600" />
              Prediction Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Predicted Price Card */}
              <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm shadow-amber-50 flex items-center space-x-4">
                <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
                  <IndianRupee className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 font-medium">Predicted Price</p>
                  <p className="text-3xl font-black text-amber-950">
                    ₹{result.forecasted_price}
                    <span className="text-sm font-medium text-amber-600 ml-1">/ Quintal</span>
                  </p>
                </div>
              </div>

              {/* Market Action Card */}
              <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm shadow-amber-50 flex items-center space-x-4">
                <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 font-medium">Market Action</p>
                  <p className="text-xl font-bold text-amber-950">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}