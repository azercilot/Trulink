import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className, size = 32 }: LogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
    >
      {/* Rounded square background */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="#00C853"
      />
      
      {/* Chain link / connection ring - left */}
      <ellipse
        cx="18"
        cy="24"
        rx="7"
        ry="9"
        stroke="white"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Chain link / connection ring - right (overlapping) */}
      <ellipse
        cx="30"
        cy="24"
        rx="7"
        ry="9"
        stroke="white"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Checkmark overlay */}
      <path
        d="M16 24L22 30L34 18"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default Logo;
