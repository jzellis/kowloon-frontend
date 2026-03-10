// KowloonClient factory — single cached instance per server URL.
// Import getClient() anywhere you need to make API calls.
// Import clearClient() on logout to reset the cache.

import KowloonClient from '@kowloon/client'

let _client = null
let _clientUrl = null

/**
 * Get (or create) a KowloonClient for the given server URL.
 * Returns null if no URL is provided.
 */
export function getClient(serverUrl) {
  if (!serverUrl) return null
  if (_client && _clientUrl === serverUrl) return _client
  _client = new KowloonClient({ baseUrl: serverUrl })
  _clientUrl = serverUrl
  return _client
}

/**
 * Destroy the cached client. Call on logout or server switch.
 */
export function clearClient() {
  _client = null
  _clientUrl = null
}
