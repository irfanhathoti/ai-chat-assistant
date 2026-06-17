interface LogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  className?: string;
}

/**
 * The app's brand mark: a gradient chat bubble with an AI "spark" inside.
 * Self-contained SVG (no external asset) so it scales crisply everywhere and
 * stays in sync with the indigo→violet→purple brand gradient. The matching
 * favicon lives at app/icon.svg — update both together if the mark changes.
 */
export default function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AI Chat"
    >
      <defs>
        <linearGradient
          id="aiChatLogoGradient"
          x1="6"
          y1="4"
          x2="42"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6366F1" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Chat bubble with a tail at the bottom-left */}
      <path
        d="M24 4C12.4 4 3 11.8 3 21.5C3 26.3 5.3 30.6 9 33.7C8.6 36.8 7.2 39.6 5.2 41.8C5 42 4.9 42.3 5 42.6C5.1 42.9 5.4 43 5.7 43C10 42.9 13.6 41.3 16.3 39.2C18.7 40 21.3 40.5 24 40.5C35.6 40.5 45 32.7 45 23C45 13.3 35.6 4 24 4Z"
        fill="url(#aiChatLogoGradient)"
      />

      {/* Main four-point spark */}
      <path
        d="M23.5 11C24 17 27.5 20.5 33.5 21C27.5 21.5 24 25 23.5 31C23 25 19.5 21.5 13.5 21C19.5 20.5 23 17 23.5 11Z"
        fill="white"
      />

      {/* Small accent spark */}
      <path
        d="M33 10C33.2 12.3 34.7 13.8 37 14C34.7 14.2 33.2 15.7 33 18C32.8 15.7 31.3 14.2 29 14C31.3 13.8 32.8 12.3 33 10Z"
        fill="white"
        fillOpacity="0.85"
      />
    </svg>
  );
}
