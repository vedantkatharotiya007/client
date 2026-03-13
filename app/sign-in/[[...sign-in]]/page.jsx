"use client";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
return ( <div className="min-h-screen bg-gray-50 flex items-center justify-center">

```
  {/* Main Wrapper */}
  <div className="w-full min-h-screen md:min-h-0 md:max-w-5xl md:rounded-2xl md:shadow-lg md:overflow-hidden bg-white grid grid-cols-1 md:grid-cols-2">
    
    {/* Left Branding — Desktop Only */}
    <div className="hidden md:flex flex-col justify-center bg-gray-900 text-white p-12">
      <h1 className="text-3xl font-bold mb-4">
        Welcome back 👋
      </h1>
      <p className="text-gray-300">
        Sign in to continue your conversations and stay connected in real time.
      </p>

      <div className="mt-10 text-sm text-gray-400">
        Secure • Fast • Reliable
      </div>
    </div>

    {/* Right Form — Mobile Perfect Center */}
    <div className="flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-sm">
        
        {/* Mobile Header */}
        <div className="md:hidden text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Sign in
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back to your account
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-gray-900 hover:bg-black text-sm normal-case",
              card: "shadow-none",
            },
          }}
        />
      </div>
    </div>
  </div>
</div>
);
}