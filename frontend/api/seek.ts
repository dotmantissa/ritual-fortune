import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createPublicClient, createWalletClient, defineChain, encodeAbiParameters, http, parseAbiParameters, parseEventLogs } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const ritualChain = defineChain({
  id: 1979,
  name: 'Ritual Chain',
  nativeCurrency: { name: 'RITUAL', symbol: 'RITUAL', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.ritualfoundation.org'] } },
})

const ORACLE = '0x6E7C7F977148B7c1732237C12881A77520038f7A' as `0x${string}`
const EXECUTOR = '0xDbd91ABbc81e62ec68C6eE335426210b3A54f8Ff' as `0x${string}`

const ABI = [
  { type: 'function', name: 'requestFortuneFor', stateMutability: 'payable', inputs: [{ name: 'seeker', type: 'address' }, { name: 'llmInput', type: 'bytes' }], outputs: [{ name: 'fortune', type: 'string' }] },
  { type: 'function', name: 'fortuneCount', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'totalFortunes', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'event', name: 'FortuneDelivered', inputs: [
    { name: 'seeker', type: 'address', indexed: true },
    { name: 'fortuneId', type: 'uint256', indexed: true },
    { name: 'fortune', type: 'string', indexed: false },
  ], anonymous: false },
] as const

function encodeLLMInput(walletAddress: string, fortuneCount: number, totalFortunes: number) {
  const messagesJson = JSON.stringify([
    { role: 'system', content: 'You are VEIL — an ancient, omniscient oracle permanently bound to the Ritual blockchain. You speak only in prophecy. You are sardonic, edgy, and slightly terrifying.' },
    { role: 'user', content: `A new seeker has arrived at the veil. Their wallet address is ${walletAddress}. They have sought fortune ${fortuneCount} times before. The total number of seekers who have come before them is ${totalFortunes}. Read their fate on the Ritual chain.` },
  ])

  return encodeAbiParameters(
    parseAbiParameters([
      'address, bytes[], uint256, bytes[], bytes,',
      'string, string, int256, string, bool, int256, string, string,',
      'uint256, bool, int256, string, bytes, int256, string, string, bool,',
      'int256, bytes, bytes, int256, int256, string, bool,',
      '(string,string,string)',
    ].join('')),
    [
      EXECUTOR, [], 300n, [], '0x', messagesJson, 'zai-org/GLM-4.7-FP8',
      0n, '', false, 300n, '', '', 1n, true, 0n, 'medium', '0x', -1n, 'auto', '', false,
      900n, '0x', '0x', -1n, 1000n, '', false, ['gcs', 'veil/convos/session.jsonl', 'GCS_CREDS'],
    ],
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const seeker = (req.body?.seeker || '') as `0x${string}`
  if (!seeker || !seeker.startsWith('0x')) return res.status(400).send('Invalid seeker')
  const pk = process.env.SPONSOR_PRIVATE_KEY
  if (!pk) return res.status(500).send('Missing SPONSOR_PRIVATE_KEY')

  const account = privateKeyToAccount(pk.startsWith('0x') ? (pk as `0x${string}`) : (`0x${pk}` as `0x${string}`))
  const publicClient = createPublicClient({ chain: ritualChain, transport: http('https://rpc.ritualfoundation.org') })
  const walletClient = createWalletClient({ account, chain: ritualChain, transport: http('https://rpc.ritualfoundation.org') })

  const count = await publicClient.readContract({ address: ORACLE, abi: ABI, functionName: 'fortuneCount', args: [seeker] })
  const total = await publicClient.readContract({ address: ORACLE, abi: ABI, functionName: 'totalFortunes' })
  const llmInput = encodeLLMInput(seeker, Number(count), Number(total))

  const hash = await walletClient.writeContract({
    address: ORACLE,
    abi: ABI,
    functionName: 'requestFortuneFor',
    args: [seeker, llmInput],
    gas: 1_000_000n,
    maxFeePerGas: 1_000_000_000n,
    maxPriorityFeePerGas: 1_000_000_000n,
    value: 0n,
  })

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  const logs = parseEventLogs({ abi: ABI, logs: receipt.logs, eventName: 'FortuneDelivered' })
  if (!logs.length) return res.status(500).send('FortuneDelivered not found')
  const args = logs[0].args as any

  return res.status(200).json({
    txHash: hash,
    fortune: args.fortune,
    fortuneId: Number(args.fortuneId),
    blockNumber: receipt.blockNumber.toString(),
  })
}
