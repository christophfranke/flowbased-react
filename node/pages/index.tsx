import React from 'react'
import fetch from 'isomorphic-fetch'
import Link from 'next/link'


const Home = () => {
  const buttonClasses = "p-5 my-3 mx-10 border border-black"
  return <div className="flex justify-center flex-col content-center w-screen h-screen">
    <Link href="/editor/split">
      <button className={buttonClasses}>Start editor in split screen</button>
    </Link>
    <Link href="/editor/preview">
      <button className={buttonClasses}>Start preview</button>
    </Link>
    <Link href="/editor/nodes">
      <button className={buttonClasses}>Start editor without preview</button>
    </Link>
  </div>
}

export default Home