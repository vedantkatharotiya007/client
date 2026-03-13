export default function WaitCall({ endCall }) {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      
      <div className="text-center text-white">

        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
          📞
        </div>

        <h2 className="text-2xl font-semibold mb-2">
          Calling...
        </h2>

        <p className="text-gray-400 mb-6">
          Waiting for user to accept the call
        </p>

        <button
          onClick={endCall}
          className="bg-red-600 px-6 py-3 rounded-full hover:bg-red-700"
        >
          Cancel Call
        </button>

      </div>

    </div>
  );
}