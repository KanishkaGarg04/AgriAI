import { useState } from "react";
import {
  Upload,
  Loader2,
  Sparkles,
  Leaf,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));

    setResult(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Please upload a crop leaf image first.");
      return;
    }

    setLoading(true);
    setError("");

    // Temporary Demo Response
    setTimeout(() => {
      setResult({
        disease: "Tomato Early Blight",
        confidence: 96.4,
        health_score: 89,
      });

      setLoading(false);
    }, 1800);
  };
    return (
    <div className="min-h-screen bg-[#F8FBF8] py-16">
      <div className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center mb-14">

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-green-50 shadow-sm mb-6">
            <Leaf className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-emerald-950">
            AI Crop Disease Detection
          </h1>

          <p className="mt-4 text-lg text-emerald-700 max-w-2xl mx-auto leading-8">
            Upload a crop leaf image and let KrishiMitra identify diseases
            using deep learning in just a few seconds.
          </p>

        </div>

        {/* Upload Card */}

        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-8 md:p-10">

          <div className="mb-8">

            <h2 className="text-2xl font-semibold text-emerald-900">
              Upload Crop Leaf
            </h2>

            <p className="mt-2 text-emerald-600">
              Supported formats: JPG, JPEG, PNG
            </p>

          </div>

          <label className="block cursor-pointer">

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="border-2 border-dashed border-emerald-200 rounded-3xl p-12 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all">

              <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-5" />

              <h3 className="text-xl font-semibold text-emerald-900">
                Click to upload a leaf image
              </h3>

              <p className="text-emerald-600 mt-2">
                Drag & drop is optional — click anywhere in this area.
              </p>

            </div>

          </label>
                  {/* Image Preview */}

        {preview && (
          <div className="mt-8">

            <img
              src={preview}
              alt="Leaf Preview"
              className="w-full max-h-[420px] object-contain rounded-3xl border border-emerald-100 bg-emerald-50"
            />

          </div>
        )}

        {/* Analyze Button */}

        <div className="mt-8">

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition-all text-white py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Leaf...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Leaf
              </>
            )}
          </button>

        </div>

        {/* Error */}

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

      {result && (
                  <div>

            {/* Header */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-emerald-100 px-8 py-6">

              <div>

                <h2 className="text-2xl font-bold text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                  AI Diagnosis
                </h2>

                <p className="text-emerald-600 mt-1">
                  Generated using the uploaded crop leaf image.
                </p>

              </div>

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium">

                <ShieldCheck className="w-5 h-5" />

                AI Verified

              </span>

            </div>

            {/* Body */}

            <div className="p-8">

              <div className="text-center mb-10">

                <div className="text-6xl mb-4">
                  🌿
                </div>

                <h3 className="text-4xl font-bold text-emerald-950">
                  {result.disease}
                </h3>

                <p className="text-emerald-600 mt-3">
                  AI-powered disease classification based on the uploaded leaf image.
                </p>

              </div>

              {/* Metrics */}

              <div className="grid md:grid-cols-3 gap-5 mb-8">

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">

                  <p className="text-sm text-emerald-700 mb-2">
                    Confidence
                  </p>

                  <h4 className="text-3xl font-bold text-emerald-950">
                    {result.confidence}%
                  </h4>

                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6">

                  <p className="text-sm text-sky-700 mb-2">
                    Health Score
                  </p>

                  <h4 className="text-3xl font-bold text-sky-900">
                    {result.health_score}/100
                  </h4>

                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">

                  <p className="text-sm text-amber-700 mb-2">
                    Risk Level
                  </p>

                  <h4 className="text-3xl font-bold text-amber-900">
                    Moderate
                  </h4>

                </div>

              </div>
                            {/* Recommendations */}

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">

                <h4 className="text-xl font-semibold text-emerald-950 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Suggested Actions
                </h4>

                <ul className="space-y-3 text-emerald-800">

                  <li>✅ Remove infected leaves to reduce disease spread.</li>

                  <li>✅ Inspect nearby plants for similar symptoms.</li>

                  <li>✅ Ensure proper air circulation around the crop.</li>

                  <li>✅ Consult a local agricultural expert before applying fungicides.</li>

                </ul>

              </div>

              {/* Analyze Another */}

              <div className="mt-8 text-center">

                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreview(null);
                    setResult(null);
                    setError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 px-6 py-3 text-emerald-700 hover:bg-emerald-50 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Analyze Another Image
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}