import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sprout,
  FlaskConical,
  Leaf,
  Loader2,
  Ruler,
  Recycle,
} from "lucide-react";

const CROP_OPTIONS = [
  "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas", "mothbeans",
  "mungbean", "blackgram", "lentil", "pomegranate", "banana", "mango",
  "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya",
  "coconut", "cotton", "jute", "coffee",
];

export default function FertilizerPrediction() {
  // If navigated here from the Crop Prediction page (e.g. via a "Get
  // Fertilizer Advice" button passing { crop, N, P, K } as route state),
  // pre-fill the form with those values. Otherwise the page works fully
  // standalone with manual entry.
  const location = useLocation();
  const prefill = location.state || {};

  const [formData, setFormData] = useState({
    crop: prefill.crop || "",
    N: prefill.N ?? "",
    P: prefill.P ?? "",
    K: prefill.K ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Step 2 (dosage) state — kept separate since it's only requested
  // after the user sees the step-1 recommendation
  const [landArea, setLandArea] = useState("");
  const [useOrganic, setUseOrganic] = useState(false);
  const [dosageLoading, setDosageLoading] = useState(false);
  const [dosage, setDosage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);
    setDosage(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict-fertilizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop: formData.crop,
          N: Number(formData.N),
          P: Number(formData.P),
          K: Number(formData.K),
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        alert(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend.");
    }

    setLoading(false);
  };

  const handleGetDosage = async () => {
    if (!landArea || Number(landArea) <= 0) {
      alert("Please enter your land area in hectares.");
      return;
    }

    setDosageLoading(true);
    setDosage(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/fertilizer-dosage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop: formData.crop,
          N: Number(formData.N),
          P: Number(formData.P),
          K: Number(formData.K),
          land_area_ha: Number(landArea),
          use_organic: useOrganic,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        alert(data.error || "Something went wrong.");
        setDosageLoading(false);
        return;
      }

      setDosage(data);
    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend.");
    }

    setDosageLoading(false);
  };

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  return (
    <div className="min-h-screen bg-[#FDFEFC] pt-32 pb-20 px-6">

      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-brand-green mb-4">
            🌱 AI Fertilizer Prediction
          </h1>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select your crop and current soil nutrients.
            Our AI model will tell you exactly what your soil needs,
            with both chemical and organic fertilizer options.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handlePredict}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100"
        >
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Crop
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500">
                <Sprout className="text-green-600 mr-3" size={20} />

                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  required
                  className="w-full outline-none bg-transparent"
                >
                  <option value="" disabled>
                    Select a crop
                  </option>
                  {CROP_OPTIONS.map((crop) => (
                    <option key={crop} value={crop}>
                      {capitalize(crop)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nitrogen (N) in soil
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500">
                <Leaf className="text-green-600 mr-3" size={20} />

                <input
                  type="number"
                  step="any"
                  name="N"
                  value={formData.N}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                  required
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phosphorus (P) in soil
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500">
                <FlaskConical className="text-green-600 mr-3" size={20} />

                <input
                  type="number"
                  step="any"
                  name="P"
                  value={formData.P}
                  onChange={handleChange}
                  placeholder="e.g. 80"
                  required
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Potassium (K) in soil
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500">
                <Sprout className="text-green-600 mr-3" size={20} />

                <input
                  type="number"
                  step="any"
                  name="K"
                  value={formData.K}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  required
                  className="w-full outline-none"
                />
              </div>
            </div>

          </div>

          <div className="text-center mt-10">

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-green hover:bg-green-700 text-white px-10 py-4 rounded-full text-lg font-semibold transition"
            >

              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  AI is analyzing...
                </span>
              ) : (
                "🌱 Get Fertilizer Recommendation"
              )}

            </button>

          </div>

        </motion.form>

        {/* =============================
              RESULT SECTION
        ============================== */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-8"
          >

            {/* Condition + confidence */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

              <h2 className="text-2xl font-bold text-brand-green mb-6">
                🌱 Soil Condition
              </h2>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

                <div>
                  <p className="text-gray-500 mb-2">
                    Detected Condition
                  </p>

                  <h1 className="text-4xl font-extrabold text-green-700">
                    {result.condition.replace(/_/g, " ")}
                  </h1>
                </div>

                <div className="md:w-80">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Confidence</span>
                    <span className="font-bold text-green-700">
                      {result.confidence}%
                    </span>
                  </div>

                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${
                        result.confidence >= 80
                          ? "bg-green-600"
                          : result.confidence >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* NPK comparison */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

              <h2 className="text-2xl font-bold mb-6">
                📊 NPK Comparison
              </h2>

              <div className="grid md:grid-cols-2 gap-8">

                <div>
                  <h3 className="font-bold text-lg mb-3">Ideal NPK</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>Nitrogen : {result.ideal_npk.N}</p>
                    <p>Phosphorus : {result.ideal_npk.P}</p>
                    <p>Potassium : {result.ideal_npk.K}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3">Your Soil</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>Nitrogen : {result.input_npk.N}</p>
                    <p>Phosphorus : {result.input_npk.P}</p>
                    <p>Potassium : {result.input_npk.K}</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Fertilizer recommendation */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

              <h2 className="text-2xl font-bold mb-6">
                🧪 Recommended Fertilizer
              </h2>

              <div className="grid md:grid-cols-2 gap-6">

                <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-lg">
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    Chemical Option
                  </p>
                  <p className="font-bold text-lg text-green-800">
                    {result.chemical_fertilizer}
                  </p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-600 p-5 rounded-lg">
                  <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <Recycle size={14} /> Organic Alternative
                  </p>
                  <p className="font-bold text-lg text-amber-800">
                    {result.organic_alternative}
                  </p>
                </div>

              </div>

              {/* Dosage trigger */}
              <div className="mt-10 border-t pt-8">

                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Ruler size={20} className="text-green-600" />
                  Want the exact quantity for your field?
                </h3>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">

                  <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 md:w-64">
                    <input
                      type="number"
                      step="any"
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="Land area (hectares)"
                      className="w-full outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={useOrganic}
                      onChange={(e) => setUseOrganic(e.target.checked)}
                      className="accent-green-600"
                    />
                    Use organic alternative instead
                  </label>

                  <button
                    type="button"
                    onClick={handleGetDosage}
                    disabled={dosageLoading}
                    className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full font-semibold transition"
                  >
                    {dosageLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Calculating...
                      </span>
                    ) : (
                      "Calculate Dosage"
                    )}
                  </button>

                </div>

              </div>

              {/* Dosage result */}
              {dosage && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  {dosage.note ? (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                      ℹ️ {dosage.note}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dosage.dosage_plan.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-green-50 rounded-xl p-4"
                        >
                          <span className="font-semibold">
                            {item.fertilizer}
                          </span>
                          <span className="font-bold text-green-700">
                            {item.total_kg_needed} kg total
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
