import classNames from 'classnames'
import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import Button from '../components/Button'
import Card, { CardBack, CardFooter, CardPadding } from '../components/Card'
import Field from '../components/Field'
// import GrayCenterBox from '../components/GrayCenterBox'
// import { ReactComponent as VerifiedIcon } from '../svg/verified.svg'
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
        {ds.nowallet ? (
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
        ) : (rs.twitterVerified ? (
          <Button fullWidth color="blue-gradient">
              <span>
                <div className='twitter-button'>
                <svg width="15" height="15" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.7037 4.09225C14.9935 1.65894 17.5518 0 20.5 0C23.4482 0 26.0065 1.65894 27.2963 4.09224C29.929 3.28367 32.911 3.9196 34.9957 6.00431C37.0804 8.08901 37.7163 11.071 36.9078 13.7037C39.3411 14.9935 41 17.5518 41 20.5C41 23.4482 39.3411 26.0065 36.9078 27.2963C37.7163 29.929 37.0804 32.911 34.9957 34.9957C32.911 37.0804 29.929 37.7163 27.2963 36.9078C26.0065 39.3411 23.4482 41 20.5 41C17.5518 41 14.9935 39.3411 13.7037 36.9078C11.071 37.7163 8.08901 37.0804 6.0043 34.9957C3.91962 32.911 3.28369 29.929 4.09225 27.2963C1.65894 26.0065 0 23.4482 0 20.5C0 17.5518 1.65894 14.9935 4.09224 13.7037C3.28367 11.071 3.91961 8.08902 6.00431 6.00431C8.08901 3.9196 11.071 3.28368 13.7037 4.09225ZM30.2631 15.3557C30.4132 15.5058 30.4132 15.7492 30.2631 15.8993L18.1229 28.0394C17.9728 28.1895 17.7294 28.1895 17.5793 28.0394L10.8751 21.3352C10.725 21.185 10.725 20.9417 10.8751 20.7916L13.0494 18.6172C13.1995 18.4671 13.4429 18.4671 13.593 18.6172L17.5793 22.6035C17.7294 22.7536 17.9728 22.7536 18.1229 22.6035L27.5451 13.1813C27.6952 13.0312 27.9386 13.0312 28.0887 13.1813L30.2631 15.3557Z"
                    fill="white"
                  />
                </svg>
                </div>
                Verified
              </span>
          </Button>
            ) : (

          <Button href="https://twitter.com/intent/tweet?text=Hello%20world" fullWidth color="blue-gradient">
              <span>
                Verify on Twitter
              </span>
          </Button>
            )
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
