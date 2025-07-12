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
import FadeInItem from "../common/FadeInItem";

const iconStyles = "w-7 h-7 text-highlight-primary";
const features = [
  {
    icon: <PiEngineFill className={iconStyles} />,
    title: "Engine Condition",
    description: "Inspect for leaks, corrosion, and assess belts and hoses.",
  },
  {
    icon: <FaCarBattery className={iconStyles} />,
    title: "Battery & Indicators",
    description: "Battery testing and comprehensive dashboard indicator check.",
  },
  {
    icon: <SiSpeedtest className={iconStyles} />,
    title: "Brake & Exhaust",
    description: "Brakes, suspension, driveline, and exhaust system inspection.",
  },
  {
    icon: <GiSteeringWheel className={iconStyles} />,
    title: "Steering & Vibrations",
    description: "Check for wheel shudders, pulling, and steering responsiveness.",
  },
  {
    icon: <GiCarWheel className={iconStyles} />,
    title: "Tyre & Alignment",
    description: "Tyre wear patterns, balancing, and alignment analysis.",
  },
  {
    icon: <TbPresentationAnalyticsFilled className={iconStyles} />,
    title: "Full Diagnostic Scan",
    description: "Live data scan to detect hidden faults and system health.",
  },
  {
    icon: <FaHistory className={iconStyles} />,
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
    <section className="bg-background-secondary py-16 px-4 text-text-primary">
      <div className="max-w-6xl mx-auto">
        <SectionHeading text="What’s Included in a Car Pre-Purchase Inspection" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {features.map((feature, idx) => (
            <FadeInItem
              key={idx}
              element="div"
              direction="y"
              scale={1.02}
              className="bg-background-primary rounded-xl p-6 border border-border-primary shadow-md flex flex-col items-start gap-3"
            >
              <div className="flex items-center gap-2 justify-center md:justify-start w-full">
                {feature.icon}
                <h3 className="card-heading">{feature.title}</h3>
              </div>
              <p className="card-description">{feature.description}</p>
            </FadeInItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InspectionFeatures;
