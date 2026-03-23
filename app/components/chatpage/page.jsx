"use client";

import { useEffect, useRef } from "react";

export default function ChatMessages({
  messages = [],
  currentUserId,
  onLoadMore, // function to fetch older messages
  hasMore = true,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // ✅ Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Detect scroll to top (load previous messages)
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loadingMoreRef.current) return;

    if (el.scrollTop === 0 && hasMore) {
      loadingMoreRef.current = true;

      const prevHeight = el.scrollHeight;

      Promise.resolve(onLoadMore?.()).finally(() => {
        // maintain scroll position after loading old messages
        requestAnimationFrame(() => {
          const newHeight = el.scrollHeight;
          el.scrollTop = newHeight - prevHeight;
          loadingMoreRef.current = false;
        });
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50"
    >
      {/* 🔼 Load more indicator */}
      {hasMore && (
        <div className="text-center text-xs text-gray-400 py-2">
          Scroll up to load older messages
        </div>
      )}

      {/* 💬 Messages */}
      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserId;

        return (
          <div
            key={msg._id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow-sm
                ${
                  isMe
                    ? "bg-gray-200 text-gray-900 rounded-br-sm  border"
                    : "bg-white text-gray-900 rounded-bl-sm border"
                }
              `}
            >

  {/* IMAGE */}
 {msg.file && msg.file.match(/\.(jpg|jpeg|png|gif)$/) && (
      <img src={`${process.env.NEXT_PUBLIC_API_URL}${msg.file}`} className="w-40 rounded" />
    )}

    {msg.file && msg.file.match(/\.(mp4|webm)$/) && (
      <video src={`${process.env.NEXT_PUBLIC_API_URL}${msg.file}`} controls className="w-40" />
    )}

    {msg.file && msg.file.match(/\.(mp3|wav)$/) && (
      <audio src={`${process.env.NEXT_PUBLIC_API_URL}${msg.file}`} controls />
    )}

    {msg.file && msg.file.endsWith(".pdf") && (
      <a href={`${process.env.NEXT_PUBLIC_API_URL}${msg.file}`} target="_blank" className="text-white-600 underline">
        📄 Open PDF
      </a>
    )}

    {msg.file && msg.file.endsWith(".txt") && (
      <a href={`${process.env.NEXT_PUBLIC_API_URL}${msg.file}`} target="_blank" className="text-white-600 underline">
        📄 View Text File
      </a>
    )}

    {msg.file && msg.file.endsWith(".zip") && (
      <a href={`${process.env.NEXT_PUBLIC_API_URL}${msg.file}`} download className="text-white-600 underline">
        📦 Download ZIP
      </a>
    )}
  {msg.text && (
<p >{msg.text}</p>
)}

              {/* 🕒 Time */}
              <p
                className={`
                  text-[10px] mt-1 text-right
                  ${isMe ? "text-gray-600" : "text-gray-400"}
                `}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}

      {/* 🔽 bottom anchor */}
      <div ref={bottomRef} />
    </div>
  );
}