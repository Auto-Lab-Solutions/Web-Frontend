import { useState } from "react";
import { Star } from "lucide-react";
import googleLogo from '/google-logo.svg';

const GoogleReviewCard = ({ reviewData }) => {
  const { name, review, rating, avatarSrc = [] } = reviewData;
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="max-w-sm rounded-xl border shadow-md p-5 space-y-3 sm:mx-0 mx-8 sm:h-auto transition-transform duration-300 hover:scale-[1.03] bg-card-primary text-text-primary border-border-primary"
    >
      {/* User Info */}
      <div className="flex items-center space-x-3">
        <img
          src={avatarSrc}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=144&background=FF6B6B&color=fff`;
          }}
        />
        <div>
          <p className="font-semibold text-lg text-text-primary">{name}</p>
        </div>
        <img
          src={googleLogo}
          alt="Google Logo"
          className="w-8 h-8 ml-auto"
        />
      </div>

      {/* Rating */}
      <div className="flex space-x-1">
        {Array.from({ length: rating }).map((_, index) => (
          <Star
            key={index}
            className="w-5 h-5 text-yellow-500 fill-yellow-500"
          />
        ))}
      </div>

      {/* Review Text */}
      <div className="text-base text-text-secondary relative">
        <p className={expanded ? "" : "sm:line-clamp-4 line-clamp-5"}>
          {review}
        </p>
        {review.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-blue-400 hover:underline text-sm font-medium"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    </div>
  );
};


export default GoogleReviewCard;
