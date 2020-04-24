import React from 'react'
import fetch from 'isomorphic-fetch'
import Link from 'next/link'


const Home = () => {
  const buttonClasses = "p-5 my-3 mx-10 border border-black"
  return <div className="text-center flex justify-center flex-col content-center w-screen h-screen">
    <Link href="/editor">
      <a className={buttonClasses}>Start Editor</a>
    </Link>
  </div>
}

export default Home