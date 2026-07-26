import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviews?: number;
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

export default function Rating({ value, max = 5, size = 'md', showValue = true, reviews }: RatingProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              className={`${sizes[size]} ${filled ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
            />
          );
        })}
      </div>
      {showValue && (
        <span className={`font-semibold text-slate-700 dark:text-slate-300 ${textSizes[size]}`}>
          {value.toFixed(1)}
        </span>
      )}
      {reviews != null && (
        <span className={`text-slate-500 ${textSizes[size]}`}>({reviews})</span>
      )}
    </div>
  );
}
