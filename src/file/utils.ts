import { Connection } from '../connection/connection'
import { Bee, Reference, RequestOptions, UploadResult, Utils } from '@ethersphere/bee-js'
import { getBatchId } from '../utils/batch'
import { PathInfo } from '../pod/utils'
import { Blocks, FileShareInfo, RawBlocks } from './types'
import { rawBlocksToBlocks } from './adapter'
import CryptoJS from 'crypto-es'
import { assertString } from '../utils/type'
import { RawFileMetadata } from '../pod/types'
import { bytesToHex } from '../utils/hex'

/**
 * Asserts that full path string is correct
 *
 * @param value full path string
 */
export function assertFullPathWithName(value: unknown): asserts value is string {
  assertString(value)

  if (value.length === 0) {
    throw new Error('Path is empty')
  }

  if (value.trim().length !== value.length) {
    throw new Error('Path to contain characters that can be truncated')
  }

  if (value[0] !== '/') {
    throw new Error('Path must start with "/"')
  }

  const exploded = value.split('/')

  if (exploded.length < 2) {
    throw new Error('Path must contain at least one file or directory name')
  }

  exploded.shift()

  const name = exploded.pop()

  if (!name) {
    throw new Error('File or directory name is empty')
  }
}

/**
 * Uploads data to swarm with specific FairOS configuration
 *
 * @param connection Bee connection
 * @param data data to upload
 */
export async function uploadBytes(connection: Connection, data: Uint8Array): Promise<UploadResult> {
  return connection.bee.uploadData(await getBatchId(connection.beeDebug), data, {
    pin: true,
    encrypt: true,
  })
}

/**
 * Extracts filename and path from full path
 *
 * @param fullPath full absolute path with filename
 */
export function extractPathInfo(fullPath: string): PathInfo {
  assertFullPathWithName(fullPath)
  const exploded = fullPath.split('/')
  const filename = exploded.pop()

  if (!filename) {
    throw new Error('Path must contain a file')
  }

  const path = exploded.join('/')

  return {
    filename,
    path: path ? path : '/',
  }
}

/**
 * Downloads raw FairOS blocks and convert it to FDS blocks
 *
 * @param bee Bee client
 * @param reference blocks Swarm reference
 * @param downloadOptions download options
 */
export async function downloadBlocksManifest(
  bee: Bee,
  reference: Reference,
  downloadOptions?: RequestOptions,
): Promise<Blocks> {
  const rawBlocks = (await bee.downloadData(reference, downloadOptions)).json() as unknown as RawBlocks

  return rawBlocksToBlocks(rawBlocks)
}

/**
 * Converts Base64 string to Swarm Reference
 *
 * @param base64 Reference encoded to Base64
 */
export function base64toReference(base64: string): Reference {
  return CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Hex) as Reference
}

/**
 * Converts Swarm Reference to Base64
 *
 * @param reference Swarm Reference
 */
export function referenceToBase64(reference: Reference): string {
  return CryptoJS.enc.Hex.parse(reference).toString(CryptoJS.enc.Base64)
}

/**
 * Creates file share information structure
 */
export function createFileShareInfo(meta: RawFileMetadata, podAddress: Utils.EthAddress): FileShareInfo {
  return {
    meta,
    source_address: bytesToHex(podAddress),
  }
}
