import React from 'react'
import fetch from 'isomorphic-fetch'
import Link from 'next/link'

import { autorun } from 'mobx'
import { createTransformer, computedFn } from 'mobx-utils'

interface Props {
  data: Data
}

interface Data {
  hello: string  
}


const Home = (props: Props) => {
  return <div>
    <Link href="/editor">
      <button>Start editor</button>
    </Link>
  </div>
}

// Home.getInitialProps = async (): Promise<Props> => {
//   const result = await fetch('http://localhost:3000/api')
//   const data = await result.json() as Data

//   return {
//     data
//   }
// }

export default Home