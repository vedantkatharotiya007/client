"use client";
import { io } from "socket.io-client";
process.env.NEXT_PUBLIC_API_URL;
console.log("SOCKET URL:",process.env.NEXT_PUBLIC_API_URL);
export const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
  autoConnect: false, 
});
socket.on("connect", () => {
  console.log("✅ socket connected", socket.id);
});