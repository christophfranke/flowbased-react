import React from 'react'
import fetch from 'isomorphic-fetch'
import Link from 'next/link'

import './index.scss'

const Home = () => {
  return <div>
    <Link href="/editor">
      <button className="start-button">Start Editor</button>
    </Link>
  </div>
}

export default Home