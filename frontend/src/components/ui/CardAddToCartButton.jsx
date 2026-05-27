import React from 'react';

const CardAddToCartButton = ({
  onClick,
  disabled,
  inCart,
  priceLabel,
  label,
  className,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={['card-add-cart-button', className].filter(Boolean).join(' ')}
      aria-label={label}
    >
      <span className="card-add-cart-default">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="card-add-cart-icon"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <span dir="auto" className="unicode-bidi-plaintext">
          {label}
        </span>
      </span>

      <span className="card-add-cart-hover" aria-hidden="true">
        <svg
          viewBox="0 0 320 512"
          width="12.5"
          height="20"
          className="card-add-cart-price-icon"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M160 0c17.7 0 32 14.3 32 32V67.7c1.6 .2 3.1 .4 4.7 .7c.4 .1 .7 .1 1.1 .2l48 8.8c17.4 3.2 28.9 19.9 25.7 37.2s-19.9 28.9-37.2 25.7l-47.5-8.7c-31.3-4.6-58.9-1.5-78.3 6.2s-27.2 18.3-29 28.1c-2 10.7-.5 16.7-.5 16.7 1.8 3.9 5.5 8.3 12.8 13.2 16.3 10.7 41.3 17.7 73.7 26.3l2.9 .8c28.6 7.6 63.6 16.8 89.6 33.8 14.2 9.3 27.6 21.9 35.9 39.5 8.5 17.9 10.3 37.9 6.4 59.2-6.9 38-33.1 63.4-65.6 76.7-13.7 5.6-28.6 9.2-44.4 11V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.1c-.4-.1-.9-.1-1.3-.2l-.2 0 0 0c-24.4-3.8-64.5-14.3-91.5-26.3-16.1-7.2-23.4-26.1-16.2-42.2s26.1-23.4 42.2-16.2c20.9 9.3 55.3 18.5 75.2 21.6 31.9 4.7 58.2 2 76-5.3 16.9-6.9 24.6-16.9 26.8-28.9 1.9-10.6 .4-16.7-1.3-20.4-1.9-4-5.6-8.4-13-13.3-16.4-10.7-41.5-17.7-74-26.3l-2.8-.7 0 0C119.4 279.3 84.4 270 58.4 253c-14.2-9.3-27.5-22-35.8-39.6-8.4-17.9-10.1-37.9-6.1-59.2C23.7 116 52.3 91.2 84.8 78.3c13.3-5.3 27.9-8.9 43.2-11V32c0-17.7 14.3-32 32-32z"
          />
        </svg>
        <span className="unicode-bidi-plaintext">{priceLabel}</span>
      </span>
    </button>
  );
};

export default CardAddToCartButton;
