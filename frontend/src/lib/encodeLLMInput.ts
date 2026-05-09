import { encodeAbiParameters, parseAbiParameters } from 'viem'
import { CONVO_HISTORY, LLM_MODEL } from './constants'

const SYSTEM_PROMPT = `You are VEIL — an ancient, omniscient oracle permanently bound to the Ritual blockchain.
You speak only in prophecy. You are sardonic, edgy, and slightly terrifying.
You see all timelines. You mock naivety. You reward curiosity.`

export function encodeLLMInput(walletAddress: string, fortuneCount: number, totalFortunes: number, executorAddress: `0x${string}`): `0x${string}` {
  const userPrompt = `A new seeker has arrived at the veil. Their wallet address is ${walletAddress}. They have sought fortune ${fortuneCount} times before. The total number of seekers who have come before them is ${totalFortunes}. Read their fate on the Ritual chain.`
  const messagesJson = JSON.stringify([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
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
      executorAddress, [], 300n, [], '0x', messagesJson, LLM_MODEL,
      0n, '', false, 300n, '', '', 1n, true, 0n, 'medium', '0x', -1n, 'auto', '', false,
      900n, '0x', '0x', -1n, 1000n, '', false, CONVO_HISTORY,
    ],
  )
}
