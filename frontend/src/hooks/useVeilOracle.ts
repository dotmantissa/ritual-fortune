import { useEffect, useState } from 'react'
import { encodeFunctionData, parseEventLogs } from 'viem'
import { useAccount, usePublicClient, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { encodeLLMInput } from '../lib/encodeLLMInput'
import { EXECUTOR_ADDRESS, VEIL_ORACLE_ABI, VEIL_ORACLE_ADDRESS } from '../lib/constants'

export type OracleState = 'idle'|'awakening'|'ready'|'encoding'|'awaiting_sign'|'transmitting'|'receiving'|'revealed'|'error'

export function useVeilOracle() {
  const [oracleState, setOracleState] = useState<OracleState>('idle')
  const [fortune, setFortune] = useState<string | null>(null)
  const [fortuneId, setFortuneId] = useState<number>(0)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null)
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const { data: fortuneCount } = useReadContract({ address: VEIL_ORACLE_ADDRESS, abi: VEIL_ORACLE_ABI, functionName: 'fortuneCount', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: totalFortunes } = useReadContract({ address: VEIL_ORACLE_ADDRESS, abi: VEIL_ORACLE_ABI, functionName: 'totalFortunes' })
  const { data: fortuneFee } = useReadContract({ address: VEIL_ORACLE_ADDRESS, abi: VEIL_ORACLE_ABI, functionName: 'fortuneFee' })

  const { sendTransactionAsync } = useSendTransaction()
  const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash ?? undefined })

  const seekFortune = async () => {
    if (!address) return
    try {
      setOracleState('encoding'); setError(null)
      const llmInput = encodeLLMInput(address, Number(fortuneCount ?? 0n), Number(totalFortunes ?? 0n), EXECUTOR_ADDRESS)
      setOracleState('awaiting_sign')
      const data = encodeFunctionData({ abi: VEIL_ORACLE_ABI, functionName: 'requestFortune', args: [llmInput] })
      const gasCap = 1_000_000n
      const maxFeePerGas = 1_000_000_000n
      const maxPriorityFeePerGas = 1_000_000_000n

      const hash = await sendTransactionAsync({
        to: VEIL_ORACLE_ADDRESS,
        data,
        value: (fortuneFee as bigint) ?? 0n,
        gas: gasCap,
        maxFeePerGas,
        maxPriorityFeePerGas,
      })
      setTxHash(hash)
      setOracleState('transmitting')
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
      setOracleState('error')
    }
  }

  useEffect(() => {
    if (!receipt || oracleState !== 'transmitting') return
    setOracleState('receiving')
    setBlockNumber(receipt.blockNumber)
    try {
      const logs = parseEventLogs({ abi: VEIL_ORACLE_ABI, logs: receipt.logs, eventName: 'FortuneDelivered' })
      if (logs.length > 0) {
        const args = logs[0].args as any
        setFortune(args.fortune)
        setFortuneId(Number(args.fortuneId))
        setOracleState('revealed')
        return
      }
    } catch {}

    ;(async () => {
      try {
        const f = await publicClient!.readContract({ address: VEIL_ORACLE_ADDRESS, abi: VEIL_ORACLE_ABI, functionName: 'lastFortune', args: [address!] })
        setFortune(f as string)
        setFortuneId(Number(fortuneCount ?? 0n))
        setOracleState('revealed')
      } catch (e: any) {
        setError(e?.message ?? 'Could not parse oracle output')
        setOracleState('error')
      }
    })()
  }, [receipt])

  const reset = () => { setOracleState('ready'); setFortune(null); setTxHash(null); setError(null) }
  return { oracleState, fortune, fortuneId, txHash, blockNumber, error, fortuneCount, totalFortunes, seekFortune, reset, setOracleState }
}
