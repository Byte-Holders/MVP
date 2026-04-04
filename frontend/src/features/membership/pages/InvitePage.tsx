import { InviteList } from '../components/InviteList'

export function InvitePage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#17141f] p-4 sm:p-8">
      {/* Box azzurro del mockup */}
      <div className="mx-auto max-w-5xl rounded-xl border border-[var(--h-line)] bg-[#3d85c6] p-4 shadow-2xl">
        <div className="mb-4 border-b border-white/20 pb-2">
          <h1 className="text-lg font-bold uppercase tracking-tight text-white">
            Inviti Ricevuti
          </h1>
        </div>

        {/* Area Lista */}
        <div className="rounded-lg bg-[#9fc5e8] p-4 min-h-[300px]">
          <InviteList />
        </div>
      </div>
    </main>
  )
}