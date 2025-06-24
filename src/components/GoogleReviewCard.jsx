import { Star } from "lucide-react";
import googleLogo from '/google-logo.svg';

const GoogleReviewCard = ({ reviewData }) => {
  const { name, review, rating, avatarSrc = [] } = reviewData;

  return (
    <div 
      className="max-w-sm rounded-xl border border-zinc-700 shadow-md p-6 bg-zinc-900 text-zinc-200 space-y-3 sm:mx-0 mx-8 sm:h-[23rem] h-[28rem] transition-transform duration-300 hover:scale-[1.03]"
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
          <p className="font-semibold text-zinc-100">{name}</p>
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
            className="w-4 h-4 text-yellow-500 fill-yellow-500"
          />
        ))}
      </div>

      {/* Review Text */}
      <p className="text-sm text-zinc-400 sm:line-clamp-12 line-clamp-16">
        {review}
      </p>
    </div>
  );
};

export default GoogleReviewCard;
