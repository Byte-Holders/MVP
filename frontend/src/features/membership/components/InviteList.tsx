import { InviteElement } from './InviteElement';
import { useGetInvites } from '../hooks/UseGetInvite';

export function InviteList() {
  const { invites, loading, refresh } = useGetInvites();

  if (loading) return <div className="text-white text-center">Caricamento...</div>;

  return (
    <div className="flex flex-col gap-3">
      {invites.map((invite, index) => (
        <InviteElement key={index} invite={invite} onAction={refresh} />
      ))}
    </div>
  );
}