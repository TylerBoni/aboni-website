import { useId } from 'react'
import clsx from 'clsx'
import icons from '../constants/icons'
import Image from 'next/image'

export function Logomark({
  invert = false,
  filled = false,
  ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
  invert?: boolean
  filled?: boolean
}) {
  let id = useId()

  return (
    <>
      <Image src={icons.aboniIconWithText.src} width={400} height={64} alt="aboni-logo black" />
    </>
  )
}

export function Logo({
  className,
  invert = false,
  filled = false,
  fillOnHover = false,
  ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
  invert?: boolean
  filled?: boolean
  fillOnHover?: boolean
}) {
  return (
    <Logomark
      preserveAspectRatio="xMinYMid meet"
      invert={invert}
      filled={filled}
    />
  )
}
