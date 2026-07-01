import { useState, useRef, useEffect } from "react";
import {
  Droplets,
  Thermometer,
  CloudRain,
  Leaf,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function SmartIrrigationAdvisor() {
  const [formData, setFormData] = useState({
    moisture: "",
    humidity: "",
    temp: "",
    et: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resultRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        moisture: parseFloat(formData.moisture),
        humidity: parseFloat(formData.humidity),
        temp: parseFloat(formData.temp),
        et: parseFloat(formData.et || 4.5),
      };

      const response = await fetch(
        "http://127.0.0.1:5000/irrigation/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate recommendation.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the AI service. Please ensure the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  const priorityStyle = {
    High: {
      badge: "bg-red-100 text-red-700",
      icon: "🔴",
    },
    Medium: {
      badge: "bg-yellow-100 text-yellow-700",
      icon: "🟡",
    },
    Low: {
      badge: "bg-emerald-100 text-emerald-700",
      icon: "🟢",
    },
  };
    return (
    <div className="min-h-screen bg-[#F8FBF8] py-16">
      <div className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-green-50 shadow-sm mb-6">
            <Droplets className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-emerald-950">
            Smart Irrigation Advisor
          </h1>

          <p className="mt-4 text-lg text-emerald-700 max-w-2xl mx-auto leading-8">
            Enter your latest field conditions and let AI recommend the most
            efficient irrigation strategy.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-8 md:p-10">

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-900">
              Enter Field Conditions
            </h2>

            <p className="mt-2 text-emerald-600">
              Sample values are acceptable for demonstration purposes.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            {[
              {
                name: "moisture",
                label: "Soil Moisture (%)",
                placeholder: "e.g. 25",
                icon: Droplets,
              },
              {
                name: "humidity",
                label: "Air Humidity (%)",
                placeholder: "e.g. 65",
                icon: CloudRain,
              },
              {
                name: "temp",
                label: "Temperature (°C)",
                placeholder: "e.g. 30",
                icon: Thermometer,
              },
              {
                name: "et",
                label: "Evapotranspiration (mm/day)",
                placeholder: "e.g. 5.3",
                icon: Leaf,
              },
            ].map((field) => (
              <div key={field.name}>

                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-emerald-800">
                  <field.icon className="w-4 h-4 text-emerald-600" />
                  {field.label}
                </label>

                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  step="0.1"
                  required
                  className="w-full rounded-2xl border border-emerald-200 px-5 py-4 text-lg outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />

              </div>
            ))}

            <div className="md:col-span-2 mt-2">

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition-all text-white py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Recommendation...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Recommendation
                  </>
                )}
              </button>

            </div>

          </form>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div ref={resultRef} className="mt-10">
          {result && (
  <div className="space-y-8">

    {/* Recommendation Card */}
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-emerald-100 px-8 py-6">

        <div>
          <h2 className="text-2xl font-bold text-emerald-950 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            AI Irrigation Recommendation
          </h2>

          <p className="text-emerald-600 mt-1">
            Generated using your field conditions.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
            priorityStyle[result.urgency]?.badge
          }`}
        >
          <span>{priorityStyle[result.urgency]?.icon}</span>
          {result.urgency} Priority
        </span>

      </div>

      {/* Body */}
      <div className="p-8">

        {/* Main Recommendation */}

        <div className="text-center mb-10">

          <div className="text-6xl mb-4">
            {result.recommendation.startsWith("No")
              ? "🌱"
              : "💧"}
          </div>

          <h3 className="text-4xl font-bold text-emerald-950">
            {result.recommendation}
          </h3>

          <p className="text-emerald-600 mt-3">
            AI-powered recommendation based on the submitted inputs.
          </p>

        </div>

        {/* Summary Cards */}

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">

            <p className="text-sm text-emerald-700 mb-2">
              Water Required
            </p>

            <h4 className="text-3xl font-bold text-emerald-950">
              {result.water_amount_mm} mm
            </h4>

          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6">

            <p className="text-sm text-sky-700 mb-2">
              Recommended Method
            </p>

            <h4 className="text-2xl font-semibold text-sky-900">
              {result.recommendation.startsWith("No")
                ? "Monitoring"
                : "Drip Irrigation"}
            </h4>

          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">

            <p className="text-sm text-amber-700 mb-2">
              Confidence
            </p>

            <h4 className="text-2xl font-semibold text-amber-900">
              {result.urgency === "High"
                ? "High"
                : result.urgency === "Medium"
                ? "Moderate"
                : "Good"}
            </h4>

          </div>

        </div>

        {/* Why */}

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">

          <h4 className="font-semibold text-emerald-950 mb-3">
            Why this recommendation?
          </h4>

          <p className="text-emerald-800 leading-7">
            {result.advice}
          </p>

        </div>

      </div>

    </div>
          {/* Key Insights */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-8">

        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h3 className="text-xl font-semibold text-emerald-950">
            Key Insights
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-5">

          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
            <div className="flex items-center gap-2 text-emerald-700 mb-3">
              <Clock3 className="w-5 h-5" />
              <span className="text-sm font-medium">
                Next Irrigation
              </span>
            </div>

            <p className="text-2xl font-bold text-emerald-950">
              {result.recommendation.startsWith("No") ? "24+ hrs" : "1 day"}
            </p>
          </div>

          <div className="rounded-2xl bg-sky-50 border border-sky-100 p-5">
            <div className="flex items-center gap-2 text-sky-700 mb-3">
              <Droplets className="w-5 h-5" />
              <span className="text-sm font-medium">
                Estimated Water Saving
              </span>
            </div>

            <p className="text-2xl font-bold text-sky-900">
              {Math.max(0, Math.round((parseFloat(formData.et || 4.5) * 2)))}%
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
            <div className="flex items-center gap-2 text-amber-700 mb-3">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                System Status
              </span>
            </div>

            <p className="text-2xl font-bold text-amber-900">
              Operational
            </p>
          </div>

        </div>

        {result.insights?.length > 0 && (
          <div className="mt-8">

            <h4 className="text-lg font-semibold text-emerald-950 mb-4">
              Field Observations
            </h4>

            <div className="space-y-3">

              {result.insights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />

                  <p className="text-emerald-900">
                    {item}
                  </p>
                </div>
              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  )}

</div>

</div>
</div>

);
}
