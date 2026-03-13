"use client";

import { useUser, UserButton } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-200">
      {/* Container */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Profile
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your account information
            </p>
          </div>

          <UserButton afterSignOutUrl="/sign-in" />
        </div>

       
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
         
          <div className="h-32 md:h-40 bg--to-r from-gray-900 to-gray-700" />

         
          <div className="px-6 md:px-10 pb-10">
            
            
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              
              <img
                src={user?.imageUrl}
                alt="profile"
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
              />

              <div className="mt-2 md:mt-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

           
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <InfoCard
                label="User ID"
                value={user?.id}
              />

              <InfoCard
                label="Email"
                value={user?.primaryEmailAddress?.emailAddress}
              />

              <InfoCard
                label="First Name"
                value={user?.firstName || "—"}
              />

              <InfoCard
                label="Last Name"
                value={user?.lastName || "—"}
              />

              <InfoCard
                label="Joined"
                value={new Date(user?.createdAt).toLocaleDateString()}
              />

              <InfoCard
                label="Username"
                value={user?.username || "—"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
      <p className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-2 font-semibold text-gray-900 break-all">
        {value}
      </p>
    </div>
  );
}