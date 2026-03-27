import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
      <header className="sticky top-0 z-50 border-b border-[var(--h-line)] bg-[var(--h-bg)] backdrop-blur-md">
        <style>{`
        :root {
          --h-bg: #17141f;
          --h-line: rgba(255,255,255,0.07);
          --h-text: #c8c3da;
          --h-text-muted: #6b657a;
          --h-accent: rgba(108, 92, 231, 0.18);
          --h-accent-border: rgba(108, 92, 231, 0.22);
          --h-accent-hover: rgba(108, 92, 231, 0.26);
          --h-bar: rgba(130, 110, 220, 0.55);
          --h-btn-bg: rgba(255,255,255,0.05);
          --h-btn-border: rgba(255,255,255,0.09);
          --h-btn-hover: rgba(255,255,255,0.09);
          --h-cta-bg: rgba(108,92,231,0.15);
          --h-cta-border: rgba(108,92,231,0.3);
          --h-cta-hover: rgba(108,92,231,0.24);
          --h-cta-text: #a898e8;
        }
      `}</style>

        <nav className="flex items-center h-[72px] px-4 gap-2">

          <div className="flex items-center gap-1 flex-shrink-0">
            <div
                className="w-[3px] h-[26px] rounded-full mr-2 flex-shrink-0"
                style={{ background: 'var(--h-bar)' }}
            />

            <Link
                to="/"
                className="nav-btn"
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                    padding: '8px 16px',
                  borderRadius: '8px',
                  border: '0.5px solid var(--h-btn-border)',
                  background: 'var(--h-btn-bg)',
                  color: 'var(--h-text)',
                  textDecoration: 'none',
                  transition: 'background 150ms, border-color 150ms',
                  whiteSpace: 'nowrap',
                }}
            >
              Workspace
            </Link>

            <Link
                to="/inviti"
                className="nav-btn"
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '0.5px solid var(--h-btn-border)',
                  background: 'var(--h-btn-bg)',
                  color: 'var(--h-text)',
                  textDecoration: 'none',
                  transition: 'background 150ms, border-color 150ms',
                  whiteSpace: 'nowrap',
                }}
            >
              Inviti
            </Link>
          </div>

          {/* ── CENTER: logo placeholder ── */}
          <div className="flex-1 flex justify-center items-center">
            {
              <img src="/logo_codeguardian.png" alt="Logo" className="h-15 w-auto" />
          }
          </div>

          {/* ── RIGHT: notifications + access + theme ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Notification bell */}
            <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: '15px',
                  fontWeight: 600,
                    padding: '8px 14px',
                  borderRadius: '8px',
                  border: '0.5px solid var(--h-accent-border)',
                  background: 'var(--h-accent)',
                  color: 'var(--h-cta-text)',
                  cursor: 'pointer',
                  transition: 'background 150ms',
                  whiteSpace: 'nowrap',
                }}
            >
              <svg
                  viewBox="0 0 16 16"
                  width="13"
                  height="13"
                  fill="currentColor"
                  aria-hidden="true"
              >
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7a5.002 5.002 0 0 0-3.005-4.901z" />
              </svg>
              Notifiche
            </button>

            {/* Access / login */}
            <Link
                to="/login"
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '0.5px solid var(--h-btn-border)',
                  background: 'var(--h-btn-bg)',
                  color: 'var(--h-text)',
                  textDecoration: 'none',
                  transition: 'background 150ms',
                  whiteSpace: 'nowrap',
                }}
            >
              Accesso
            </Link>

            <ThemeToggle />
          </div>
        </nav>
      </header>
  )
}
