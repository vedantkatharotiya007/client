"use client";
import { useEffect, useRef, useState } from "react";

export default function VideoCall({ socket, userid, myId, isCaller, onEnd,user }) {

 
const [micOn, setMicOn] = useState(true);
  const localVideo = useRef(null);
  const localStream = useRef(null);
  const pcs = useRef({});
  const iceQueue = useRef({});
  const started = useRef(false);

  const [videos, setVideos] = useState({});
const toggleMic = async () => {
  if (!localStream.current) return;

  const audioTrack = localStream.current.getAudioTracks()[0];
  if (!audioTrack) return;

  if (micOn) {
    audioTrack.enabled = false;
    setMicOn(false);
  } else {
    audioTrack.enabled = true;
    setMicOn(true);
  }

  // update sender track
  Object.values(pcs.current).forEach((pc) => {
    const sender = pc.getSenders().find(s => s.track?.kind === "audio");
    if (sender) sender.track.enabled = !micOn;
  });

};

  const servers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject"
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject"
      }
    ]
  };

  // =========================
  // START MEDIA
  // =========================
  const startMedia = async () => {

    if (localStream.current) return;

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStream.current = stream;

      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

    } catch {

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      localStream.current = stream;

      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

    }

  };

  // =========================
  // CREATE PEER
  // =========================
  const createPeer = async (userId) => {

    if (!localStream.current) {
      await startMedia();
    }

    if (pcs.current[userId]) {
      return pcs.current[userId];
    }

    console.log("Creating peer for:", userId);

    const pc = new RTCPeerConnection(servers);

    pcs.current[userId] = pc;

    localStream.current.getTracks().forEach(track => {
      pc.addTrack(track, localStream.current);
    });

    pc.ontrack = (event) => {

      const stream = event.streams[0];

      console.log("Remote stream from:", userId);

      setVideos(prev => ({
        ...prev,
        [userId]: stream
      }));

    };

    pc.onicecandidate = (event) => {

      if (event.candidate) {

        socket.emit("ice-candidate", {
          toUserId: userId,
          fromUserId: myId,
          candidate: event.candidate
        });

      }

    };

    pc.onconnectionstatechange = () => {

      console.log("Peer state", userId, pc.connectionState);

      if (pc.connectionState === "failed") {
        console.log("Connection failed:", userId);
      }

    };

    return pc;

  };

  // =========================
  // CALL USER
  // =========================
  const callUser = async (userId) => {

    const pc = await createPeer(userId);

    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    socket.emit("offer", {
      toUserId: userId,
      fromUserId: myId,
      offer
    });

    console.log("Offer sent to:", userId);

  };

  // =========================
  // HANDLE OFFER
  // =========================
  const handleOffer = async ({ offer, fromUserId }) => {

    console.log("Offer received from:", fromUserId);

    const pc = await createPeer(fromUserId);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    if (iceQueue.current[fromUserId]) {

      for (const c of iceQueue.current[fromUserId]) {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      }

      iceQueue.current[fromUserId] = [];

    }

    const answer = await pc.createAnswer();

    await pc.setLocalDescription(answer);

    socket.emit("answer", {
      toUserId: fromUserId,
      fromUserId: myId,
      answer
    });

    console.log("Answer sent to:", fromUserId);

  };

  // =========================
  // HANDLE ANSWER
  // =========================
  const handleAnswer = async ({ answer, fromUserId }) => {

    console.log("Answer from:", fromUserId);

    const pc = pcs.current[fromUserId];
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(answer));

    if (iceQueue.current[fromUserId]) {

      for (const c of iceQueue.current[fromUserId]) {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      }

      iceQueue.current[fromUserId] = [];

    }

  };

  // =========================
  // HANDLE ICE
  // =========================
  const handleIceCandidate = async ({ candidate, fromUserId }) => {

    let pc = pcs.current[fromUserId];

    if (!pc) {

      if (!iceQueue.current[fromUserId]) {
        iceQueue.current[fromUserId] = [];
      }

      iceQueue.current[fromUserId].push(candidate);
      return;

    }

    if (pc.remoteDescription) {

      await pc.addIceCandidate(new RTCIceCandidate(candidate));

    } else {

      if (!iceQueue.current[fromUserId]) {
        iceQueue.current[fromUserId] = [];
      }

      iceQueue.current[fromUserId].push(candidate);

    }

  };

 
  

  useEffect(() => {

    if (!socket) return;
    if(isCaller === true){
        console.log("User accepted call:", userid);

        if (pcs.current[userid]) {
    console.log("Peer already exists for", userid);
    return;
  }

     callUser(userid);
    }

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
  




    return () => {

      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
socket.off("call-accepted");
    };

  }, [socket,userid]);

  // =========================
  // INIT CALL
  // =========================
  useEffect(() => {

    const init = async () => {

      if (started.current) return;
      started.current = true;

      await startMedia();

     

    };

    init();

  }, []);

  // =========================
  // END CALL
  // =========================
 const endCall = () => {

  // close all peer connections
  Object.values(pcs.current).forEach(pc => pc.close());
  pcs.current = {};

  // stop camera & mic
  if (localStream.current) {
    localStream.current.getTracks().forEach(track => track.stop());
    localStream.current = null;
  }

  // reset states
  setVideos({});
  iceQueue.current = {};
  started.current = false;

  socket.emit("end-call", { user });

  onEnd();
};
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  handleResize();
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  // =========================
  // UI
  // =========================
 
  return (
<div className="w-full h-screen bg-gray-900 flex flex-col md:flex-row">

  {/* Video Call Area */}
  <div className="flex-1 flex flex-col relative md:order-1">
    {/* Remote Videos Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 flex-1 overflow-auto">
      {Object.entries(videos).map(([id, stream]) => (
        <video
          key={id}
          autoPlay
          playsInline
          ref={video => { if(video) video.srcObject = stream }}
          className="w-full h-60 sm:h-48 md:h-56 lg:h-64 rounded-xl border border-gray-700 shadow-lg object-cover"
        />
      ))}
    </div>

    {/* Local Video Preview */}
    <video
      ref={localVideo}
      autoPlay
      muted
      playsInline
      className="absolute bottom-24 right-4 w-36 h-36 rounded-xl border-2 border-white shadow-lg object-cover md:w-48 md:h-48"
    />

    {/* Control Bar */}
   <div className={`${
  isMobile ? "fixed bottom-6 left-1/2 -translate-x-1/2" : "absolute bottom-6 left-1/2 -translate-x-1/2"
} flex gap-4 bg-gray-800 bg-opacity-70 px-6 py-3 rounded-full shadow-xl z-50`}>
  <button
    onClick={endCall}
    className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full hover:bg-red-700 transition"
  >
    End
  </button>
  <button
  onClick={toggleMic}
  className={`flex items-center justify-center w-12 h-12 rounded-full transition ${
    micOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"
  }`}
>
  {micOn ? "🎤" : "🔇"}
</button>
 
  <button className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full hover:bg-gray-600 transition">
    🖥
  </button>
</div>
  </div>

  
</div>

  );

}