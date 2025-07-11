import { FaStar } from 'react-icons/fa';
import { reviewsSummary } from '@/utils/reviews';
import googleLogo from '/google-logo.svg';

const GoogleRatingCard = () => {
  return (
    <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-zinc-900 rounded-lg shadow-md border-3 border-highlight-primary p-4 text-center">
      <div className="flex items-center justify-center mb-2">
        <img
          src={googleLogo}
          alt="Google logo"
          className="w-8 h-8 mr-2"
        />
        <span className="card-heading">Google Rating</span>
      </div>

      <div className="flex items-center justify-center mb-1">
        <span className="text-2xl font-bold text-yellow-400 mr-2">
          {reviewsSummary.rating.toFixed(1)}
        </span>
        <div className="flex">
          {[...Array(reviewsSummary.starsCount)].map((_, i) => (
            <FaStar key={i} className="text-yellow-400 text-xl" />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <p className="card-description underline hover:text-blue-500 transition-colors">
          Read our {reviewsSummary.reviewsCount} reviews
        </p>
      </div>
    </div>
  );
};

export default GoogleRatingCard;
