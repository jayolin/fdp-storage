import crypto from 'crypto'
import { BeeDebug, Utils } from '@ethersphere/bee-js'
import { getBatchId } from '../src/utils/batch'
import { FdpStorage } from '../src'
import { Wallet } from 'ethers'
import { ENVIRONMENT_CONFIGS, Environments } from '@fairdatasociety/fdp-contracts'

export interface TestUser {
  username: string
  password: string
  address: string
  mnemonic: string
}

export const USERNAME_LENGTH = 16
export const PASSWORD_LENGTH = 6
export const GET_FEED_DATA_TIMEOUT = 1000

/**
 * Generate new user info
 *
 * @returns TestUser
 */
export function generateUser(fdp?: FdpStorage): TestUser {
  const wallet = fdp ? fdp.account.createWallet() : Wallet.createRandom()

  return {
    username: crypto.randomBytes(USERNAME_LENGTH).toString('hex'),
    password: crypto.randomBytes(PASSWORD_LENGTH).toString('hex'),
    mnemonic: wallet.mnemonic.phrase,
    address: wallet.address,
  }
}

/**
 * Generate random hex string with passed length
 *
 * @param length Length of output string
 */
export function generateRandomHexString(length = 10): string {
  return crypto.randomBytes(length).toString('hex').substring(0, length)
}

/**
 * Returns an url for testing the Bee public API
 */
export function beeUrl(): string {
  return process.env.BEE_API_URL || 'http://127.0.0.1:1633'
}

/**
 * Returns an url for testing the Bee Debug API
 */
export function beeDebugUrl(): string {
  return process.env.BEE_DEBUG_API_URL || 'http://127.0.0.1:1635'
}

/**
 * Returns an url for testing the FairOS-dfs by API
 */
export function fairosJsUrl(): string {
  return process.env.BEE_FAIROS_API_URL || 'http://127.0.0.1:9090/v1/'
}

/**
 * Converts string to Ethereum address in form of bytes
 *
 * @param address Ethereum address for preparation
 */
export function prepareEthAddress(address: string): Utils.EthAddress {
  return Utils.makeEthAddress(address)
}

/**
 * Convert 32 bytes array of numbers to Utils.Bytes<32>
 */
export function numbersToSegment(numbers: number[]): Utils.Bytes<32> {
  if (numbers.length !== 32) {
    throw new Error('Numbers length must be equal to 32')
  }

  return new Uint8Array(numbers) as Utils.Bytes<32>
}

/**
 * Checks default postage batch is usable
 *
 * @param beeDebug
 */
export async function isBatchUsable(beeDebug: BeeDebug): Promise<boolean> {
  const batchId = await getBatchId(beeDebug)
  const batch = await beeDebug.getPostageBatch(batchId)

  return batch.usable
}

/**
 * Converts bytes to string
 *
 * @param data
 */
export function bytesToString(data: Uint8Array): string {
  return new TextDecoder().decode(data)
}

/**
 * Options for FDP initialization
 */
export const fdpOptions = {
  downloadOptions: {
    timeout: GET_FEED_DATA_TIMEOUT,
  },
  ensOptions: {
    ...ENVIRONMENT_CONFIGS[Environments.LOCALHOST],
    performChecks: true,
    rpcUrl: 'http://127.0.0.1:9546/',
  },
}

/**
 * Creates FDP instance with default configuration for testing
 */
export function createFdp(): FdpStorage {
  return new FdpStorage(beeUrl(), beeDebugUrl(), fdpOptions)
}
