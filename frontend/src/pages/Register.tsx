import classNames from 'classnames'
import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import Button from '../components/Button'
import Card, { CardBack, CardFooter, CardPadding } from '../components/Card'
import Field from '../components/Field'
import GrayCenterBox from '../components/GrayCenterBox'
import deviceStore from '../stores/deviceStore'
import registerStore from '../stores/registerStore'

export default function Register() {
  const rs = registerStore()
  const ds = deviceStore()

  const handleFileChange = (e: any) => {
    const file = e.target.files[0]
    file.size < 5000001 ? rs.changeFileField(file) : alert('Media must be 5mb in size or less')
  }

  // NOTE: Removed to allow users to scan without wallet
  // if (!ds.device) return <Navigate to="/" />
  if (rs.sigSplit && rs.block) return <Navigate to="/confirm" />

  return (
    <Card loading={rs.loading}>
      <CardPadding>
        <CardBack to="/">Sign Up For AMHO Whitelist</CardBack>

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
