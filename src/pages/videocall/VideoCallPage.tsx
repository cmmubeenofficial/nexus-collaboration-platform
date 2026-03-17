import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CallControls } from '../../components/videocall/CallControls';
import { ParticipantsList } from '../../components/videocall/ParticipantsList';
import { users } from '../../data/users';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // WhatsApp-like video swap and drag states
  const [isLocalMain, setIsLocalMain] = useState(false);
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Find the target user or default to a mock user for visual layout
  const targetUser = targetUserId ? users.find(u => u.id === targetUserId) : null;
  const mockRemoteUser = targetUser || users[0];

  const participants = [
    {
      user: user!,
      isMuted,
      isVideoOff,
      isSpeaking: !isMuted && Math.random() > 0.5, // Mock speaking status
    },
    {
      user: mockRemoteUser,
      isMuted: false,
      isVideoOff: false,
      isSpeaking: true,
    }
  ];

  // Request actual camera and mic access
  useEffect(() => {
    let mounted = true;

    if (!targetUser) return; // Don't access media in selection screen

    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (mounted) {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } else {
          // If unmounted while waiting for permission, stop tracks
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        // Fallback or error state could be handled here
      }
    };

    startLocalStream();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [targetUser]);

  // Handle Mute/Video toggles
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isMuted, isVideoOff]);

  // Call timer
  useEffect(() => {
    if (!targetUser) return; // Don't start timer until a user is selected
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetUser]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);

        // Handle user stopping screen share via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
      } catch (err) {
        console.error("Error sharing screen.", err);
      }
    } else {
      // Revert to camera
      setIsScreenSharing(false);
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate(-1);
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId);
    }
    setIsDragging(true);
    setHasDragged(false);
    dragStart.current = { x: e.clientX - pipPosition.x, y: e.clientY - pipPosition.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setHasDragged(true);
    setPipPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.releasePointerCapture) {
      target.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    if (!hasDragged) {
      // Just a click without dragging -> Swap
      setIsLocalMain(prev => !prev);
    }
  };

  if (!user) return null;

  // Render User Selection Screen if no target user
  if (!targetUser) {
    const availableUsers = users.filter(u => u.id !== user.id);

    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-50 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Start a Video Call</h1>
          <p className="text-gray-600 mb-8">Select a contact to start an end-to-end encrypted video meeting.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableUsers.map((availableUser) => (
              <div
                key={availableUser.id}
                onClick={() => navigate(`/video-call?userId=${availableUser.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group"
              >
                <img
                  src={availableUser.avatarUrl}
                  alt={availableUser.name}
                  className="w-24 h-24 rounded-full mb-4 border-4 border-gray-50 group-hover:border-primary-100 transition-colors object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900">{availableUser.name}</h3>
                <p className="text-sm text-gray-500 capitalize mb-4">{availableUser.role}</p>
                <button className="w-full bg-primary-600 text-white rounded-lg py-2 font-medium group-hover:bg-primary-700 transition-colors">
                  Call Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const remoteVideoContent = (
    <img
      src={mockRemoteUser.avatarUrl.replace('ui-avatars.com', 'images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')}
      alt="Remote Call"
      className="w-full h-full object-cover opacity-80 pointer-events-none select-none"
      draggable={false}
      onError={(e) => {
        (e.target as HTMLImageElement).src = mockRemoteUser.avatarUrl;
      }}
    />
  );

  const localVideoContent = isVideoOff ? (
    <div className="w-full h-full flex items-center justify-center bg-gray-800 pointer-events-none select-none">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl">
        {user.name.charAt(0)}
      </div>
    </div>
  ) : (
    <video
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      className={`w-full h-full object-cover pointer-events-none select-none ${!isScreenSharing ? 'scale-x-[-1]' : ''}`}
    />
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-gray-50 overflow-hidden animate-fade-in relative">

      {/* Main Video Area */}
      <div className="flex-1 relative bg-gray-900 flex flex-col justify-center items-center overflow-hidden">

        {/* Header Info (Overlay) */}
        {targetUser && (
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center text-white">
            <div>
              <h1 className="text-lg sm:text-xl font-bold truncate">Meeting with {mockRemoteUser.name}</h1>
              <p className="text-sm opacity-80">{formatDuration(callDuration)} • Secure Call</p>
            </div>
          </div>
        )}

        {/* Remote Video Container */}
        <div
          className={
            !isLocalMain
              ? "absolute inset-0 w-full h-full z-0"
              : "absolute bottom-24 right-4 sm:bottom-6 sm:right-6 w-28 sm:w-48 lg:w-64 aspect-[3/4] sm:aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-20 cursor-grab active:cursor-grabbing touch-none select-none"
          }
          style={isLocalMain ? { transform: `translate(${pipPosition.x}px, ${pipPosition.y}px)` } : { transform: 'translate(0px, 0px)' }}
          onPointerDown={isLocalMain ? handlePointerDown : undefined}
          onPointerMove={isLocalMain ? handlePointerMove : undefined}
          onPointerUp={isLocalMain ? handlePointerUp : undefined}
          onPointerCancel={isLocalMain ? handlePointerUp : undefined}
        >
          {remoteVideoContent}
          {isLocalMain && (
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white backdrop-blur-sm pointer-events-none">
              {mockRemoteUser.name}
            </div>
          )}
        </div>

        {/* Local Video Container */}
        <div
          className={
            isLocalMain
              ? "absolute inset-0 w-full h-full z-0"
              : "absolute bottom-24 right-4 sm:bottom-6 sm:right-6 w-28 sm:w-48 lg:w-64 aspect-[3/4] sm:aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-20 cursor-grab active:cursor-grabbing touch-none select-none"
          }
          style={!isLocalMain ? { transform: `translate(${pipPosition.x}px, ${pipPosition.y}px)` } : { transform: 'translate(0px, 0px)' }}
          onPointerDown={!isLocalMain ? handlePointerDown : undefined}
          onPointerMove={!isLocalMain ? handlePointerMove : undefined}
          onPointerUp={!isLocalMain ? handlePointerUp : undefined}
          onPointerCancel={!isLocalMain ? handlePointerUp : undefined}
        >
          {localVideoContent}
          {!isLocalMain && (
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white backdrop-blur-sm pointer-events-none">
              You {isMuted && <span className="text-red-400 ml-1">(Muted)</span>}
            </div>
          )}
        </div>

        {/* Call Controls Toolbar */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-full px-4 sm:px-0 sm:w-auto">
          <CallControls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            onToggleMute={() => setIsMuted(!isMuted)}
            onToggleVideo={() => setIsVideoOff(!isVideoOff)}
            onToggleScreenShare={handleToggleScreenShare}
            onEndCall={handleEndCall}
          />
        </div>
      </div>

      {/* Participants Sidebar (Desktop) / Bottom Sheet (Mobile could be implemented here) */}
      <div className="hidden lg:block w-80 bg-white border-l border-gray-200 z-10 shadow-lg shrink-0 overflow-y-auto">
        <ParticipantsList participants={participants} />
      </div>

    </div>
  );
};
