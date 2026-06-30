import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -30 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 1.2, ease: "easeOut" }} 
      >
        <h1 className="text-6xl font-black leading-tight text-gray-900">
          Precision Agriculture, <span className="text-brand-green">Optimized.</span>
        </h1>
        <p className="text-xl text-gray-600 mt-6 mb-8">
          KrishiMitra integrates real-time soil data, hyper-local weather, and market trends to ensure every acre is profitable and sustainable.
        </p>
        <div className="flex gap-4">
          <button className="bg-brand-green text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition duration-300">View Dashboard</button>
          
          {/* UPDATED: Wrapped in an anchor tag to link to the ID we set in ExploreFeatures.jsx */}
          <a href="/#capabilities">
            <button className="border border-gray-200 px-8 py-4 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition duration-300">
              Explore Features
            </button>
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 1.5, ease: "easeOut" }} 
        className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100"
      >
        <h3 className="font-bold text-lg mb-6">Real-time Farm Metrics</h3>
        <div className="space-y-6">
          {[
            { label: "Soil Moisture", value: "64%", color: "text-blue-500" },
            { label: "Optimal Sowing Date", value: "Oct 12", color: "text-brand-green" },
            { label: "Price Trend", value: "+12.4%", color: "text-emerald-600" }
          ].map((m, i) => (
            <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4">
              <span className="text-gray-500">{m.label}</span>
              <span className={`font-black ${m.color}`}>{m.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}