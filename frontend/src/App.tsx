import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { nightoutApi } from './api/nightoutApi'
import { AppShell } from './components/AppShell'
import { DiscoveryFeedPage } from './pages/DiscoveryFeedPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { HelpSupportPage } from './pages/HelpSupportPage'
import { ManagerCreateEventPage } from './pages/ManagerCreateEventPage'
import { ManagerDashboardPage } from './pages/ManagerDashboardPage'
import { ManagerEventsPage } from './pages/ManagerEventsPage'
import { ManagerPromotionsPage } from './pages/ManagerPromotionsPage'
import { ManagerTicketsPage } from './pages/ManagerTicketsPage'
import { ManagerVenueProfilePage } from './pages/ManagerVenueProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { PaymentMethodsPage } from './pages/PaymentMethodsPage'
import { PregameDetailPage } from './pages/PregameDetailPage'
import { PregamePage } from './pages/PregamePage'
import { PrivacySettingsPage } from './pages/PrivacySettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { PrAccountPage } from './pages/PrAccountPage'
import { PrDashboardPage } from './pages/PrDashboardPage'
import { PrTicketsPage } from './pages/PrTicketsPage'
import { RoleSelectionPage } from './pages/RoleSelectionPage'
import { TicketPurchasePage } from './pages/TicketPurchasePage'
import { TicketsPage } from './pages/TicketsPage'
import { SessionContext } from './session'
import type {
  AuthenticationRole,
  LoginResponseDto,
  UserDto,
  UserRole,
} from './types/nightout'
import './App.css'

const storedSessionKey = 'nightout-auth-session'

function homeForRole(role: UserRole) {
  if (role === 'VENUE_MANAGER') {
    return '/manager'
  }
  if (role === 'PR_MANAGER') {
    return '/pr'
  }
  return '/feed'
}

function authenticationRoleFor(
  role: UserRole,
): AuthenticationRole {
  if (role === 'VENUE_MANAGER') {
    return 'VENUE'
  }
  if (role === 'PR_MANAGER') {
    return 'PR'
  }
  return 'USER'
}

function readStoredSession(): LoginResponseDto | null {
  const stored = localStorage.getItem(
    storedSessionKey,
  )

  if (!stored) {
    return null
  }

  try {
    const parsed = JSON.parse(stored) as Partial<LoginResponseDto>
    const validRole =
      parsed.role === 'USER' ||
      parsed.role === 'VENUE' ||
      parsed.role === 'PR'

    if (
      parsed.authenticated !== true ||
      typeof parsed.profileId !== 'number' ||
      typeof parsed.displayName !== 'string' ||
      typeof parsed.email !== 'string' ||
      !validRole
    ) {
      return null
    }

    return parsed as LoginResponseDto
  } catch {
    return null
  }
}

function ProtectedPage({
  user,
  role,
  children,
}: {
  user: UserDto | null
  role: UserRole
  children: ReactNode
}) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={homeForRole(user.role)}
        replace
      />
    )
  }

  return children
}

function App() {
  const [storedSession] = useState(
    readStoredSession,
  )

  const [user, setUser] =
    useState<UserDto | null>(null)

  const [loadingSession, setLoadingSession] =
    useState(storedSession !== null)

  useEffect(() => {
    if (!storedSession) {
      localStorage.removeItem(storedSessionKey)
      return
    }

    nightoutApi
      .getUser(storedSession.profileId)
      .then((storedUser) => {
        if (
          authenticationRoleFor(storedUser.role) !==
          storedSession.role
        ) {
          throw new Error('Stored session role does not match profile')
        }

        setUser(storedUser)
      })
      .catch(() => {
        localStorage.removeItem(storedSessionKey)
      })
      .finally(() => {
        setLoadingSession(false)
      })
  }, [storedSession])

  const session = useMemo(
    () => ({
      user,
      loadingSession,

      async login(
        email: string,
        password: string,
      ) {
        const authentication =
          await nightoutApi.login(
            email.trim(),
            password,
          )

        const nextUser =
          await nightoutApi.getUser(
            authentication.profileId,
          )

        if (
          authenticationRoleFor(nextUser.role) !==
          authentication.role
        ) {
          throw new Error('Authenticated role does not match profile')
        }

        localStorage.setItem(
          storedSessionKey,
          JSON.stringify(authentication),
        )

        setUser(nextUser)
        return nextUser
      },

      logout() {
        localStorage.removeItem(storedSessionKey)
        setUser(null)
      },
    }),
    [user, loadingSession],
  )

  if (loadingSession) {
    return (
      <div className="boot-screen">
        <strong>NightOUT</strong>
        <span>Loading session</span>
      </div>
    )
  }

  return (
    <SessionContext.Provider value={session}>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <AppShell
                user={user}
                onLogout={session.logout}
              />
            }
          >
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate
                    to={homeForRole(user.role)}
                    replace
                  />
                ) : (
                  <RoleSelectionPage />
                )
              }
            />

            <Route
              path="/role"
              element={
                <Navigate to="/login" replace />
              }
            />

            <Route
              path="/"
              element={
                <Navigate
                  to={
                    user
                      ? homeForRole(user.role)
                      : '/login'
                  }
                  replace
                />
              }
            />

            <Route
              path="/feed"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <DiscoveryFeedPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <EventDetailPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/checkout/:eventId"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <TicketPurchasePage />
                </ProtectedPage>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <TicketsPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/pregames"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <PregamePage />
                </ProtectedPage>
              }
            />
            <Route
              path="/pregames/:roomId"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <PregameDetailPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <NotificationsPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <ProfilePage />
                </ProtectedPage>
              }
            />
            <Route
              path="/payment-methods"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <PaymentMethodsPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/privacy-settings"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <PrivacySettingsPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/help-support"
              element={
                <ProtectedPage user={user} role="NORMAL_USER">
                  <HelpSupportPage />
                </ProtectedPage>
              }
            />

            <Route
              path="/manager"
              element={
                <ProtectedPage user={user} role="VENUE_MANAGER">
                  <ManagerDashboardPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/manager/events"
              element={
                <ProtectedPage user={user} role="VENUE_MANAGER">
                  <ManagerEventsPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/manager/events/new"
              element={
                <ProtectedPage user={user} role="VENUE_MANAGER">
                  <ManagerCreateEventPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/manager/tickets"
              element={
                <ProtectedPage user={user} role="VENUE_MANAGER">
                  <ManagerTicketsPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/manager/promotions"
              element={
                <ProtectedPage user={user} role="VENUE_MANAGER">
                  <ManagerPromotionsPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/manager/profile"
              element={
                <ProtectedPage user={user} role="VENUE_MANAGER">
                  <ManagerVenueProfilePage />
                </ProtectedPage>
              }
            />
            <Route
  path="/manager/help-support"
  element={
    <ProtectedPage
      user={user}
      role="VENUE_MANAGER"
    >
      <HelpSupportPage />
    </ProtectedPage>
  }
/>

            <Route
              path="/pr"
              element={
                <ProtectedPage user={user} role="PR_MANAGER">
                  <PrDashboardPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/pr/tickets"
              element={
                <ProtectedPage user={user} role="PR_MANAGER">
                  <PrTicketsPage />
                </ProtectedPage>
              }
            />
            <Route
              path="/pr/account"
              element={
                <ProtectedPage user={user} role="PR_MANAGER">
                  <PrAccountPage />
                </ProtectedPage>
              }
            />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionContext.Provider>
  )
}

export default App
