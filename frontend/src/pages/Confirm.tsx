import classNames from 'classnames'
import React from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/Button'
import Card, { CardBack, CardFooter, CardPadding } from '../components/Card'
import Chip from '../components/Chip'
import Loading from '../components/Loading'
import deviceStore from '../stores/deviceStore'
import registerStore from '../stores/registerStore'
import walletStore from '../stores/walletStore'

export default function Confirm() {
  const form = registerStore((s) => s.registerForm)
  const nowallet = deviceStore((s) => s.nowallet)
  const loading = registerStore((s) => s.loading)
  const signHalo = registerStore((s) => s.signHalo)
  const signHaloNoAddr = registerStore((s) => s.signHaloNoAddr)
  const success = registerStore((s) => s.success)
  const device = deviceStore((s) => s.device)
  const message = registerStore((s) => s.message)

  // if (!device) return <Navigate to="/" />
  if (success) return <Navigate to="/success" />

  return (
    <Card className={classNames('relative', { 'confirm-loading': loading })}>
      <CardPadding>
        <CardBack to="/register">Confirm Sign Up</CardBack>
        <h2 className="text-xl text-white mt-4">{form.name || 'Untitled'}</h2>
        <p className="text-sm text-white">{form.email || 'No description'}</p>
      </CardPadding>
      <CardFooter>
        <CardPadding>
          {loading ? (
            <Button color="white-line" fullWidth>
              Loading...
            </Button>
          ) : (
            <Button color="white-line" fullWidth onClick={nowallet ? signHaloNoAddr : signHalo}>
              Confirm
            </Button>
          )}
        </CardPadding>
      </CardFooter>
    </Card>
  )
}
