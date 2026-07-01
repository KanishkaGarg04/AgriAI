import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";

export default function ComingSoon({ feature = "This Feature" }) {
  return (
    <div className="min-h-screen bg-[#FDFEFC] pt-32 pb-20 px-6 flex items-center justify-center">

      <div className="max-w-2xl mx-auto text-center">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-green-50 rounded-full p-6">
              <Clock className="text-brand-green" size={48} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold text-brand-green mb-4">
            Coming Soon
          </h1>

          <p className="text-2xl font-semibold text-gray-700 mb-4">
            {feature}
          </p>

          <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
            Our team is actively building this module. It will be available
            very soon as part of the KrishiMitra platform.
          </p>

          {/* Progress bar — decorative, shows "in progress" feel */}
          <div className="w-full max-w-sm mx-auto mb-10">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Development Progress</span>
              <span className="font-semibold text-brand-green">70%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-brand-green rounded-full"
              />
            </div>
          </div>

          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

        </motion.div>

      </div>

    </div>
  );
}
