import { motion } from "framer-motion";
import { Wrench, ShieldCheck, CalendarCheck } from "lucide-react";

const services = [
  {
    icon: <Wrench className="w-6 h-6 text-green-400" />,
    title: "Detailing & Repairs",
    description: "From paint correction to full detailing, we keep your vehicle looking its best.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-green-400" />,
    title: "Paint Protection",
    description: "High-grade ceramic coating and paint protection film for long-lasting shine and safety.",
  },
  {
    icon: <CalendarCheck className="w-6 h-6 text-green-400" />,
    title: "Scheduled Maintenance",
    description: "Timely service to prevent future issues and preserve resale value.",
  },
];

const WhoWeAreSection = () => {
  return (
    <section className="py-16 bg-zinc-950 text-white px-4">
      <motion.div
        className="max-w-5xl mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg p-8 sm:p-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-center">Who We Are</h2>
        <p className="text-zinc-400 text-center max-w-3xl mx-auto mb-8">
          We are a passionate team of vehicle care specialists offering top-tier auto detailing, protection, and maintenance services tailored to meet every customer's needs. Quality, reliability, and care are at the heart of everything we do.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 shadow-md flex flex-col items-start gap-3"
            >
              <div className="flex items-center gap-2">
                {service.icon}
                <h3 className="text-lg font-semibold text-white">{service.title}</h3>
              </div>
              <p className="text-sm text-zinc-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default WhoWeAreSection;
