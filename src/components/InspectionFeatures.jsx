import { ReactLenis } from "lenis/dist/lenis-react";
import { motion } from "framer-motion";
import { FaCarBattery  } from 'react-icons/fa';
import { PiEngineFill } from "react-icons/pi";
import { TbPresentationAnalyticsFilled } from "react-icons/tb";
import { GiCarWheel } from "react-icons/gi";
import { SiSpeedtest } from "react-icons/si";
import { GiSteeringWheel } from "react-icons/gi";
import { FaHistory } from "react-icons/fa";
import SectionHeading from "./SectionHeading";

const InspectionFeatures = () => {
  return (
      <ReactLenis
        root
        options={{
          // Learn more -> https://github.com/darkroomengineering/lenis?tab=readme-ov-file#instance-settings
          lerp: 0.05,
        }}
      >
        <Schedule />
      </ReactLenis>
  );
};

const Schedule = () => {
  const iconStyle = "text-500 size-8";
  return (
    <section
      id="inspection-features"
      className="mx-auto max-w-5xl sm:px-4 px-8 text-white py-4"
    >
      <SectionHeading text="What’s Included in a Car Pre-Purchase Inspection" />

      <ScheduleItem text="Engine Condition: Inspect for leaks, corrosion, and assess the condition of belts and hoses">
        <PiEngineFill className={iconStyle} />
      </ScheduleItem>

      <ScheduleItem text="Battery Testing and Comprehensive Indicator Check">
        <FaCarBattery className={iconStyle} />
      </ScheduleItem>

      <ScheduleItem text="Brakes, Suspension, Driveline, Exhaust">
        <SiSpeedtest className={iconStyle} />
      </ScheduleItem>

      <ScheduleItem text="Steering and Suspension, Wheel Vibrations and shudders,Pulling to One Side">
        <GiSteeringWheel className={iconStyle} />
      </ScheduleItem>

      <ScheduleItem text="Tyre Condition, Consistent, Reguler Wear Patterns Alighnment, Balancing Assessment">
        <GiCarWheel className={iconStyle} />
      </ScheduleItem>

      <ScheduleItem text="Full Car Scan Report and Live Data analize to find any Hidden Troubles">
        <TbPresentationAnalyticsFilled className={iconStyle} />
      </ScheduleItem>

      <ScheduleItem text="Accident, Stolen Ownership History Check and recall status">
        <FaHistory className={iconStyle} />
      </ScheduleItem>

      <ScheduleItem text="And many more...">
        {/* <CgMoreO className={iconStyle} /> */}
      </ScheduleItem>
    </section>
  );
};

const ScheduleItem = ({ text, children  }) => {
  return (
    <motion.div
      initial={{ y: 48, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.75 }}
      className="mb-9 flex items-center justify-between border-b border-zinc-800 px-3 pb-9"
    >
      <div className="flex items-center justify-center gap-4 flex-1">
        {children}
        <p className="text-xl font-semibold ">{text}</p>
      </div>
    </motion.div>
  );
};

export default InspectionFeatures;