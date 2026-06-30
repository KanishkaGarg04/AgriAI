import { motion } from 'framer-motion';

const features = [
  { title: "Market Price Prediction", desc: "LSTM-powered forecasting for maximum harvest ROI.", link: "/features/price-prediction" },
  { title: "Fertilizer Recommendation", desc: "AI-optimized nutrient balancing for soil health.", link: "/features/fertilizer-advisor" },
  { title: "AI Voice Assistant", desc: "Multilingual, hands-free farming support.", link: "/features/voice-assistant" },
  { title: "Crop Health Monitoring", desc: "YOLOv8 real-time disease and pest detection.", link: "/features/health-monitor" },
  { title: "Smart Irrigation Advisor", desc: "Hyper-local weather & moisture-based control.", link: "/features/irrigation" },
  { title: "Digital Farm Record", desc: "Secure, blockchain-ready farm documentation.", link: "/features/records" }
];

export default function ExploreFeatures() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-black text-center mb-16">Platform Capabilities</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.a
            key={i}
            href={f.link}
            whileHover={{ y: -10 }}
            className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-brand-green font-bold text-xl">
              {i + 1}
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-brand-green transition">{f.title}</h3>
            <p className="text-gray-500 mb-6">{f.desc}</p>
            <span className="text-brand-green font-bold text-sm">Explore Module →</span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}