import React from 'react';
import { User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface Participant {
  user: User;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          Participants
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
            {participants.length}
          </span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {participants.map((p, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar src={p.user.avatarUrl} alt={p.user.name} size="md" status={p.user.isOnline ? 'online' : 'offline'} />
                {p.isSpeaking && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{p.user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{p.user.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              {p.isMuted ? <MicOff size={16} className="text-red-500" /> : <Mic size={16} className={p.isSpeaking ? 'text-green-500' : ''} />}
              {p.isVideoOff ? <VideoOff size={16} className="text-red-500" /> : <Video size={16} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
