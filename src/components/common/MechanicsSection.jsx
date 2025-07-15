import FadeInItem from "@/components/common/FadeInItem";
import { mechanics } from "../../metaData";
import SectionHeading from "@/components/common/SectionHeading";
import { Linkedin } from "lucide-react";

const MechanicsSection = () => {
    return (
        <section className="bg-background-secondary py-16">
            <SectionHeading text="Our Expert Mechanics" />
            <div className="mb-8"/>
            {mechanics.map((mechanic, index) => (
                <FadeInItem
                    key={index}
                    element="div"
                    direction="y"
                    className="container mx-auto px-6 md:flex items-center gap-12 mb-12"
                >
                    <img
                        src={mechanic.imgSrc}
                        alt={`${mechanic.name} – Mechanic`}
                        className="w-40 h-40 rounded-full object-cover mx-auto md:mx-0 shadow-lg border-4 border-border-primary hover:border-highlight-primary transition"
                    />
                    <div className="text-center md:text-left mt-6 md:mt-0">
                        <h3 className="text-2xl font-semibold text-text-primary">{mechanic.name} - {mechanic.location}</h3>
                        <p className="mt-4 text-text-secondary">
                            {mechanic.description}
                        </p>
                        {mechanic.linkedInUrl && (
                            <div className="mt-4">
                                <a
                                    href={mechanic.linkedInUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-button-primary hover:bg-highlight-primary text-text-tertiary font-semibold rounded-full transition-colors duration-200 shadow-sm hover:shadow-md text-sm"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    Connect on LinkedIn
                                </a>
                            </div>
                        )}
                    </div>
                </FadeInItem>
            ))}
            <FadeInItem
                element="div"
                direction="y"
                className="text-center mt-12 px-8"
            >
                <p className="text-text-secondary">
                    Our mechanics are dedicated to providing the best pre-purchase inspection services in Perth. With their expertise, you can buy your next vehicle with confidence.
                </p>
            </FadeInItem>
        </section>
    );
};

export default MechanicsSection;
