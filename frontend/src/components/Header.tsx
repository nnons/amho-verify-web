import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import walletStore from '../stores/walletStore'

import connector from '../walletConnect'
import Button from './Button'
import WalletDropdown from './WalletDropdown'

export default function Header() {
  const store = walletStore()

  useEffect(() => {
    connector.on('connect', (error, payload) => {
      if (error) return
      store.connect(payload.params[0].accounts[0], payload.params[0].chainId)
    })

    connector.on('session_update', (error, payload) => {
      if (error) return
      store.connect(payload.params[0].accounts[0], payload.params[0].chainId)
    })

    connector.on('disconnect', (error, payload) => {
      if (error) return
      store.disconnect()
    })
  }, [])

  return (
    <header className="header">
      <Link to="/">
        <img width="180" src="/assets/QURIEPARK.png" />
      </Link>

      {store.connected ? (
        <WalletDropdown />
      ) : (
        <Button size="small" color="white-line" onClick={store.requestAccess}>
          Connect wallet
        </Button>
      )}
    </header>
  )
}
