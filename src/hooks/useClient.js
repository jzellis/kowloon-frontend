// Returns the configured KowloonClient for the current server.
// Components should use this hook rather than importing getClient() directly.

import { useSelector } from 'react-redux'
import { getClient } from '../lib/client'

export function useClient() {
  const serverUrl = useSelector((state) => state.auth.serverUrl)
  return getClient(serverUrl)
}
