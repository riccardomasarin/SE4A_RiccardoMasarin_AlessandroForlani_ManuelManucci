import {
  createContext,
  useContext,
} from 'react'
import type { UserDto } from './types/nightout'

type SessionContextValue = {
  user: UserDto | null
  loadingSession: boolean

  login: (
    email: string,
    password: string,
  ) => Promise<UserDto>

  logout: () => void
}

export const SessionContext =
  createContext<SessionContextValue | null>(
    null,
  )

export function useSession() {
  const session = useContext(SessionContext)

  if (!session) {
    throw new Error(
      'useSession must be used inside SessionContext.Provider',
    )
  }

  return session
}