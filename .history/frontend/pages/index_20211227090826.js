import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'

export default function Home() {
  const [payValue, setPayValue] = useState(0)

  return (
    <div className={styles.container}>
      <input type="text" value={payValue} onChange={(e) => { setPayValue(e.target.value) }}></input>
      <span className="pr-4 pl-4 pt-2 pb-2 bg-slate-300 shadow-md mt-3" onClick={() => { console.log(payValue) }}>Pay now</span>
    </div>
  )
}
