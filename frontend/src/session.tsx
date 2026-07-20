import { createContext, useContext } from 'react'
import type { UserDto } from './types/nightout'

export interface SessionContextValue {
  user: UserDto | null
  loadingSession: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<UserDto>
  logout: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error('useSession must be used inside SessionContext.Provider')
  }
  return value
}
