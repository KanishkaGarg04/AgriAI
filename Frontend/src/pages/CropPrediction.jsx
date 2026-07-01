import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sprout,
  Thermometer,
  Droplets,
  CloudRain,
  FlaskConical,
  Leaf,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function CropPrediction() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          N: Number(formData.N),
          P: Number(formData.P),
          K: Number(formData.K),
          temperature: Number(formData.temperature),
          humidity: Number(formData.humidity),
          ph: Number(formData.ph),
          rainfall: Number(formData.rainfall),
        }),
      });

      const data = await response.json();

      console.log(data);

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend.");
    }

    setLoading(false);
  };

  const fields = [
    {
      label: "Nitrogen (N)",
      name: "N",
      icon: Leaf,
      placeholder: "e.g. 90",
    },
    {
      label: "Phosphorus (P)",
      name: "P",
      icon: FlaskConical,
      placeholder: "e.g. 42",
    },
    {
      label: "Potassium (K)",
      name: "K",
      icon: Sprout,
      placeholder: "e.g. 43",
    },
    {
      label: "Temperature (°C)",
      name: "temperature",
      icon: Thermometer,
      placeholder: "e.g. 25",
    },
    {
      label: "Humidity (%)",
      name: "humidity",
      icon: Droplets,
      placeholder: "e.g. 80",
    },
    {
      label: "Soil pH",
      name: "ph",
      icon: FlaskConical,
      placeholder: "e.g. 6.5",
    },
    {
      label: "Rainfall (mm)",
      name: "rainfall",
      icon: CloudRain,
      placeholder: "e.g. 200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFC] pt-32 pb-20 px-6">

      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-brand-green mb-4">
            🌾 AI Crop Prediction
          </h1>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Enter your soil nutrients and weather conditions.
            Our AI model will recommend the most suitable crop along with
            confidence score and fertilizer advice.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handlePredict}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100"
        >
          <div className="grid md:grid-cols-2 gap-6">

            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <div key={field.name}>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                  </label>

                  <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500">

                    <Icon className="text-green-600 mr-3" size={20} />

                    <input
                      type="number"
                      step="any"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required
                      className="w-full outline-none"
                    />

                  </div>

                </div>
              );
            })}

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
                "🌾 Predict Best Crop"
              )}

            </button>

          </div>

        </motion.form>

        {/* =============================
              RESULT SECTION
              PART 2 STARTS HERE
        ============================== */}
                {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-8"
          >

            {/* Recommended Crop */}

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

              <h2 className="text-2xl font-bold text-brand-green mb-6">
                🌾 AI Recommendation
              </h2>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

                <div>

                  <p className="text-gray-500 mb-2">
                    Recommended Crop
                  </p>

                  <h1 className="text-5xl font-extrabold text-green-700">
                    🌾 {result.recommended_crop.charAt(0).toUpperCase() + result.recommended_crop.slice(1)}
                  </h1>

                </div>

                <div className="md:w-80">

                  <div className="flex justify-between mb-2">

                    <span className="font-medium">
                      Confidence
                    </span>

                    <span className="font-bold text-green-700">
                      {result.confidence}%
                    </span>

                  </div>

                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${result.confidence}%`,
                      }}
                      transition={{
                        duration: 1,
                      }}
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

            {/* Top Predictions */}

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

              <h2 className="text-2xl font-bold mb-6">
                🥇 Top Predictions
              </h2>

              <div className="space-y-4">

                {result.top_predictions.map((item, index) => (

                  <div
                    key={index}
                    className="flex justify-between items-center bg-green-50 rounded-xl p-4"
                  >

                    <span className="font-semibold text-lg">

                      {index === 0 && "🥇 "}
                      {index === 1 && "🥈 "}
                      {index === 2 && "🥉 "}

                      {item.crop.charAt(0).toUpperCase() + item.crop.slice(1)}

                    </span>

                    <span className="font-bold text-green-700">

                      {item.confidence}%

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Fertilizer Advice */}

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

              <h2 className="text-2xl font-bold mb-6">

                🌱 Fertilizer Advisor

              </h2>

              <div className="grid md:grid-cols-2 gap-8">

                <div>

                  <h3 className="font-bold text-lg mb-3">

                    Ideal NPK

                  </h3>

                  <div className="space-y-2 text-gray-700">

                    <p>

                      Nitrogen :
                      {" "}
                      {result.fertilizer_advice.ideal_npk.N}

                    </p>

                    <p>

                      Phosphorus :
                      {" "}
                      {result.fertilizer_advice.ideal_npk.P}

                    </p>

                    <p>

                      Potassium :
                      {" "}
                      {result.fertilizer_advice.ideal_npk.K}

                    </p>

                  </div>

                </div>

                <div>

                  <h3 className="font-bold text-lg mb-3">

                    Your Soil

                  </h3>

                  <div className="space-y-2 text-gray-700">

                    <p>

                      Nitrogen :
                      {" "}
                      {result.fertilizer_advice.user_npk.N}

                    </p>

                    <p>

                      Phosphorus :
                      {" "}
                      {result.fertilizer_advice.user_npk.P}

                    </p>

                    <p>

                      Potassium :
                      {" "}
                      {result.fertilizer_advice.user_npk.K}

                    </p>

                  </div>

                </div>

              </div>

              <div className="mt-8">

                <h3 className="font-bold text-lg mb-4">

                  Suggestions

                </h3>

                <div className="space-y-3">

                  {result.fertilizer_advice.suggestions.map(
                    (suggestion, index) => (

                      <div
                        key={index}
                        className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg"
                      >

                        ✅ {suggestion}

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* Link to dedicated fertilizer prediction page */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/fertilizer-prediction", {
                      state: { crop: result.recommended_crop },
                    })
                  }
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold transition"
                >
                  Get Exact Fertilizer Dosage
                  <ArrowRight size={18} />
                </button>
              </div>

            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
