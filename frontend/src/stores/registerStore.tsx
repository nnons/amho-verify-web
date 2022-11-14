import create from 'zustand'
import deviceStore from './deviceStore'
import { ethers } from 'ethers'
import walletStore from './walletStore'
import connector from '../walletConnect'
import buf2hex from '../helpers/bufToHex'
import unpackDERSig from '../helpers/unpackDERSig'
import formatMinterSig from '../helpers/formatMinterSig'
import generateCmd from '../helpers/generateCMD'
import { getChainData } from '../helpers/getChainData'
import axios from 'axios'
// const ipfsHash = require('ipfs-only-hash')

let BRIDGE_MINT_NOADDRESS_ENDPOINT = '/mint/noaddress'
let BRIDGE_MINT_ENDPOINT = '/mint'
let BRIDGE_CHECK_ENDPOINT = '/twitter/check'

if (process.env.NODE_ENV !== 'production') {
  BRIDGE_MINT_NOADDRESS_ENDPOINT = process.env.REACT_APP_BRIDGE_NODE + BRIDGE_MINT_NOADDRESS_ENDPOINT
  BRIDGE_MINT_ENDPOINT = process.env.REACT_APP_BRIDGE_NODE + BRIDGE_MINT_ENDPOINT
  BRIDGE_CHECK_ENDPOINT = process.env.REACT_APP_BRIDGE_NODE + BRIDGE_CHECK_ENDPOINT
}
// TODO: allow the user to select a chain id
const { chainId } = walletStore.getState()

const CHAIN_ID = chainId || 1
const ETH_NODE = getChainData(CHAIN_ID).rpc_url

type TRegisterStore = {
  urlMode: boolean
  base64Image: any
  previewing: boolean
  success: boolean
  postedToTwitter: boolean
  loading: boolean
  registered: boolean
  twitterVerified: boolean
  twitterSig: string
  twitterMsg: string
  signed: boolean
  signing: boolean
  message: string
  registerForm: {
    name: string
    email: string
    twitter: string
    instagram: string
    // imageSrc: string
    // image: any
  }
  sigMsg: string
  sigSplit: any
  block: any

  setUrlMode(urlMode: boolean): void
  changeRegisterField(key: string, value: string): void
  changeFileField(file: any): void
  imageSrcSubmit(): void
  clearImage(): void
  setLoading(loading: boolean): void
  setPostToTwitter(): void
  formatTwitterSig(msg: string): string
  checkTwitter(): void
  signHalo(): void
  signHaloTwitter(): void
  signHaloNoAddr(): void
  scanHalo(): void
  registerHalo(): void
}

