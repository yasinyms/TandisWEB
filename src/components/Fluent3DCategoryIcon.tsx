import React, { useState } from 'react';
import { motion } from 'motion/react';

interface Fluent3DCategoryIconProps {
  id: string;
  className?: string;
  isHovered?: boolean;
}

export const Fluent3DCategoryIcon: React.FC<Fluent3DCategoryIconProps> = ({
  id,
  className = 'w-20 h-20',
  isHovered = false
}) => {
  const [localHover, setLocalHover] = useState(false);
  const active = isHovered || localHover;

  const hoverLoopTransition = {
    duration: 0.85,
    repeat: active ? Infinity : 0,
    repeatType: 'mirror' as const,
    ease: 'easeInOut' as const
  };

  switch (id) {
    case 'ride':
      return (
        <svg
          viewBox="0 0 72 72"
          fill="none"
          className={className}
          onMouseEnter={() => setLocalHover(true)}
          onMouseLeave={() => setLocalHover(false)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clay-ride-base" cx="28%" cy="20%" r="82%">
              <stop offset="0%" stopColor="#FFE885" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>
            <linearGradient id="clay-ride-rim" x1="10" y1="8" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="clay-ride-body" x1="20" y1="20" x2="52" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient id="clay-ride-glass" x1="24" y1="24" x2="48" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
            <filter id="clay-drop-ride" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#78350F" floodOpacity="0.42" />
            </filter>
          </defs>

          <rect x="6" y="6" width="60" height="60" rx="24" fill="url(#clay-ride-base)" />
          <rect x="6.75" y="6.75" width="58.5" height="58.5" rx="23.25" stroke="url(#clay-ride-rim)" strokeWidth="1.5" />
          <ellipse cx="26" cy="17" rx="14" ry="6" transform="rotate(-12 26 17)" fill="white" fillOpacity="0.28" />

          <motion.g
            filter="url(#clay-drop-ride)"
            style={{ originX: '36px', originY: '42px' }}
            animate={
              active
                ? {
                    x: [0, -3.5, 3.5, -2, 0],
                    y: [0, -2.5, 0.5, -2, 0],
                    rotate: [0, -3, 3, -1.5, 0]
                  }
                : { x: 0, y: 0, rotate: 0 }
            }
            transition={hoverLoopTransition}
          >
            <rect x="30" y="16" width="12" height="5.5" rx="2.75" fill="#0F766E" />
            <motion.circle
              cx="36"
              cy="18.7"
              r="1.6"
              fill="#FDE047"
              animate={active ? { scale: [1, 1.6, 1], opacity: [1, 0.6, 1] } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, repeat: active ? Infinity : 0 }}
            />
            <path
              d="M19.5 35.5L23.2 25.6C24.3 22.8 26.9 21 30 21H42C45.1 21 47.7 22.8 48.8 25.6L52.5 35.5C54.6 36.3 56 38.3 56 40.7V47C56 49.5 54 51.5 51.5 51.5H20.5C18 51.5 16 49.5 16 47V40.7C16 38.3 17.4 36.3 19.5 35.5Z"
              fill="url(#clay-ride-body)"
            />
            <path
              d="M25 34.5L27.5 27C28.1 25.5 29.5 24.5 31.1 24.5H40.9C42.5 24.5 43.9 25.5 44.5 27L47 34.5H25Z"
              fill="url(#clay-ride-glass)"
            />
            <motion.circle
              cx="22.5"
              cy="42.5"
              r="3.2"
              fill="#F59E0B"
              animate={active ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
            />
            <motion.circle
              cx="49.5"
              cy="42.5"
              r="3.2"
              fill="#F59E0B"
              animate={active ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
            />
            <rect x="30" y="41" width="12" height="3.2" rx="1.6" fill="#94A3B8" />
            <rect x="19.5" y="49" width="7.5" height="6" rx="3" fill="#1E293B" />
            <rect x="45" y="49" width="7.5" height="6" rx="3" fill="#1E293B" />
          </motion.g>
        </svg>
      );

    case 'services':
      return (
        <svg
          viewBox="0 0 72 72"
          fill="none"
          className={className}
          onMouseEnter={() => setLocalHover(true)}
          onMouseLeave={() => setLocalHover(false)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clay-srv-base" cx="28%" cy="20%" r="82%">
              <stop offset="0%" stopColor="#FFB366" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#C2410C" />
            </radialGradient>
            <linearGradient id="clay-srv-rim" x1="10" y1="8" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#7C2D12" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="clay-srv-fg" x1="18" y1="16" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="68%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <filter id="clay-drop-srv" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#7C2D12" floodOpacity="0.42" />
            </filter>
          </defs>

          <rect x="6" y="6" width="60" height="60" rx="24" fill="url(#clay-srv-base)" />
          <rect x="6.75" y="6.75" width="58.5" height="58.5" rx="23.25" stroke="url(#clay-srv-rim)" strokeWidth="1.5" />
          <ellipse cx="26" cy="17" rx="14" ry="6" transform="rotate(-12 26 17)" fill="white" fillOpacity="0.25" />

          <g filter="url(#clay-drop-srv)">
            <motion.g
              style={{ originX: '44px', originY: '29px' }}
              animate={
                active
                  ? { rotate: [0, -24, 14, -20, 8, 0], scale: [1, 1.05, 1] }
                  : { rotate: 0, scale: 1 }
              }
              transition={hoverLoopTransition}
            >
              <path
                d="M44.5 18C39.5 18 35.5 22 35.5 27C35.5 28.7 36 30.2 36.8 31.5L20.5 47.8C18.6 49.7 18.6 52.7 20.5 54.6C22.4 56.5 25.4 56.5 27.3 54.6L43.6 38.3C44.9 39.1 46.4 39.6 48.1 39.6C53.1 39.6 57.1 35.6 57.1 30.6C57.1 29.3 56.7 28 56.1 26.9L50.8 32.2L45.6 29.8L43.2 24.6L48.5 19.3C47.4 18.5 46 18 44.5 18Z"
                fill="url(#clay-srv-fg)"
              />
              <circle cx="23.9" cy="51.2" r="2.2" fill="#F97316" />
            </motion.g>

            <motion.g
              style={{ originX: '24.5px', originY: '25.5px' }}
              animate={
                active
                  ? { y: [0, -3.5, 1, 0], scale: [1, 1.16, 0.96, 1] }
                  : { y: 0, scale: 1 }
              }
              transition={hoverLoopTransition}
            >
              <circle cx="24.5" cy="25.5" r="6.5" fill="url(#clay-srv-fg)" />
              <circle cx="24.5" cy="25.5" r="2.4" fill="#FDBA74" />
            </motion.g>
          </g>
        </svg>
      );

    case 'auto':
      return (
        <svg
          viewBox="0 0 72 72"
          fill="none"
          className={className}
          onMouseEnter={() => setLocalHover(true)}
          onMouseLeave={() => setLocalHover(false)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clay-auto-base" cx="28%" cy="20%" r="82%">
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0369A1" />
            </radialGradient>
            <linearGradient id="clay-auto-rim" x1="10" y1="8" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="clay-auto-fg" x1="18" y1="18" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <filter id="clay-drop-auto" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0C4A6E" floodOpacity="0.4" />
            </filter>
          </defs>

          <rect x="6" y="6" width="60" height="60" rx="24" fill="url(#clay-auto-base)" />
          <rect x="6.75" y="6.75" width="58.5" height="58.5" rx="23.25" stroke="url(#clay-auto-rim)" strokeWidth="1.5" />
          <ellipse cx="26" cy="17" rx="14" ry="6" transform="rotate(-12 26 17)" fill="white" fillOpacity="0.25" />

          <motion.g
            filter="url(#clay-drop-auto)"
            style={{ originX: '36px', originY: '42px' }}
            animate={
              active
                ? {
                    x: [0, 3.5, -3.5, 2, 0],
                    y: [0, -2.5, 0.5, -2, 0],
                    rotate: [0, 2.8, -2.8, 1.5, 0]
                  }
                : { x: 0, y: 0, rotate: 0 }
            }
            transition={hoverLoopTransition}
          >
            <motion.circle
              cx="36"
              cy="19"
              r="4"
              fill="#FBBF24"
              style={{ originX: '36px', originY: '19px' }}
              animate={active ? { scale: [1, 1.4, 1], y: [0, -1.5, 0] } : { scale: 1, y: 0 }}
              transition={{ duration: 0.45, repeat: active ? Infinity : 0 }}
            />
            <path
              d="M20 36L23.5 26.5C24.5 24 26.9 22.5 29.6 22.5H42.4C45.1 22.5 47.5 24 48.5 26.5L52 36C54.3 36.8 55.8 38.9 55.8 41.4V47C55.8 49.4 53.9 51.3 51.5 51.3H20.5C18.1 51.3 16.2 49.4 16.2 47V41.4C16.2 38.9 17.7 36.8 20 36Z"
              fill="url(#clay-auto-fg)"
            />
            <path
              d="M25.5 35L27.8 28.2C28.4 26.9 29.6 26 31 26H41C42.4 26 43.6 26.9 44.2 28.2L46.5 35H25.5Z"
              fill="#0284C7"
            />
            <circle cx="23" cy="42.5" r="2.8" fill="#38BDF8" />
            <circle cx="49" cy="42.5" r="2.8" fill="#38BDF8" />
            <rect x="20" y="48.5" width="7" height="5.5" rx="2.75" fill="#1E293B" />
            <rect x="45" y="48.5" width="7" height="5.5" rx="2.75" fill="#1E293B" />
          </motion.g>
        </svg>
      );

    case 'home':
      return (
        <svg
          viewBox="0 0 72 72"
          fill="none"
          className={className}
          onMouseEnter={() => setLocalHover(true)}
          onMouseLeave={() => setLocalHover(false)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clay-home-base" cx="28%" cy="20%" r="82%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="52%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
            <linearGradient id="clay-home-rim" x1="10" y1="8" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#064E3B" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="clay-home-fg" x1="18" y1="18" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F0FDF4" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <filter id="clay-drop-home" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#064E3B" floodOpacity="0.4" />
            </filter>
          </defs>

          <rect x="6" y="6" width="60" height="60" rx="24" fill="url(#clay-home-base)" />
          <rect x="6.75" y="6.75" width="58.5" height="58.5" rx="23.25" stroke="url(#clay-home-rim)" strokeWidth="1.5" />
          <ellipse cx="26" cy="17" rx="14" ry="6" transform="rotate(-12 26 17)" fill="white" fillOpacity="0.25" />

          <g filter="url(#clay-drop-home)">
            <motion.g
              style={{ originX: '36px', originY: '48px' }}
              animate={
                active
                  ? {
                      y: [0, -3.5, 0.5, -2, 0],
                      scaleY: [1, 1.06, 0.96, 1.03, 1],
                      scaleX: [1, 0.97, 1.04, 0.99, 1]
                    }
                  : { y: 0, scaleY: 1, scaleX: 1 }
              }
              transition={hoverLoopTransition}
            >
              <path
                d="M33.2 18.8C34.8 17.4 37.2 17.4 38.8 18.8L54.2 32.4C56.2 34.1 55 37.4 52.3 37.4H50V49.5C50 51.7 48.2 53.5 46 53.5H26C23.8 53.5 22 51.7 22 49.5V37.4H19.7C17 37.4 15.8 34.1 17.8 32.4L33.2 18.8Z"
                fill="url(#clay-home-fg)"
              />
              <rect x="32" y="39.5" width="8" height="14" rx="4" fill="#10B981" />
            </motion.g>

            <motion.circle
              cx="50"
              cy="21.5"
              r="4.5"
              fill="#FDE047"
              style={{ originX: '50px', originY: '21.5px' }}
              animate={
                active
                  ? { scale: [1, 1.38, 0.88, 1.25, 1], y: [0, -4, 1, 0], x: [0, 2, -2, 0] }
                  : { scale: 1, y: 0, x: 0 }
              }
              transition={hoverLoopTransition}
            />
          </g>
        </svg>
      );

    case 'events':
      return (
        <svg
          viewBox="0 0 72 72"
          fill="none"
          className={className}
          onMouseEnter={() => setLocalHover(true)}
          onMouseLeave={() => setLocalHover(false)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clay-med-base" cx="28%" cy="20%" r="82%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="52%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </radialGradient>
            <linearGradient id="clay-med-rim" x1="10" y1="8" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="clay-med-fg" x1="18" y1="18" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FFF1F2" />
              <stop offset="100%" stopColor="#FECDD3" />
            </linearGradient>
            <filter id="clay-drop-med" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#881337" floodOpacity="0.4" />
            </filter>
          </defs>

          <rect x="6" y="6" width="60" height="60" rx="24" fill="url(#clay-med-base)" />
          <rect x="6.75" y="6.75" width="58.5" height="58.5" rx="23.25" stroke="url(#clay-med-rim)" strokeWidth="1.5" />
          <ellipse cx="26" cy="17" rx="14" ry="6" transform="rotate(-12 26 17)" fill="white" fillOpacity="0.25" />

          <g filter="url(#clay-drop-med)">
            <motion.g
              style={{ originX: '36px', originY: '36px' }}
              animate={
                active
                  ? {
                      scale: [1, 1.15, 0.96, 1.12, 1],
                      rotate: [0, 8, -8, 0]
                    }
                  : { scale: 1, rotate: 0 }
              }
              transition={hoverLoopTransition}
            >
              <rect x="30" y="18" width="12" height="36" rx="6" fill="url(#clay-med-fg)" />
              <rect x="18" y="30" width="36" height="12" rx="6" fill="url(#clay-med-fg)" />
            </motion.g>

            <motion.circle
              cx="50"
              cy="21"
              r="4"
              fill="#FDE047"
              style={{ originX: '50px', originY: '21px' }}
              animate={active ? { scale: [1, 1.4, 1], y: [0, -3.5, 0] } : { scale: 1, y: 0 }}
              transition={hoverLoopTransition}
            />
          </g>
        </svg>
      );

    case 'legal':
      return (
        <svg
          viewBox="0 0 72 72"
          fill="none"
          className={className}
          onMouseEnter={() => setLocalHover(true)}
          onMouseLeave={() => setLocalHover(false)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clay-leg-base" cx="28%" cy="20%" r="82%">
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="52%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#5B21B6" />
            </radialGradient>
            <linearGradient id="clay-leg-rim" x1="10" y1="8" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#3B0764" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="clay-leg-fg" x1="18" y1="18" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#DDD6FE" />
            </linearGradient>
            <filter id="clay-drop-leg" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#3B0764" floodOpacity="0.4" />
            </filter>
          </defs>

          <rect x="6" y="6" width="60" height="60" rx="24" fill="url(#clay-leg-base)" />
          <rect x="6.75" y="6.75" width="58.5" height="58.5" rx="23.25" stroke="url(#clay-leg-rim)" strokeWidth="1.5" />
          <ellipse cx="26" cy="17" rx="14" ry="6" transform="rotate(-12 26 17)" fill="white" fillOpacity="0.25" />

          <g filter="url(#clay-drop-leg)">
            <rect x="33.5" y="20" width="5" height="31" rx="2.5" fill="url(#clay-leg-fg)" />
            <rect x="23" y="48.5" width="26" height="5.5" rx="2.75" fill="url(#clay-leg-fg)" />

            <motion.g
              style={{ originX: '36px', originY: '26.5px' }}
              animate={
                active
                  ? { rotate: [0, -14, 14, -9, 9, 0] }
                  : { rotate: 0 }
              }
              transition={hoverLoopTransition}
            >
              <rect x="17" y="24.5" width="38" height="4.5" rx="2.25" fill="url(#clay-leg-fg)" />
              <path d="M15 37.5C15 41.6 18.4 45 22.5 45C26.6 45 30 41.6 30 37.5H15Z" fill="#FDE047" />
              <path d="M42 37.5C42 41.6 45.4 45 49.5 45C53.6 45 57 41.6 57 37.5H42Z" fill="#FDE047" />
            </motion.g>

            <circle cx="36" cy="19.5" r="4.5" fill="#FDE047" />
          </g>
        </svg>
      );

    case 'apparel':
      return (
        <svg
          viewBox="0 0 72 72"
          fill="none"
          className={className}
          onMouseEnter={() => setLocalHover(true)}
          onMouseLeave={() => setLocalHover(false)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clay-bty-base" cx="28%" cy="20%" r="82%">
              <stop offset="0%" stopColor="#F9A8D4" />
              <stop offset="52%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#9D174D" />
            </radialGradient>
            <linearGradient id="clay-bty-rim" x1="10" y1="8" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#831843" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="clay-bty-fg" x1="18" y1="18" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FDF2F8" />
              <stop offset="100%" stopColor="#FBCFE8" />
            </linearGradient>
            <filter id="clay-drop-bty" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#831843" floodOpacity="0.4" />
            </filter>
          </defs>

          <rect x="6" y="6" width="60" height="60" rx="24" fill="url(#clay-bty-base)" />
          <rect x="6.75" y="6.75" width="58.5" height="58.5" rx="23.25" stroke="url(#clay-bty-rim)" strokeWidth="1.5" />
          <ellipse cx="26" cy="17" rx="14" ry="6" transform="rotate(-12 26 17)" fill="white" fillOpacity="0.25" />

          <g filter="url(#clay-drop-bty)">
            <motion.path
              d="M36 16C37.4 26 43 31.6 53 33C43 34.4 37.4 40 36 50C34.6 40 29 34.4 19 33C29 31.6 34.6 26 36 16Z"
              fill="url(#clay-bty-fg)"
              style={{ originX: '36px', originY: '33px' }}
              animate={
                active
                  ? { rotate: [0, 24, -16, 12, 0], scale: [1, 1.14, 0.94, 1.08, 1] }
                  : { rotate: 0, scale: 1 }
              }
              transition={hoverLoopTransition}
            />
            <motion.circle
              cx="50"
              cy="21"
              r="4.5"
              fill="#FDE047"
              style={{ originX: '50px', originY: '21px' }}
              animate={active ? { y: [0, -4, 1, 0], scale: [1, 1.3, 1] } : { y: 0, scale: 1 }}
              transition={hoverLoopTransition}
            />
            <motion.circle
              cx="23"
              cy="48"
              r="3.5"
              fill="#FFFFFF"
              style={{ originX: '23px', originY: '48px' }}
              animate={active ? { y: [0, 3, -3, 0], scale: [1, 1.25, 1] } : { y: 0, scale: 1 }}
              transition={hoverLoopTransition}
            />
          </g>
        </svg>
      );

    case 'industrial':
    default:
      return (
        <svg
          viewBox="0 0 72 72"
          fill="none"
          className={className}
          onMouseEnter={() => setLocalHover(true)}
          onMouseLeave={() => setLocalHover(false)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clay-ind-base" cx="28%" cy="20%" r="82%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="52%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </radialGradient>
            <linearGradient id="clay-ind-rim" x1="10" y1="8" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="clay-ind-peak1" x1="18" y1="24" x2="42" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#BFDBFE" />
            </linearGradient>
            <linearGradient id="clay-ind-peak2" x1="34" y1="30" x2="56" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#DBEAFE" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
            <filter id="clay-drop-ind" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1E3A8A" floodOpacity="0.4" />
            </filter>
          </defs>

          <rect x="6" y="6" width="60" height="60" rx="24" fill="url(#clay-ind-base)" />
          <rect x="6.75" y="6.75" width="58.5" height="58.5" rx="23.25" stroke="url(#clay-ind-rim)" strokeWidth="1.5" />
          <ellipse cx="26" cy="17" rx="14" ry="6" transform="rotate(-12 26 17)" fill="white" fillOpacity="0.25" />

          <g filter="url(#clay-drop-ind)">
            <motion.circle
              cx="45.5"
              cy="22"
              r="5.5"
              fill="#FDE047"
              style={{ originX: '45.5px', originY: '22px' }}
              animate={
                active
                  ? { y: [0, -4.5, -1, 0], x: [0, 2, -1, 0], scale: [1, 1.25, 1] }
                  : { y: 0, x: 0, scale: 1 }
              }
              transition={hoverLoopTransition}
            />
            <motion.path
              d="M28.2 24.8C29.8 22.1 33.7 22.1 35.3 24.8L46.8 44.5C48.4 47.2 46.4 50.6 43.3 50.6H20.2C17.1 50.6 15.1 47.2 16.7 44.5L28.2 24.8Z"
              fill="url(#clay-ind-peak1)"
              animate={active ? { y: [0, -3, 0.5, 0], x: [0, -1.5, 0] } : { y: 0, x: 0 }}
              transition={hoverLoopTransition}
            />
            <motion.path
              d="M42.8 31.6C44.2 29.2 47.8 29.2 49.2 31.6L56.2 43.8C57.6 46.2 55.8 49.2 53 49.2H39C36.2 49.2 34.4 46.2 35.8 43.8L42.8 31.6Z"
              fill="url(#clay-ind-peak2)"
              animate={active ? { y: [0, 2, -3, 0], x: [0, 2, 0] } : { y: 0, x: 0 }}
              transition={hoverLoopTransition}
            />
          </g>
        </svg>
      );
  }
};
