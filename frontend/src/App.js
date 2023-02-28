// File: ./src/App.js

import React from "react"
import {AuthCluster} from "./AuthCluster"
import {InitCluster} from "./init-cluster"
import {ProfileCluster} from "./profile-cluster"
import {useCurrentUser} from "./hooks/current-user"
import TokenData from "./TokenData.js"
import MintColor from "./MintColor.js"
import Markeplace from "./Marketplace.js"
export default function App() {
  const cu = useCurrentUser()

  return (
    <div>
      <AuthCluster />
     {/*} <InitCluster address={cu.addr} />
      <ProfileCluster address={cu.addr} />
      <TokenData/>
      {/*<MintColor/>*/}
     <Markeplace/>
    </div>
  )
}