const registerStore = create<TRegisterStore>((set) => ({
  urlMode: false,
  base64Image: false,
  twitterVerified: false,
  twitterSig: '',
  twitterMsg: '',
  postedToTwitter: false,
  loading: false,
  previewing: false,
  registered: false,
  registerForm: {
    name: '',
    email: '',
    twitter: '',
    instagram: '',
  },
  sigMsg: '',
  sigSplit: false,
  block: false,
  registerData: false,
  signed: false,
  success: false,
  signing: false,
  message: 'Uploading media, this may take a minute or two.',

  setLoading: (loading) => {
    set({ loading })
  },
  setPostToTwitter: () => {
    set({postedToTwitter: true});
  },

  formatTwitterSig: (sig): string => {
    const twitterMsg = `Verifying my identity and Proof of Scan for @AMHOLTD \n\nsig:${sig}`
    set({ twitterSig: sig, twitterMsg })
    return twitterMsg
  },

  changeRegisterField: (key, value) => {
    set((state) => ({
      registerForm: {
        ...state.registerForm,
        [key]: value,
      },
    }))
  },

  changeFileField: (file: any) => {
    // Set state to the file
    set((state) => ({
      registerForm: {
        ...state.registerForm,
        image: file,
      },
      previewing: true,
    }))

    // Generate a preview
    var FR = new FileReader()

    FR.addEventListener('load', function (e: any) {
      set({ base64Image: e.target.result })
    })

    FR.readAsDataURL(file)
  },

  imageSrcSubmit: () => {
    set({ urlMode: false, previewing: true })
  },

  setUrlMode: (urlMode) => {
    set({ urlMode })
  },

  clearImage: () => {
    set((state) => ({
      registerForm: {
        ...state.registerForm,
      },
    }))
  },

  // TODO: sign the address of the connected wallet with blockhash if available.
  scanHalo: async () => {
    const { triggerScan } = deviceStore.getState()
    const provider: any = new ethers.providers.JsonRpcProvider(ETH_NODE)

    const block = await provider.getBlock()
    // Note: we may want to change this format to accomodate more data than the blockHash in the future.
    const sigMsg = block.hash
    const sigCmd = generateCmd(1, 1, sigMsg)
    const sig = await triggerScan(sigCmd)
    const sigString = buf2hex(sig)
    const sigSplit = unpackDERSig(sigString)

    set({ sigSplit, sigMsg, block })
  },

  signHaloNoAddr: async () => {
    const { keys, device } = deviceStore.getState()
    const device_id = keys?.primaryPublicKeyHash.substring(2)
    const device_addr = device?.device_address

    const { name, email } = registerStore.getState().registerForm
    const device_token_metadata = { name, email }
    const { sigMsg, sigSplit } = registerStore.getState()

    const typedData = {
      message: {
        // cid: ipfsCid,
        name: device_token_metadata.name,
        email: device_token_metadata.email,
        device: {
          id: device_id,
          addr: device_addr,
          signatureR: sigSplit.r,
          signatureS: sigSplit.s,
          digest: sigMsg,
        },
      },
    }

    const jsonArgs = JSON.stringify({ data: typedData })
    axios
      .post(BRIDGE_MINT_NOADDRESS_ENDPOINT, jsonArgs, {
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'PASS',
        },
      })
      .then((res) => {
        set({ loading: false, success: true, message: 'Mint successful! Retrieving record.' })
      })
  },

  signHaloTwitter: async () => {
    console.log(`sign twitter called`)
    const { keys, device } = deviceStore.getState()
    const { address, chainId } = walletStore.getState()
    const { name, email } = registerStore.getState().registerForm
    const { block, sigMsg, sigSplit } = registerStore.getState()

    const device_id = keys?.primaryPublicKeyHash.substring(2)
    const device_addr = device?.device_address
    const device_token_metadata = { name, email }

    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
        ],
        Device: [
          { name: 'id', type: 'string' },
          { name: 'addr', type: 'address' },
          { name: 'signatureR', type: 'string' },
          { name: 'signatureS', type: 'string' },
          { name: 'digest', type: 'string' },
        ],
        Media: [
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'minter', type: 'address' },
          { name: 'device', type: 'Device' },
        ],
      },
      primaryType: 'Media',
      domain: {
        name: 'ERS',
        version: '0.1.0',
        chainId: chainId,
      },
      message: {
        // cid: ipfsCid,
        name: device_token_metadata.name,
        email: device_token_metadata.email,
        minter: address || '0x0',
        device: {
          id: device_id,
          addr: device_addr,
          signatureR: sigSplit.r,
          signatureS: sigSplit.s,
          digest: sigMsg,
        },
      },
    }
    console.log('Typed data: ', typedData)
    const msgParams = [
      address, // Required
      JSON.stringify(typedData), // Required
    ]

    connector.signTypedData(msgParams).then((result) => {
      const formatSig = registerStore.getState().formatTwitterSig(result)
      set({ loading: false, twitterSig: result, twitterMsg: formatSig})
    })
  },

  signHalo: async () => {
    console.log(`sign called`)
    const { keys, device } = deviceStore.getState()
    const { address, chainId } = walletStore.getState()
    const { name, email } = registerStore.getState().registerForm
    const { block, sigMsg, sigSplit } = registerStore.getState()

    const device_id = keys?.primaryPublicKeyHash.substring(2)
    const device_addr = device?.device_address
    const device_token_metadata = { name, email }

    // const ipfsCid = await ipfsHash.of(base64Image)
    // console.log(`ipfs hash ${ipfsCid}`)

    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
        ],
        Device: [
          { name: 'id', type: 'string' },
          { name: 'addr', type: 'address' },
          { name: 'signatureR', type: 'string' },
          { name: 'signatureS', type: 'string' },
          { name: 'digest', type: 'string' },
        ],
        Media: [
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'minter', type: 'address' },
          { name: 'device', type: 'Device' },
        ],
      },
      primaryType: 'Media',
      domain: {
        name: 'ERS',
        version: '0.1.0',
        chainId: chainId,
      },
      message: {
        // cid: ipfsCid,
        name: device_token_metadata.name,
        email: device_token_metadata.email,
        minter: address || '0x0',
        device: {
          id: device_id,
          addr: device_addr,
          signatureR: sigSplit.r,
          signatureS: sigSplit.s,
          digest: sigMsg,
        },
      },
    }

    const msgParams = [
      address, // Required
      JSON.stringify(typedData), // Required
    ]
    connector
      .signTypedData(msgParams)
      .then((result) => {
        set({ loading: true })
        console.log(`submitting data`)

        const data = {
          device_id,
          device_token_metadata: JSON.stringify(device_token_metadata),
          device_sig: JSON.stringify(sigSplit),
          device_sig_msg: sigMsg, // Note: we may want to include more data here than just block information, hence blockNumber alone is insufficient.
          blockNumber: block.number,
          minter_addr: address,
          minter_sig: JSON.stringify(formatMinterSig(result)),
          minter_chain_id: chainId,
        }

        // function getFormData(object: any) {
        //   const formData = new FormData()
        //   Object.keys(object).forEach((key) => formData.append(key, object[key]))
        //   return formData
        // }

        // const form = getFormData(data)

        const jsonArgs = JSON.stringify({ data: { address, ...typedData }, signature: result })

        axios
          .post(BRIDGE_MINT_ENDPOINT, jsonArgs, {
            headers: {
              'Content-Type': 'application/json',
              'Bypass-Tunnel-Reminder': 'PASS',
            },
          })
          .then((res) => {
            set({ loading: false, success: true, message: 'Mint successful! Retrieving record.' })
          })
          .catch((err) => {
            set({ loading: false })
            alert('Something went wrong post.')
            console.log(err)
          })
      })
      .catch((error) => {
        set({ loading: false })
        console.log(error)
        alert('Something went wrong pre.')
      })
  },

  checkTwitter: () => {
    const { twitterSig } = registerStore.getState()
    const { keys, device } = deviceStore.getState()
    const { address, chainId } = walletStore.getState()
    const { name, email } = registerStore.getState().registerForm
    const { block, sigMsg, sigSplit } = registerStore.getState()

    const device_id = keys?.primaryPublicKeyHash.substring(2)
    const device_addr = device?.device_address
    const device_token_metadata = { name, email }
    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
        ],
        Device: [
          { name: 'id', type: 'string' },
          { name: 'addr', type: 'address' },
          { name: 'signatureR', type: 'string' },
          { name: 'signatureS', type: 'string' },
          { name: 'digest', type: 'string' },
        ],
        Media: [
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'minter', type: 'address' },
          { name: 'device', type: 'Device' },
        ],
      },
      primaryType: 'Media',
      domain: {
        name: 'ERS',
        version: '0.1.0',
        chainId: chainId,
      },
      message: {
        // cid: ipfsCid,
        name: device_token_metadata.name,
        email: device_token_metadata.email,
        minter: address || '0x0',
        device: {
          id: device_id,
          addr: device_addr,
          signatureR: sigSplit.r,
          signatureS: sigSplit.s,
          digest: sigMsg,
        },
      },
    }
    const jsonArgs = JSON.stringify({ data: { address, ...typedData }, signature: twitterSig })
    set({ loading: true })
    axios
      .post(BRIDGE_CHECK_ENDPOINT, jsonArgs, {
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'PASS',
        },
      })
      .then((res) => {
        set({ loading: false, twitterVerified: true })
      })
      .catch((err) => {
        set({ loading: false })
        alert('Something went wrong post.')
        console.log(err)
      })
  },
  registerHalo: () => {
    set({ loading: true })
  },
}))

export default registerStore
