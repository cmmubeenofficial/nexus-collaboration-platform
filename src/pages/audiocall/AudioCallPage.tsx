import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Joyride } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';
import { useTour } from '../../context/TourContext';
import { CallControls } from '../../components/videocall/CallControls';
import { ParticipantsList } from '../../components/videocall/ParticipantsList';
import { users } from '../../data/users';
import { audioCallTourSteps } from '../../config/tourSteps';

export const AudioCallPage: React.FC = () => {
  const { user } = useAuth();
  const { isRunning, currentTour, hasCompletedTour, startTour } = useTour();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localStreamRef = useRef<MediaStream | null>(null);

  // Find the target user or default to null if not specified
  const targetUser = targetUserId ? users.find(u => u.id === targetUserId) : null;
  const mockRemoteUser = targetUser || users[0];

  const participants = [
    {
      user: user!,
      isMuted,
      isVideoOff: true,
      isSpeaking: !isMuted && Math.random() > 0.5, // Mock speaking status
    },
    {
      user: mockRemoteUser,
      isMuted: false,
      isVideoOff: true,
      isSpeaking: true,
    }
  ];

  // Request actual mic access
  useEffect(() => {
    let mounted = true;

    if (!targetUser) return; // Don't access mic in selection screen

    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (mounted) {
          localStreamRef.current = stream;
        } else {
          // If unmounted while waiting for permission, stop tracks
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing microphone.", err);
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

  // Handle Mute toggle
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetUser]);

  // Auto-start tour on first visit
  useEffect(() => {
    if (targetUser && !hasCompletedTour('audioCall') && currentTour !== 'audioCall') {
      const timer = setTimeout(() => {
        startTour('audioCall');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [targetUser, hasCompletedTour, startTour, currentTour]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate(-1);
  };

  if (!user) return null;

  // Render User Selection Screen if no target user
  if (!targetUser) {
    const availableUsers = users.filter(u => u.id !== user.id);

    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-50 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Start an Audio Call</h1>
          <p className="text-gray-600 mb-8">Select a contact to start an end-to-end encrypted voice call.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableUsers.map((availableUser) => (
              <div
                key={availableUser.id}
                onClick={() => navigate(`/audio-call?userId=${availableUser.id}`)}
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

  return (
    <>
      {/* Onboarding Tour */}
      {currentTour === 'audioCall' && (
        <Joyride
          steps={audioCallTourSteps}
          run={isRunning}
          continuous
        />
      )}

      <div data-tour="audio-call-container" className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-gray-50 overflow-hidden animate-fade-in relative">

        {/* Main Audio Area */}
        <div className="flex-1 relative bg-gray-900 flex flex-col justify-center items-center overflow-hidden">

          {/* Header Info (Overlay) */}
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center text-white">
            <div>
              <h1 className="text-lg sm:text-xl font-bold truncate">Call with {mockRemoteUser.name}</h1>
              <p className="text-sm opacity-80">{formatDuration(callDuration)} • Secure Audio</p>
            </div>
          </div>

          {/* Central Audio Visualization Area */}
          <div data-tour="audio-call-container" className="flex flex-col items-center justify-center w-full h-full relative z-0">
            <div className="relative" data-tour="user-avatar-large">
              {/* Simple pulsing ring to simulate speaking */}
              <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-20 scale-150"></div>

              <img
                src={mockRemoteUser.avatarUrl}
                alt={mockRemoteUser.name}
                className="w-32 h-32 sm:w-48 sm:h-48 rounded-full border-4 border-gray-800 shadow-2xl relative z-10 object-cover"
              />
            </div>
            <h2 className="mt-8 text-2xl font-semibold text-white">{mockRemoteUser.name}</h2>
            <p data-tour="call-timer" className="text-gray-400 mt-2">{formatDuration(callDuration)}</p>
          </div>

          {/* Call Controls Toolbar */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-full px-4 sm:px-0 sm:w-auto">
            <CallControls
              mode="audio"
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              onEndCall={handleEndCall}
            />
          </div>
        </div>

        {/* Participants Sidebar (Desktop) */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200 z-10 shadow-lg shrink-0 overflow-y-auto">
          <ParticipantsList participants={participants} />
        </div>

      </div>
    </>
  );
};
