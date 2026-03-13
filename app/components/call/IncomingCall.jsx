"use client";

import Image from "next/image";

export default function IncomingCall({
  caller,
  onAccept,
  onReject,
}) {
  
  if (!caller) return null;
console.log(caller);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-80 text-center">

        <Image
          src={caller.url}
          alt="caller"
          width={70}
          height={70}
          className="rounded-full mx-auto mb-3"
        />

        <h2 className="text-lg font-semibold">
          {caller.name}
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Incoming Call...
        </p>

        <div className="flex justify-center gap-4">

          <button
            onClick={onReject}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Reject
          </button>

          <button
            onClick={onAccept}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Accept
          </button>

        </div>

      </div>

    </div>
  );
}