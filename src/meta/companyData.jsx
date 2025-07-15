import { ShieldCheck, SearchCheck, Users, Settings2, FileText, Smile, BookCheck, 
  BadgeCheck, MapPinCheckInside, Search, Leaf, Brain, Star, Wallet, DollarSign, CalendarClock
} from 'lucide-react';
import imageJanitha from "/mechanics/janitha.webp";

const iconStyles = "w-8 h-8 text-highlight-primary";

const companyName = "Auto Lab Solutions";
const companyPhone = "+61 451 237 048";
const companyLocalPhone = "0451 237 048";
const companyEmail = "autolabsolutions1@gmail.com";
const companyDesc = "We deliver cutting-edge automotive inspection and repair solutions with state-of-the-art technology, expert service, and a commitment to safety and quality."

const companyAddress = "70b Division St, Welshpool WA 6106, Australia";
const locationDesc = "Proudly based in Southern River, our team travels across Perth to reach you—whether you're in Midland, Mandurah, Joondalup, or anywhere in between.";
const companyMapLink = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3443.1358526901827!2d115.93484588994839!3d-31.988424921166033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2a32bd151492dc2f%3A0x63cadc40b16b2176!2sPerth%20Cars%20Pre-Purchase%20Inspection%20Service!5e0!3m2!1sen!2slk!4v1750826884985!5m2!1sen!2slk";

const coverageAreas = ['Perth', 'Rockingham', 'Mandurah', 'Fremantle'];

const aboutShort = "Making informed car buying decisions is crucial. That’s why we provide detailed insights and expert evaluations you can trust.";
const ourMission = "Our mission is to provide thorough, transparent, and technology-backed inspections that empower you to make confident vehicle purchasing decisions. We aim to bring clarity and peace of mind to every customer, every time.";
const ourVision = "Our vision is to be Perth’s most trusted car inspection service—known for precision, integrity, and customer-first service. We envision a future where every vehicle buyer feels informed, secure, and confident.";

const whoWeAreDesc = [
    "Based in Southern River, we proudly serve Perth and surrounding suburbs with expert mobile automotive services. While our core focus is pre-purchase car inspections, we also provide mobile battery replacement, oil and filter changes, paint correction, and more.",
    "Our skilled team delivers workshop-level service at your doorstep, assessing mechanical, structural, and safety aspects of your vehicle — so you can make confident decisions wherever you are."
];
const whoWeArePoints = [
  {
    icon: <BookCheck className={iconStyles} />,
    title: "Registered Service",
    description: "We are a registered service provider with the Department of Transport, ensuring compliance and quality in every inspection.",
  },
  {
    icon: <BadgeCheck className={iconStyles} />,
    title: "Certified Professionals",
    description: "Our team consists of fully qualified and insured mechanics, dedicated to delivering the highest standards of service.",
  },
  {
    icon: <MapPinCheckInside className={iconStyles} />,
    title: "Located in Perth",
    description: "We are proudly based in Southern River, serving all of Perth and surrounding suburbs with our mobile inspection services.",
  },
];

const whyChooseUsDesc = "We go the extra mile to ensure your satisfaction and peace of mind.";
const whyChooseUsPoints = [
  {
    icon: <Brain className={iconStyles} />,
    title: "Expert Technicians",
    description: "Our team consists of highly trained and experienced mechanics who are passionate about delivering top-notch service.",
  },
  {
    icon: <Search className={iconStyles} />,
    title: "In-Depth Inspections",
    description: "We conduct thorough checks to uncover hidden issues, ensuring you know exactly what you’re buying.",
  },
  {
    icon: <FileText className={iconStyles} />,
    title: "Detailed Reports",
    description: "Receive comprehensive, easy-to-understand reports that highlight key findings and recommendations.",
  },
  {
    icon: <Star className={iconStyles} />,
    title: "Trusted by Thousands",
    description: "Join our community of satisfied customers who trust us for their vehicle inspection needs.",
  },
  {
    icon: <Leaf className={iconStyles} />,
    title: "Eco-Friendly Practices",
    description: "We prioritize sustainability by using eco-friendly products and practices in our inspections and services.",
  },
  {
    icon: <CalendarClock className={iconStyles} />,   
    title: "Flexible Scheduling",
    description: "We work around your schedule, offering convenient booking options to fit your busy life.",
  },
  {
    icon: <DollarSign className={iconStyles} />,
    title: "Affordable Pricing",
    description: "We offer competitive rates without compromising on quality, ensuring you get the best value for your investment.",
  },
  {
    icon: <Wallet className={iconStyles} />,
    title: "Flexible Pay Methods",
    description: "We provide flexibility in payment options, either online or in-person, to suit your convenience.",
  }
];

const ourValues = [
  {
    title: "Comprehensive Inspection",
    desc: "Your safety is our top priority. We inspect every detail to ensure you’re fully informed before making your purchase.",
    icon: <SearchCheck className={iconStyles} />,
  },
  {
    title: "Expert Team",
    desc: "Our professional inspectors are experienced, reliable, and focused on delivering unbiased, high-quality reports.",
    icon: <Users className={iconStyles} />,
  },
  {
    title: "Advanced Equipment",
    desc: "We use cutting-edge diagnostic tools to identify mechanical, electrical, or structural issues that may go unnoticed otherwise.",
    icon: <Settings2 className={iconStyles} />,
  },
  {
    title: "Personalized Reports",
    desc: "Every report is tailored to the vehicle, including service history and condition. No templates, just clear insights.",
    icon: <FileText className={iconStyles} />,
  },
  {
    title: "Customer Satisfaction",
    desc: "We ensure a smooth, transparent process from start to finish—your satisfaction is always our priority.",
    icon: <Smile className={iconStyles} />,
  },
  {
    title: "Peace of Mind",
    desc: "Our comprehensive inspections give you confidence in your purchase decision, protecting your investment for years to come.",
    icon: <ShieldCheck className={iconStyles} />,
  },
];

const mechanics = [
    {
        name: "Janitha",
        location: "Perth",
        imgSrc: imageJanitha,
        description: "With over 5 years of hands-on experience, Janitha ensures each inspection is done thoroughly and professionally.",
        linkedInUrl: "https://www.linkedin.com/in/janitha31"
    }
];

export {
    companyName,
    companyPhone,
    companyLocalPhone,
    companyEmail,
    companyDesc,

    companyAddress,
    locationDesc,
    companyMapLink,
    coverageAreas,

    aboutShort,
    ourMission,
    ourVision,

    whoWeAreDesc,
    whoWeArePoints,
    whyChooseUsDesc,
    whyChooseUsPoints,
    ourValues,

    mechanics
}
