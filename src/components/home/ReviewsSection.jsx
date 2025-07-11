import React, { useRef, useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { cn } from "@/lib/utils"; // ShadCN utility for class merging
import GoogleRatingCard from "@/components/home/GoogleRatingCard";
import GoogleReviewCard from "@/components/home/GoogleReviewCard";
import { topReviews } from "@/utils/reviews";
import SectionHeading from "@/components/common/SectionHeading";

function ReviewsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
        perView: 1,
        spacing: 12,
    },
    breakpoints: {
        "(min-width: 640px)": {
        slides: { perView: 2, spacing: 16 },
        },
        "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 16 },
        },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    });


  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full px-auto bg-background-primary pb-12">
      <SectionHeading text="What Our Customers Say" />

      <GoogleRatingCard />

      {/* Slider */}
      <div
        ref={sliderRef}
        className="keen-slider py-10 max-w-5xl mx-auto"
      >
        {topReviews.map((review, i) => (
          <div key={i} className="keen-slider__slide rounded-xl overflow-hidden">
            <GoogleReviewCard reviewData={review} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute left-0 right-0 flex justify-center space-x-2">
        {Array.from({ length: topReviews.length }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              currentSlide === idx ? "bg-white" : "bg-gray-600"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default ReviewsSection;