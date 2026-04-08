/**
 * PageDoodles.jsx
 *
 * Centralized hand-drawn doodle background for all pages.
 * Creates a whimsical, sketch-art atmosphere with warm aesthetic.
 *
 * Props:
 *   variant - 'full' (default) | 'sparse' | 'corners' - density of doodles
 *   className - additional classes for the container
 */

import { useThemeStore } from '../../store/useThemeStore'

export default function PageDoodles({ variant = 'full', className = '' }) {
  const theme = useThemeStore((state) => state.getTheme())
  const color = theme.primary

  // Base opacity based on variant - INCREASED for better visibility
  const baseOpacity = variant === 'sparse' ? 0.18 : variant === 'corners' ? 0.22 : 0.25

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`} aria-hidden="true">

      {/* ═══════════════════════════════════════════════════════════════════════════
          TOP LEFT CLUSTER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <svg
        className="absolute top-8 left-6 w-32 h-32"
        viewBox="0 0 100 100"
        fill="none"
        style={{ opacity: baseOpacity + 0.05 }}
      >
        {/* 4-pointed star */}
        <path
          d="M50 10 L55 40 L85 50 L55 60 L50 90 L45 60 L15 50 L45 40 Z"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Scattered dots - top area */}
      <svg
        className="absolute top-14 left-44 w-24 h-24"
        viewBox="0 0 80 80"
        fill="none"
        style={{ opacity: baseOpacity + 0.02 }}
      >
        <circle cx="10" cy="20" r="4" fill={color} />
        <circle cx="35" cy="10" r="3" fill={color} />
        <circle cx="60" cy="25" r="5" fill={color} />
        <circle cx="25" cy="45" r="3.5" fill={color} />
        <circle cx="55" cy="55" r="4" fill={color} />
        <circle cx="70" cy="40" r="2.5" fill={color} />
      </svg>

      {/* Additional top-left element */}
      <svg
        className="absolute top-36 left-10 w-16 h-16"
        viewBox="0 0 60 60"
        fill="none"
        style={{ opacity: baseOpacity }}
      >
        <path
          d="M30 5 L35 25 L55 30 L35 35 L30 55 L25 35 L5 30 L25 25 Z"
          fill={color}
        />
      </svg>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TOP RIGHT CLUSTER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <svg
        className="absolute top-10 right-24 w-40 h-20"
        viewBox="0 0 120 50"
        fill="none"
        style={{ opacity: baseOpacity }}
      >
        {/* Wavy line */}
        <path
          d="M5 25 Q20 10 35 25 Q50 40 65 25 Q80 10 95 25 Q110 40 115 25"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute top-32 right-10 w-20 h-20"
        viewBox="0 0 60 60"
        fill="none"
        style={{ opacity: baseOpacity + 0.03 }}
      >
        {/* Dashed circle */}
        <circle
          cx="30"
          cy="30"
          r="24"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="5 4"
        />
      </svg>

      {/* Additional top element */}
      <svg
        className="absolute top-6 right-1/3 w-12 h-12"
        viewBox="0 0 40 40"
        fill="none"
        style={{ opacity: baseOpacity + 0.02 }}
      >
        <path d="M20 5 L23 17 L35 20 L23 23 L20 35 L17 23 L5 20 L17 17 Z" fill={color} />
      </svg>

      {/* ═══════════════════════════════════════════════════════════════════════════
          LEFT SIDE ELEMENTS
      ═══════════════════════════════════════════════════════════════════════════ */}
      {variant !== 'corners' && (
        <>
          <svg
            className="absolute top-1/4 left-6 w-18 h-18"
            viewBox="0 0 50 50"
            fill="none"
            style={{ opacity: baseOpacity + 0.02 }}
          >
            {/* Small filled star */}
            <path
              d="M25 5 L28 20 L43 25 L28 30 L25 45 L22 30 L7 25 L22 20 Z"
              fill={color}
            />
          </svg>

          <svg
            className="absolute top-1/3 left-3 w-12 h-32"
            viewBox="0 0 30 100"
            fill="none"
            style={{ opacity: baseOpacity }}
          >
            {/* Squiggle */}
            <path
              d="M15 5 C5 20 25 35 15 50 C5 65 25 80 15 95"
              stroke={color}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <svg
            className="absolute top-1/2 left-16 w-14 h-14 -translate-y-1/2"
            viewBox="0 0 40 40"
            fill="none"
            style={{ opacity: baseOpacity + 0.01 }}
          >
            {/* Concentric circles */}
            <circle cx="20" cy="20" r="16" stroke={color} strokeWidth="2.5" fill="none" />
            <circle cx="20" cy="20" r="7" fill={color} />
          </svg>

          <svg
            className="absolute top-2/3 left-8 w-10 h-10"
            viewBox="0 0 30 30"
            fill="none"
            style={{ opacity: baseOpacity }}
          >
            {/* Plus sign */}
            <path d="M15 5 L15 25 M5 15 L25 15" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          RIGHT SIDE ELEMENTS
      ═══════════════════════════════════════════════════════════════════════════ */}
      {variant !== 'corners' && (
        <>
          <svg
            className="absolute top-1/4 right-6 w-18 h-40"
            viewBox="0 0 60 120"
            fill="none"
            style={{ opacity: baseOpacity }}
          >
            {/* Plus signs */}
            <path d="M30 10 L30 30 M20 20 L40 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M15 60 L15 75 M8 67.5 L22 67.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M45 90 L45 105 M38 97.5 L52 97.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          <svg
            className="absolute top-2/5 right-20 w-24 h-24"
            viewBox="0 0 70 70"
            fill="none"
            style={{ opacity: baseOpacity + 0.02 }}
          >
            {/* 6-pointed star outline */}
            <path
              d="M35 5 L40 25 L60 20 L45 35 L60 50 L40 45 L35 65 L30 45 L10 50 L25 35 L10 20 L30 25 Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>

          <svg
            className="absolute top-3/5 right-10 w-12 h-12"
            viewBox="0 0 40 40"
            fill="none"
            style={{ opacity: baseOpacity + 0.01 }}
          >
            {/* Small diamond */}
            <path d="M20 5 L35 20 L20 35 L5 20 Z" stroke={color} strokeWidth="2.5" fill="none" />
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          BOTTOM LEFT CLUSTER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <svg
        className="absolute bottom-32 left-8 w-28 h-28"
        viewBox="0 0 90 90"
        fill="none"
        style={{ opacity: baseOpacity + 0.02 }}
      >
        {/* Cloud-like blob */}
        <path
          d="M20 60 Q10 50 20 40 Q15 25 35 25 Q45 15 60 25 Q75 25 75 40 Q85 50 75 60 Q70 75 50 70 Q30 75 20 60"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute bottom-20 left-40 w-14 h-14"
        viewBox="0 0 50 50"
        fill="none"
        style={{ opacity: baseOpacity }}
      >
        {/* Heart shape */}
        <path
          d="M25 45 L10 28 Q5 18 15 15 Q25 12 25 22 Q25 12 35 15 Q45 18 40 28 Z"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {variant === 'full' && (
        <svg
          className="absolute bottom-16 left-56 w-32 h-14"
          viewBox="0 0 100 50"
          fill="none"
          style={{ opacity: baseOpacity }}
        >
          {/* Scattered dots */}
          <circle cx="10" cy="25" r="3" fill={color} />
          <circle cx="30" cy="15" r="4" fill={color} />
          <circle cx="50" cy="30" r="3.5" fill={color} />
          <circle cx="70" cy="20" r="3" fill={color} />
          <circle cx="90" cy="35" r="4.5" fill={color} />
        </svg>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          BOTTOM CENTER
      ═══════════════════════════════════════════════════════════════════════════ */}
      {variant === 'full' && (
        <svg
          className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 h-12"
          viewBox="0 0 200 40"
          fill="none"
          style={{ opacity: baseOpacity - 0.02 }}
        >
          {/* Long wavy line */}
          <path
            d="M5 20 Q25 5 45 20 Q65 35 85 20 Q105 5 125 20 Q145 35 165 20 Q185 5 195 20"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          BOTTOM RIGHT CLUSTER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <svg
        className="absolute bottom-28 right-16 w-20 h-20"
        viewBox="0 0 60 60"
        fill="none"
        style={{ opacity: baseOpacity + 0.01 }}
      >
        {/* Spiral */}
        <path
          d="M30 30 Q30 25 35 25 Q40 25 40 30 Q40 38 30 38 Q20 38 20 28 Q20 18 32 18 Q45 18 45 32 Q45 48 28 48"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute bottom-12 right-32 w-40 h-24"
        viewBox="0 0 120 70"
        fill="none"
        style={{ opacity: baseOpacity + 0.02 }}
      >
        {/* Small 4-point star */}
        <path d="M20 35 L24 28 L31 33 L24 38 Z" fill={color} />
        {/* Medium star outline */}
        <path
          d="M70 20 L74 10 L82 16 L77 26 L86 32 L76 32 L70 42 L67 32 L57 29 L66 23 Z"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        {/* Larger dots */}
        <circle cx="100" cy="45" r="4" fill={color} />
        <circle cx="45" cy="55" r="3" fill={color} />
      </svg>

      <svg
        className="absolute bottom-6 right-6 w-24 h-24"
        viewBox="0 0 70 70"
        fill="none"
        style={{ opacity: baseOpacity + 0.03 }}
      >
        {/* Triangle */}
        <path
          d="M35 12 L58 52 L12 52 Z"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ADDITIONAL ELEMENTS FOR FULL VARIANT
      ═══════════════════════════════════════════════════════════════════════════ */}
      {variant === 'full' && (
        <>
          <svg
            className="absolute top-3/5 left-5 w-12 h-16"
            viewBox="0 0 40 50"
            fill="none"
            style={{ opacity: baseOpacity }}
          >
            {/* Diamond */}
            <path
              d="M20 5 L35 25 L20 45 L5 25 Z"
              stroke={color}
              strokeWidth="2.5"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>

          <svg
            className="absolute top-3/5 right-8 w-16 h-12"
            viewBox="0 0 50 35"
            fill="none"
            style={{ opacity: baseOpacity - 0.01 }}
          >
            {/* Arc */}
            <path
              d="M5 30 Q25 5 45 30"
              stroke={color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <svg
            className="absolute top-5 left-1/3 w-48 h-16"
            viewBox="0 0 150 50"
            fill="none"
            style={{ opacity: baseOpacity - 0.01 }}
          >
            <circle cx="20" cy="25" r="5" stroke={color} strokeWidth="2" fill="none" />
            <path d="M60 20 L66 26 L60 32 L54 26 Z" fill={color} />
            <circle cx="100" cy="30" r="3" fill={color} />
            <circle cx="130" cy="18" r="4" stroke={color} strokeWidth="2" fill="none" />
          </svg>

          {/* Extra scattered elements */}
          <svg
            className="absolute top-2/3 left-1/4 w-8 h-8"
            viewBox="0 0 20 20"
            fill="none"
            style={{ opacity: baseOpacity - 0.02 }}
          >
            <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="2" fill="none" strokeDasharray="3 3" />
          </svg>

          <svg
            className="absolute top-1/5 right-1/3 w-10 h-10"
            viewBox="0 0 30 30"
            fill="none"
            style={{ opacity: baseOpacity }}
          >
            <path d="M15 5 L18 13 L26 15 L18 17 L15 25 L12 17 L4 15 L12 13 Z" fill={color} />
          </svg>

          <svg
            className="absolute bottom-40 left-1/3 w-8 h-8"
            viewBox="0 0 20 20"
            fill="none"
            style={{ opacity: baseOpacity + 0.02 }}
          >
            <circle cx="10" cy="10" r="7" fill={color} />
          </svg>

          <svg
            className="absolute bottom-24 right-1/3 w-10 h-10"
            viewBox="0 0 25 25"
            fill="none"
            style={{ opacity: baseOpacity }}
          >
            <path d="M12.5 2 L15 10 L23 12.5 L15 15 L12.5 23 L10 15 L2 12.5 L10 10 Z" stroke={color} strokeWidth="2" fill="none" />
          </svg>

          {/* Additional middle elements */}
          <svg
            className="absolute top-1/2 left-1/3 w-6 h-6"
            viewBox="0 0 20 20"
            fill="none"
            style={{ opacity: baseOpacity - 0.02 }}
          >
            <circle cx="10" cy="10" r="5" fill={color} />
          </svg>

          <svg
            className="absolute top-1/3 right-1/4 w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            style={{ opacity: baseOpacity }}
          >
            <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" stroke={color} strokeWidth="1.5" fill="none" />
          </svg>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          ADDITIONAL ELEMENTS FOR SPARSE VARIANT (subtle extras in middle)
      ═══════════════════════════════════════════════════════════════════════════ */}
      {variant === 'sparse' && (
        <>
          <svg
            className="absolute top-1/2 right-1/4 w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            style={{ opacity: baseOpacity - 0.04 }}
          >
            <circle cx="12" cy="12" r="6" fill={color} />
          </svg>

          <svg
            className="absolute bottom-1/3 left-1/4 w-10 h-10"
            viewBox="0 0 30 30"
            fill="none"
            style={{ opacity: baseOpacity - 0.02 }}
          >
            <path d="M15 5 L17 13 L25 15 L17 17 L15 25 L13 17 L5 15 L13 13 Z" stroke={color} strokeWidth="1.5" fill="none" />
          </svg>
        </>
      )}
    </div>
  )
}
