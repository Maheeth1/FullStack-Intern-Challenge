import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({
  initialRating = 0,
  totalStars = 5,
  onChange,
  readOnly = false
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (index) => {
    if (readOnly) return;

    const newRating = index + 1;
    setRating(newRating);

    if (onChange) {
      onChange(newRating);
    }
  };

  const handleMouseEnter = (index) => {
    if (readOnly) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className="flex">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;

        return (
          <FaStar
            key={index}
            className={`cursor-${readOnly ? 'default' : 'pointer'} w-6 h-6 transition-colors`}
            color={
              starValue <= (hoverRating || rating)
                ? '#FFBA5A'  // Yellow for active stars
                : '#a9a9a9'  // Gray for inactive stars
            }
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
