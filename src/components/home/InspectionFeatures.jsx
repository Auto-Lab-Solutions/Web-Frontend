import { motion } from "framer-motion";
import {
  FaCarBattery,
  FaHistory,
} from "react-icons/fa";
import { PiEngineFill } from "react-icons/pi";
import { TbPresentationAnalyticsFilled } from "react-icons/tb";
import { GiCarWheel, GiSteeringWheel } from "react-icons/gi";
import { SiSpeedtest } from "react-icons/si";
import SectionHeading from "@/components/common/SectionHeading";

const features = [
  {
    icon: <PiEngineFill className="w-7 h-7 text-highlight-primary" />,
    title: "Engine Condition",
    description: "Inspect for leaks, corrosion, and assess belts and hoses.",
  },
  {
    icon: <FaCarBattery className="w-7 h-7 text-highlight-primary" />,
    title: "Battery & Indicators",
    description: "Battery testing and comprehensive dashboard indicator check.",
  },
  {
    icon: <SiSpeedtest className="w-7 h-7 text-highlight-primary" />,
    title: "Brake & Exhaust",
    description: "Brakes, suspension, driveline, and exhaust system inspection.",
  },
  {
    icon: <GiSteeringWheel className="w-7 h-7 text-highlight-primary" />,
    title: "Steering & Vibrations",
    description: "Check for wheel shudders, pulling, and steering responsiveness.",
  },
  {
    icon: <GiCarWheel className="w-7 h-7 text-highlight-primary" />,
    title: "Tyre & Alignment",
    description: "Tyre wear patterns, balancing, and alignment analysis.",
  },
  {
    icon: <TbPresentationAnalyticsFilled className="w-7 h-7 text-highlight-primary" />,
    title: "Full Diagnostic Scan",
    description: "Live data scan to detect hidden faults and system health.",
  },
  {
    icon: <FaHistory className="w-7 h-7 text-highlight-primary" />,
    title: "Ownership History",
    description: "Check for accident records, theft, recalls, and ownership history.",
  },
  {
    icon: null,
    title: "And much more...",
    description: "Our inspection covers every aspect of vehicle health and safety.",
  },
];

const InspectionFeatures = () => {
  return (
    <section className="bg-zinc-950 py-16 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeading text="What’s Included in a Car Pre-Purchase Inspection" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-zinc-900 rounded-xl p-6 border border-zinc-700 shadow-md"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-2">
                {feature.icon}
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-sm text-zinc-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InspectionFeatures;
