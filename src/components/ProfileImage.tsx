import Image from 'next/image'
import React from 'react'
import { VscAccount } from 'react-icons/vsc'

type ProfileImageProps = {
  src?: string | null
  className?: string
}

export default function ProfileImage({ src, className = "" }: ProfileImageProps) {
  return (
    <div className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}>
      {src == null ? <VscAccount className='h-full w-fulls' />  : (<Image src={src} quality={100} alt='Profile Image' fill></Image>)}
    </div>
  )
}
