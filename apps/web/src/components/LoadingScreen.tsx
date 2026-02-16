import React from 'react'
import { Image } from '@mantine/core'
import classes from './LoadingScreen.module.css'

/**
 * LoadingScreen component with rotating logo animation.
 *
 * USAGE GUIDELINES:
 * - Use sparingly and only for critical loading states
 * - Avoid using for tab switching or minor state changes
 * - Prefer local loading indicators for component-specific loading
 * - Only use for initial app load or major data fetching operations
 */
interface LoadingScreenProps {
  /** Whether to show the loading screen. If false, returns null. */
  show?: boolean
}

export function LoadingScreen({ show = true }: LoadingScreenProps) {
  if (!show) {
    return null
  }

  return (
    <div className={classes.container}>
      <Image
        src='/logo.svg'
        width={80}
        height={80}
        alt={'EduTime logo'}
        fit='contain'
        className={classes.rotatingLogo}
      />
    </div>
  )
}
