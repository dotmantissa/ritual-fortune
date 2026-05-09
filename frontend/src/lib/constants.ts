export const VEIL_ORACLE_ADDRESS = '0xf709a3da182729269154CFf01F7B03d36Cb4CeF6' as `0x${string}`
export const EXECUTOR_ADDRESS = '0xDbd91ABbc81e62ec68C6eE335426210b3A54f8Ff' as `0x${string}`

export const VEIL_ORACLE_ABI = [
  { type: 'function', name: 'requestFortune', stateMutability: 'payable', inputs: [{ name: 'llmInput', type: 'bytes' }], outputs: [{ name: 'fortune', type: 'string' }] },
  { type: 'function', name: 'fortuneCount', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'totalFortunes', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'fortuneFee', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'lastFortune', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'string' }] },
  { type: 'event', name: 'FortuneDelivered', inputs: [
    { name: 'seeker', type: 'address', indexed: true },
    { name: 'fortuneId', type: 'uint256', indexed: true },
    { name: 'fortune', type: 'string', indexed: false },
  ], anonymous: false },
] as const

export const LLM_MODEL = 'zai-org/GLM-4.7-FP8'
export const CONVO_HISTORY: [string, string, string] = ['gcs', 'veil/convos/session.jsonl', 'GCS_CREDS']

export const SHARE_TEXT_TEMPLATE = (fortune: string) =>
  `The oracle VEIL has spoken my fate on @ritualnet:\n\n"${fortune.slice(0, 180)}..."\n\nSeek your own fortune: `
