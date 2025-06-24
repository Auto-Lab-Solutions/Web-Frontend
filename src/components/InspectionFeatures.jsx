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
  const iconStyle = "text-500 sm:size-8 mr-1";
  return (
    <section
      id="inspection-features"
      className="mx-auto max-w-5xl sm:px-4 pl-6 pr-5 text-white py-4"
    >
      <SectionHeading text="What’s Included in a Car Pre-Purchase Inspection" />

      <ScheduleItem text="Engine Condition: Inspect for leaks, corrosion, and assess the condition of belts and hoses">
        <PiEngineFill className={`${iconStyle} size-28`} />
      </ScheduleItem>

      <ScheduleItem text="Battery Testing and Comprehensive Indicator Check">
        <FaCarBattery className={`${iconStyle} size-15`} />
      </ScheduleItem>

      <ScheduleItem text="Brakes, Suspension, Driveline, Exhaust">
        <SiSpeedtest className={`${iconStyle} size-12`} />
      </ScheduleItem>

      <ScheduleItem text="Steering and Suspension, Wheel Vibrations and shudders,Pulling to One Side">
        <GiSteeringWheel className={`${iconStyle} size-26`} />
      </ScheduleItem>

      <ScheduleItem text="Tyre Condition, Consistent, Reguler Wear Patterns Alighnment, Balancing Assessment">
        <GiCarWheel className={`${iconStyle} size-28`} />
      </ScheduleItem>

      <ScheduleItem text="Full Car Scan Report and Live Data analize to find any Hidden Troubles">
        <TbPresentationAnalyticsFilled className={`${iconStyle} size-26`} />
      </ScheduleItem>

      <ScheduleItem text="Accident, Stolen Ownership History Check and recall status">
        <FaHistory className={`${iconStyle} size-17 ml-1 mr-2`} />
      </ScheduleItem>

      <ScheduleItem text="And many more...">
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
        <p className="text-xl font-normal ">{text}</p>
      </div>
    </motion.div>
  );
};

export default InspectionFeatures;