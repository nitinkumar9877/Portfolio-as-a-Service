import Link from 'next/link'
import React from 'react'

const Home = () => {
  return (
    <div>
      Click Here to redirect create portfolio page : <Link href="/create-portfolio">Create Your Own PortFolio</Link>
    </div>
  )
}

export default Home
