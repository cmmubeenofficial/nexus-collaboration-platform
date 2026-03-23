import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Settings } from 'lucide-react';

export type CallMode = 'video' | 'audio';

interface CallControlsProps {
  mode?: CallMode;
  isMuted: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
  onToggleMute: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  mode = 'video',
  isMuted,
  isVideoOff = false,
  isScreenSharing = false,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall
}) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-900/80 backdrop-blur-md px-3 sm:px-5 py-2.5 rounded-2xl shadow-xl border border-gray-700">
      {/* Mute Button */}
      <button
        data-tour="toggle-mute-btn"
        onClick={onToggleMute}
        className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 shadow-md flex items-center justify-center ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff size={20} className="sm:w-5 sm:h-5" /> : <Mic size={20} className="sm:w-5 sm:h-5" />}
      </button>

      {/* Video Button */}
      {mode === 'video' && onToggleVideo && (
        <button
          data-tour="toggle-video-btn"
          onClick={onToggleVideo}
          className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 shadow-md flex items-center justify-center ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? <VideoOff size={20} className="sm:w-5 sm:h-5" /> : <Video size={20} className="sm:w-5 sm:h-5" />}
        </button>
      )}

      {/* Screen Share */}
      {mode === 'video' && onToggleScreenShare && (
        <button
          data-tour="screen-share-btn"
          onClick={onToggleScreenShare}
          className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 shadow-md flex items-center justify-center ${isScreenSharing ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          <MonitorUp size={20} className="sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Settings (Mock) */}
      <button
        className="hidden sm:flex p-2.5 sm:p-3 rounded-full transition-all duration-200 shadow-md bg-gray-700 hover:bg-gray-600 text-white items-center justify-center"
        title="Settings"
      >
        <Settings size={20} className="w-5 h-5" />
      </button>

      <div className="w-px h-8 bg-gray-700 mx-1 sm:mx-2 hidden sm:block"></div>

      {/* End Call */}
      <button
        data-tour="end-call-btn"
        onClick={onEndCall}
        className="p-2.5 sm:p-3 ml-2 rounded-full transition-all duration-200 shadow-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
        title="End Call"
      >
        <PhoneOff size={20} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};
