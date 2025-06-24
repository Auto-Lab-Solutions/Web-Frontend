import { FaStar } from 'react-icons/fa';
import { reviewsSummary } from '../utils/reviews';
import googleLogo from '/google-logo.svg';

const GoogleRatingCard = () => {
  return (
    <div className="max-w-xs mx-auto bg-zinc-900 rounded-lg shadow-md border-4 border-green-500 p-4 text-center">
      <div className="flex items-center justify-center mb-2">
        <img
          src={googleLogo}
          alt="Google logo"
          className="w-8 h-8 mr-2"
        />
        <span className="text-lg font-semibold text-white">Google Rating</span>
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

      <p className="text-sm text-zinc-400 underline cursor-pointer hover:text-blue-400">
        Read our {reviewsSummary.reviewsCount} reviews
      </p>
    </div>
  );
};

export default GoogleRatingCard;
