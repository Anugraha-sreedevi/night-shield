import React from 'react';

export default function ProgressRing({
  percentage = 68,
  size = 130,
  strokeWidth = 12,
  gradientType = 'pink-violet', // 'pink-violet' or 'violet-blue'
  centerLabel = null,
  centerSub = null,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const gradientId = `ring-gradient-${gradientType}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          {gradientType === 'pink-violet' ? (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF5FA2" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          ) : (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          )}
        </defs>

        {/* Light grey track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EAE9F2"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Gradient progress stroke with rounded caps */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>

      {/* Center Percentage & Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[28px] font-extrabold tracking-tight text-[#1B1B3A] leading-none">
          {centerLabel !== null ? centerLabel : `${percentage}%`}
        </span>
        {centerSub && (
          <span className="text-[11px] font-medium text-[#8A8AA8] mt-0.5">
            {centerSub}
          </span>
        )}
      </div>
    </div>
  );
}
