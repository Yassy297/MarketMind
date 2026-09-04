import cn from 'classnames';

const BrandMark = ({
  className,
  size = 32,
  alt = 'MarketMind'
}: {
  className?: string;
  size?: number;
  alt?: string;
}) => (
  <img
    src="/marketmind-logo.svg"
    alt={alt}
    width={size}
    height={size}
    className={cn('shrink-0 rounded-lg', className)}
  />
);

export default BrandMark;
