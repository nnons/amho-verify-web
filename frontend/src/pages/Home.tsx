import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/Button'
import Card, { CardFooter, CardPadding } from '../components/Card'
import Chip from '../components/Chip'
import deviceStore from '../stores/deviceStore'
import registerStore from '../stores/registerStore'
import walletStore from '../stores/walletStore'

function LinkButton() {
  const keys = deviceStore((s) => s.keys)
  const device = deviceStore((s) => s.device)
  const linkHalo = deviceStore((s) => s.linkHalo)
  const nowallet = deviceStore((r) => r.nowallet)
  const linkHaloNoWallet = deviceStore((s) => s.linkHaloNoWallet)
  const connected = walletStore((s) => s.address).length > 0
  const registered = deviceStore((s) => s.registered)

  if (!keys) {
    return (
      <>
        <div style={{ paddingBottom: 10 }}>
          <Button fullWidth color="white-line" onClick={linkHalo}>
            Scan With Wallet
          </Button>
        </div>
        <Button fullWidth color="white-line" onClick={linkHaloNoWallet}>
          Scan Without Wallet
        </Button>
      </>
    )
  } else if (device && nowallet) {
    return (
      <Button to={'/register'} color="white-line" fullWidth>
        Next
      </Button>
    )
  } else if (device && registered) {
    return <Navigate to="/success" />
  } else if (device && !connected && !registered) {
    return (
      <Button color="white-line" fullWidth disabled>
        Next
      </Button>
    )
  } else if (device && keys && !registered) {
    return (
      <Button to={'/register'} color="white-line" fullWidth>
        Next
      </Button>
    )
  } else {
    return (
      <Button fullWidth disabled>
        Next
      </Button>
    )
  }
}

export default function Home() {
  const init = deviceStore((s) => s.init)
  const keys = deviceStore((s) => s.keys)
  const loading = deviceStore((s) => s.loading)
  const connected = walletStore((s) => s.address).length > 0
  const registered = deviceStore((s) => s.registered)

  useEffect(() => {
    init()
  }, [])

  return (
    <Card loading={loading}>
      <CardPadding>
        {/* <Chip detected={keys ? true : false} /> */}
        {keys ? (
          <>
            <h1 className="text-3xl text-white mt-6 font-expanded uppercase">
              Bag
              <br />
              Detected
            </h1>
            <p className="text-white text-sm mt-4 mb-4">Tap link below to sign up for AMHO whitelist.</p>
            <h3 className="font-normal mt-4 mb-1 text-white text-xs">Device ID</h3>
            <p className="break-word font-bold text-white text-smb">{keys?.primaryPublicKeyHash}</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl text-white mt-6 font-expanded uppercase">
              No Bag
              <br />
              Detected
            </h1>
            <p className="text-white text-sm mt-4 mb-4">
              Scan NFC by tapping the button below and holding the bag to your smartphone.
            </p>
          </>
        )}
      </CardPadding>
      <CardFooter>
        <CardPadding>
          {LinkButton()}
          {!connected && !registered && (
            <p className="text-center text-white text-xs uppercase mt-4">Connect wallet to sign up</p>
          )}
        </CardPadding>
      </CardFooter>
    </Card>
  )
}
