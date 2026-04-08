/**
 * ExploreBackground.jsx
 *
 * Hand-drawn style doodles spread across the Explore page background.
 * Creates a whimsical, sketch-art atmosphere with warm aesthetic.
 */

import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'

export default function ExploreBackground() {
  const theme = useThemeStore((state) => state.getTheme())
  const color = theme.primary

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Top-left cluster */}
      <svg
        className="absolute top-8 left-6 w-32 h-32"
        viewBox="0 0 100 100"
        fill="none"
        style={{ opacity: 0.12 }}
      >
        {/* 4-pointed star */}
        <path
          d="M50 10 L55 40 L85 50 L55 60 L50 90 L45 60 L15 50 L45 40 Z"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Top scattered dots */}
      <svg
        className="absolute top-16 left-44 w-24 h-24"
        viewBox="0 0 80 80"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        <circle cx="10" cy="20" r="3" fill={color} />
        <circle cx="35" cy="10" r="2" fill={color} />
        <circle cx="60" cy="25" r="4" fill={color} />
        <circle cx="25" cy="45" r="2.5" fill={color} />
        <circle cx="55" cy="55" r="3" fill={color} />
      </svg>

      {/* Top-right wavy line */}
      <svg
        className="absolute top-12 right-24 w-40 h-20"
        viewBox="0 0 120 50"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <path
          d="M5 25 Q20 10 35 25 Q50 40 65 25 Q80 10 95 25 Q110 40 115 25"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Top-right circle outline */}
      <svg
        className="absolute top-32 right-12 w-20 h-20"
        viewBox="0 0 60 60"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        <circle
          cx="30"
          cy="30"
          r="22"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 3"
        />
      </svg>

      {/* Left side - small star */}
      <svg
        className="absolute top-1/4 left-8 w-16 h-16"
        viewBox="0 0 50 50"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        <path
          d="M25 5 L28 20 L43 25 L28 30 L25 45 L22 30 L7 25 L22 20 Z"
          fill={color}
        />
      </svg>

      {/* Left side - squiggle */}
      <svg
        className="absolute top-1/3 left-4 w-12 h-32"
        viewBox="0 0 30 100"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <path
          d="M15 5 C5 20 25 35 15 50 C5 65 25 80 15 95"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Left middle - outlined circle */}
      <svg
        className="absolute top-1/2 left-16 w-14 h-14 -translate-y-1/2"
        viewBox="0 0 40 40"
        fill="none"
        style={{ opacity: 0.09 }}
      >
        <circle cx="20" cy="20" r="15" stroke={color} strokeWidth="2.5" fill="none" />
        <circle cx="20" cy="20" r="6" fill={color} />
      </svg>

      {/* Right side - scattered plus signs */}
      <svg
        className="absolute top-1/4 right-8 w-20 h-40"
        viewBox="0 0 60 120"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <path d="M30 10 L30 30 M20 20 L40 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M15 60 L15 75 M8 67.5 L22 67.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M45 90 L45 105 M38 97.5 L52 97.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Right middle - 6-pointed star */}
      <svg
        className="absolute top-2/5 right-20 w-24 h-24"
        viewBox="0 0 70 70"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        <path
          d="M35 5 L40 25 L60 20 L45 35 L60 50 L40 45 L35 65 L30 45 L10 50 L25 35 L10 20 L30 25 Z"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>

      {/* Bottom-left cluster */}
      <svg
        className="absolute bottom-32 left-10 w-28 h-28"
        viewBox="0 0 90 90"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        {/* Cloud-like blob */}
        <path
          d="M20 60 Q10 50 20 40 Q15 25 35 25 Q45 15 60 25 Q75 25 75 40 Q85 50 75 60 Q70 75 50 70 Q30 75 20 60"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Bottom-left dots */}
      <svg
        className="absolute bottom-20 left-40 w-32 h-16"
        viewBox="0 0 100 50"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <circle cx="10" cy="25" r="2" fill={color} />
        <circle cx="30" cy="15" r="3" fill={color} />
        <circle cx="50" cy="30" r="2.5" fill={color} />
        <circle cx="70" cy="20" r="2" fill={color} />
        <circle cx="90" cy="35" r="3.5" fill={color} />
      </svg>

      {/* Bottom center - wavy horizontal */}
      <svg
        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 h-12"
        viewBox="0 0 200 40"
        fill="none"
        style={{ opacity: 0.06 }}
      >
        <path
          d="M5 20 Q25 5 45 20 Q65 35 85 20 Q105 5 125 20 Q145 35 165 20 Q185 5 195 20"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Bottom-right - spiral */}
      <svg
        className="absolute bottom-28 right-16 w-20 h-20"
        viewBox="0 0 60 60"
        fill="none"
        style={{ opacity: 0.09 }}
      >
        <path
          d="M30 30 Q30 25 35 25 Q40 25 40 30 Q40 38 30 38 Q20 38 20 28 Q20 18 32 18 Q45 18 45 32 Q45 48 28 48"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Bottom-right - scattered stars */}
      <svg
        className="absolute bottom-12 right-32 w-40 h-24"
        viewBox="0 0 120 70"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        {/* Small 4-point star */}
        <path
          d="M20 35 L23 30 L28 33 L23 36 Z"
          fill={color}
        />
        {/* Medium star */}
        <path
          d="M70 20 L73 12 L80 17 L76 25 L83 30 L75 30 L70 38 L68 30 L60 28 L67 23 Z"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        {/* Tiny dots */}
        <circle cx="100" cy="45" r="2" fill={color} />
        <circle cx="45" cy="55" r="1.5" fill={color} />
      </svg>

      {/* Far bottom-right corner */}
      <svg
        className="absolute bottom-8 right-6 w-24 h-24"
        viewBox="0 0 70 70"
        fill="none"
        style={{ opacity: 0.11 }}
      >
        {/* Triangle */}
        <path
          d="M35 15 L55 50 L15 50 Z"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>

      {/* Center-left - diamond */}
      <svg
        className="absolute top-3/5 left-6 w-12 h-16"
        viewBox="0 0 40 50"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <path
          d="M20 5 L35 25 L20 45 L5 25 Z"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>

      {/* Center-right - arc */}
      <svg
        className="absolute top-3/5 right-10 w-16 h-12"
        viewBox="0 0 50 35"
        fill="none"
        style={{ opacity: 0.07 }}
      >
        <path
          d="M5 30 Q25 5 45 30"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Top center - small scattered elements */}
      <svg
        className="absolute top-6 left-1/3 w-48 h-16"
        viewBox="0 0 150 50"
        fill="none"
        style={{ opacity: 0.07 }}
      >
        <circle cx="20" cy="25" r="4" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M60 20 L65 25 L60 30 L55 25 Z" fill={color} />
        <circle cx="100" cy="30" r="2" fill={color} />
        <circle cx="130" cy="18" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>

      {/* Additional scattered elements for fullness */}
      <svg
        className="absolute top-2/3 left-1/4 w-8 h-8"
        viewBox="0 0 30 30"
        fill="none"
        style={{ opacity: 0.06 }}
      >
        <circle cx="15" cy="15" r="8" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
      </svg>

      <svg
        className="absolute top-1/5 right-1/3 w-10 h-10"
        viewBox="0 0 30 30"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <path d="M15 5 L17 13 L25 15 L17 17 L15 25 L13 17 L5 15 L13 13 Z" fill={color} />
      </svg>

      {/* Extra bottom scattered */}
      <svg
        className="absolute bottom-40 left-1/3 w-6 h-6"
        viewBox="0 0 20 20"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        <circle cx="10" cy="10" r="6" fill={color} />
      </svg>

      <svg
        className="absolute bottom-24 right-1/3 w-8 h-8"
        viewBox="0 0 25 25"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <path d="M12.5 2 L15 10 L23 12.5 L15 15 L12.5 23 L10 15 L2 12.5 L10 10 Z" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  )
}
