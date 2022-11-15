import React from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/Button'
import Card, { CardBack, CardFooter, CardPadding } from '../components/Card'
import Field from '../components/Field'
import deviceStore from '../stores/deviceStore'
import registerStore from '../stores/registerStore'

export default function Register() {
  const rs = registerStore()
  const ds = deviceStore()
  if (rs.sigSplit && rs.block && ds.nowallet) return <Navigate to="/confirm" />
  if (rs.sigSplit && rs.block) return <Navigate to="/twitter" />

  return (
    <Card loading={rs.loading}>
      <CardPadding>
        <CardBack to="/">Sign Up For Whitelist</CardBack>

        <Field
          onChange={rs.changeRegisterField}
          value={rs.registerForm.name}
          type="text"
          placeholder="ENTER NAME"
          name="name"
        />

        <Field
          onChange={rs.changeRegisterField}
          value={rs.registerForm.email}
          type="text"
          placeholder="ENTER EMAIL"
          name="email"
        />
        {ds.nowallet && (
          <>
            <Field
              onChange={rs.changeRegisterField}
              value={rs.registerForm.twitter}
              type="text"
              placeholder="ENTER TWITTER USERNAME"
              name="twitter"
            />
            <Field
              onChange={rs.changeRegisterField}
              value={rs.registerForm.instagram}
              type="text"
              placeholder="ENTER INSTAGRAM"
              name="instagram"
            />
          </>
        )}
      </CardPadding>
      <CardFooter>
        <CardPadding>
          <Button fullWidth color="white-line" onClick={rs.scanHalo}>
            Tap bag to finish
          </Button>
        </CardPadding>
      </CardFooter>
    </Card>
  )
}
