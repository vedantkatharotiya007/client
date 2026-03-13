"use client";

import { Phone, Video } from "lucide-react";

export default function CallButtons({ onAudioCall, onVideoCall }) {
  return (
    <div className="flex gap-2 ml-auto">
      
      {/* Audio Call */}
      <button
        onClick={onAudioCall}
        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
      >
        <Phone size={18} />
      </button>

      {/* Video Call */}
      <button
        onClick={onVideoCall}
        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
      >
        <Video size={18} />
      </button>

    </div>
  );
}