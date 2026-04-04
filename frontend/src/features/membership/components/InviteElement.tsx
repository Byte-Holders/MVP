import React from 'react';
import { useAcceptInvite } from '../hooks/AcceptButtonCallback';
import { useRejectInvite } from '../hooks/RejectButtonCallback';

interface Props {
  invite: any;
  onAction: () => void;
}

export const InviteElement: React.FC<Props> = ({ invite, onAction }) => {
  const { handleAccept } = useAcceptInvite(onAction);
  const { handleReject } = useRejectInvite(onAction);

  return (
    <div className="flex items-center justify-between bg-[#44bd32] p-4 rounded-md border border-black/10">
      <div className="flex gap-4">
        <span className="bg-black text-white px-3 py-1 rounded text-xs font-mono">{invite.workspaceId}</span>
        <span className="bg-black text-white px-3 py-1 rounded text-xs font-mono">{invite.senderUsername}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleReject(invite.recipientUsername, invite.workspaceId)} className="bg-black text-white px-4 py-1 rounded text-xs font-bold hover:bg-red-600">Rifiuta</button>
        <button onClick={() => handleAccept(invite.recipientUsername, invite.workspaceId)} className="bg-black text-white px-4 py-1 rounded text-xs font-bold hover:bg-blue-600">Accetta</button>
      </div>
    </div>
  );
};