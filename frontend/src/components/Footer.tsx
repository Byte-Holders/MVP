export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-[var(--h-line)] bg-[var(--h-bg)]">
      <div className="flex flex-col sm:flex-row items-center justify-between min-h-[52px] px-4 py-4 gap-4">
        {/* ── LEFT: Testo e Copyright ── */}
        <div
          className="flex items-center gap-3 text-center sm:text-left"
          style={{
            color: 'var(--h-text-muted)',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <span>&copy; {year} CodeGuardian</span>

          {/* Accent bar separator che richiama lo stile dell'header */}
          <div
            className="hidden sm:block w-[3px] h-[14px] rounded-full flex-shrink-0"
            style={{ background: 'var(--h-bar)' }}
          />

          <span className="hidden sm:inline">
            Realizzato dal gruppo Byte-Holders
          </span>
          <img src="/logo.png" alt="Logo" className="h-17 w-auto" />
        </div>

        {/* ── RIGHT: Social Links ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://x.com/tan_stack"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              border: '0.5px solid var(--h-btn-border)',
              background: 'var(--h-btn-bg)',
              color: 'var(--h-text)',
              textDecoration: 'none',
              transition: 'background 150ms, border-color 150ms',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--h-btn-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'var(--h-btn-bg)')
            }
          >
            <span className="sr-only">Follow TanStack on X</span>
            <svg viewBox="0 0 16 16" aria-hidden="true" width="24" height="24">
              <path
                fill="currentColor"
                d="M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z"
              />
            </svg>
          </a>

          <a
            href="https://github.com/Byte-Holders"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              border: '0.5px solid var(--h-btn-border)',
              background: 'var(--h-btn-bg)',
              color: 'var(--h-text)',
              textDecoration: 'none',
              transition: 'background 150ms, border-color 150ms',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--h-btn-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'var(--h-btn-bg)')
            }
          >
            <span className="sr-only">Go to Byte-Holders GitHub</span>
            <svg viewBox="0 0 16 16" aria-hidden="true" width="24" height="24">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}