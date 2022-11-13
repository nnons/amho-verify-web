import React, { useEffect } from 'react'
import Card, { CardPadding } from '../components/Card'
import Badge from '../components/Badge'
import Divider from '../components/Divider'
import deviceStore from '../stores/deviceStore'
import { Navigate } from 'react-router-dom'
import Loading from '../components/Loading'
import registerStore from '../stores/registerStore'
import formatDescription from '../helpers/formatDescription'
import truncateAddress from '../helpers/truncateAddress'
import walletStore from '../stores/walletStore'
import { getChainData } from '../helpers/getChainData'

const ARWEAVE_NODE = process.env.REACT_APP_ARWEAVE_NODE || 'https://arweave.net'

// TODO: allow the user to select a chain id
const { chainId } = walletStore.getState()

const CHAIN_ID = chainId || 1
const EXPLORER = getChainData(CHAIN_ID).explorer

export default function Success() {
  const ds = deviceStore()
  const rs = registerStore()

  useEffect(() => {
    if (ds.device && !ds.registered) {
      ds.getDevice()
    }
  }, [])

  // if (!ds.device) return <Navigate to="/" />

  // if (ds.device && !ds.registered) {
  return (
    <Card>
      <CardPadding>
        <div className="loading-wrap-2 text-center">
          {/* <Loading /> */}
          <h2 className="text-lg success-body">Added to whitelist!</h2>
          <p className="text-sm success-body mt-1">
            Follow us on{' '}
            <a href="https://twitter.com/AMHOLTD" className="social">
              Twitter
            </a>{' '}
            and{' '}
            <a href="https://instagram.com/qurie.park" className="social">
              Instagram
            </a>
          </p>
        </div>
      </CardPadding>
    </Card>
  )
  // }

  // const meta = JSON.parse(ds.device.device_token_metadata)
  // return (
  //   <Card className="relative">
  //     <CardPadding>
  //       <div className="success-body mt-1">
  //         {ds.creator ? (
  //           <p>
  //             Created by{' '}
  //             <a target="_blank" href={`${EXPLORER}/${ds.creator}`}>
  //               {ds.creator}
  //             </a>
  //           </p>
  //         ) : (
  //           <p>
  //             Created by{' '}
  //             <a target="_blank" href={`${EXPLORER}/${ds.device.device_minter}`}>
  //               {truncateAddress(ds.device.device_minter)}
  //             </a>
  //           </p>
  //         )}

  //         <div
  //           className="mt-3 description"
  //           dangerouslySetInnerHTML={{ __html: formatDescription(meta.description) }}
  //         ></div>
  //       </div>

  //       <Divider />

  //       <h3 className="font-normal mt-4 mb-1 text-light-gray text-xs">Device ID</h3>
  //       <p className="break-word font-bold text-smb">{ds.keys?.primaryPublicKeyHash}</p>
  //     </CardPadding>
  //   </Card>
  // )
}
