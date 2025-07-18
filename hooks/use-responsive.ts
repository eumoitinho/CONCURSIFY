"use client"

import { useState, useEffect } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface BreakpointValues {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const breakpoints: BreakpointValues = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })

      // Determine current breakpoint
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm')
      } else {
        setCurrentBreakpoint('xs')
      }
    }

    // Set initial size
    updateSize()

    // Add event listener
    window.addEventListener('resize', updateSize)

    // Cleanup
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm'
  const isTablet = currentBreakpoint === 'md'
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl'
  
  const isAtLeast = (breakpoint: Breakpoint) => {
    return windowSize.width >= breakpoints[breakpoint]
  }

  const isBelow = (breakpoint: Breakpoint) => {
    return windowSize.width < breakpoints[breakpoint]
  }

  return {
    currentBreakpoint,
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isAtLeast,
    isBelow,
    breakpoints
  }
}

// Hook for checking specific breakpoint
export function useBreakpoint(breakpoint: Breakpoint) {
  const { isAtLeast } = useResponsive()
  return isAtLeast(breakpoint)
}

// Hook for media queries
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}