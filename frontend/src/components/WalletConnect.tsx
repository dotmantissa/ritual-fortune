import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, isPending, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  if (isPending) return <button className='wallet-btn'>CONNECTING... |</button>
  if (!isConnected) return <button className='wallet-btn' onClick={() => connect({ connector: connectors[0] })}>CONNECT WALLET</button>
  return <div className='wallet-badge'><span>● {address!.slice(0, 6)}...{address!.slice(-4)}</span><button onClick={() => disconnect()}>x</button></div>
}
