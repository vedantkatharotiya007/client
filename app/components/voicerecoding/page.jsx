import { useRef, useState } from "react";

export default function VoiceRecorder({ onSend }) {
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      chunks.current = [];

      const file = new File([blob], "voice.webm", { type: "audio/webm" });

      onSend(file);
    };

    mediaRecorder.current.start();
    setRecording(true);

    // start timer
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();

    mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());

    clearInterval(timerRef.current);
    setTime(0);
    setRecording(false);
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (<div className="flex items-center gap-3">
      
      {/* Timer + Recording Text */}
      {recording && (
        <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-600 font-medium">
            {formatTime(time)}
          </span>
          <span className="text-xs text-gray-600">Recording...</span>
        </div>
      )}

      {/* Toggle Button */}
      {!recording ? (
        <button
          onClick={startRecording}
          className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl"
        >
          🎤
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xl"
        >
          ⏹
        </button>
      )}
    </div>
 );
}