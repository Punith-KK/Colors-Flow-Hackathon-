// File: ./src/auth-cluster.js

import React, {useState, useEffect} from "react"
import {useCurrentUser} from "./hooks/current-user"
import {useProfile} from "./hooks/profile"

import "./AuthCluster.css"
function WithAuth({address}) {
  
  const profile = useProfile(address)
  const cu = useCurrentUser()
  useEffect(() => profile.refetch(), [address])
  if (address == null) return null
  return !cu.loggedIn ? null : (
  <div class="topnav">
    <a href="#">{profile.name}</a>
    <a onClick={cu.logOut}>Logout</a>
    <a className = "right">{profile.address}</a>
    <a className = "right"><img
            src={profile.avatar}
            width="30px"
            height="30px"
            alt={profile.name}
          /></a>
  </div>
    
  )
}

function SansAuth() {
  const cu = useCurrentUser()
  return cu.loggedIn ? null : (
    <div>
      <div class="topnav">
        <a href="#" onClick={cu.logIn}>Log In</a>
        <a onClick={cu.signUp}>Sign Up</a>
      </div>
      <h1>Login to Continue</h1>
    </div>
    
  )
}

export function AuthCluster() {
  const cu = useCurrentUser()
  return (
    <>
      <WithAuth address={cu.addr} />
      <SansAuth />
    </>
  )
}