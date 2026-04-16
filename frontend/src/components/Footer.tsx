export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--h-line)] bg-[var(--h-bg)]">
      <div className="flex items-center justify-between px-6 py-3">
        {/* LEFT: logo + nome */}
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto opacity-90" />
          <div
            className="w-[2px] h-[14px] rounded-full flex-shrink-0"
            style={{ background: 'var(--h-bar)' }}
          />
          <span style={{ color: 'var(--h-text-muted)', fontSize: '13px', fontWeight: 500 }}>
            CodeGuardian
          </span>
        </div>

        {/* CENTER: gruppo */}
        <span
          className="hidden sm:block"
          style={{ color: 'var(--h-text-muted)', fontSize: '12px', fontWeight: 500 }}
        >
          Realizzato dal gruppo Byte-Holders
        </span>

        {/* RIGHT: copyright */}
        <span style={{ color: 'var(--h-text-muted)', fontSize: '12px', fontWeight: 500 }}>
          &copy; {year}
        </span>
      </div>
    </footer>
  )
}
