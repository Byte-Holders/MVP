import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

import { useAuthContext } from '../features/auth/AuthContext'
import { NewWorkspaceDialog } from '@/features/createWorkspace/components/NewWorkspaceDialog'

export default function Header() {
  const { isAuthenticated, isLoading, login, logout } = useAuthContext()

  const navBtn =
    'border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5'

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--h-line)] bg-[var(--header-bg)] backdrop-blur-md">
      <nav className="flex items-center h-[72px] px-4 gap-2">
        {/* LEFT */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated && (
            <>
              <Link to="/workspaces" className={navBtn}>
                Workspace
              </Link>

              <Link to="/membership" className={navBtn}>
                Inviti
              </Link>
            </>
          )}
        </div>

        {/* CENTER */}
        <div className="flex-1 flex justify-center items-center">
          <Link to="/">
            <img
              src="/logo_codeguardian.png"
              alt="Logo"
              className="h-12 w-auto cursor-pointer"
            />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isLoading &&
            (isAuthenticated ? (
              <>
                <NewWorkspaceDialog />

                <button onClick={logout} className={`rounded-full ${navBtn}`}>
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => login()}
                className={`rounded-full ${navBtn}`}
              >
                Accedi
              </button>
            ))}

          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
