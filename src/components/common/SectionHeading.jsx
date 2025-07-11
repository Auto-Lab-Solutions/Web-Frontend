import FadeInItem from "./FadeInItem";

const SectionHeading = ({ text }) => {
  return (
    <div className="w-full text-center mb-4">
      <FadeInItem element="h1" direction="x" className="section-heading">
        {text}
      </FadeInItem>
    </div>
  )
}

export default SectionHeading;
