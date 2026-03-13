"use client";
import CallButtons from "../components/call/CallButtons";
import Link from "next/link";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Search } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { socket } from "@/lib/socket";
import { useState, useEffect, use } from "react";
import ChatMessages from "../components/chatpage/page";
import IncomingCall from "../components/call/IncomingCall";
import VideoCall from "../components/call/VideoCall";
import WaitCall from "../components/call/waitcall";
export default function ChatPage() {
  const [incomingCall, setIncomingCall] = useState(null);
const [inCall, setInCall] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [friends, setFriends] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
const [groupName, setGroupName] = useState("");
const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mongouid, setmongouid] = useState([]);
  const [isCaller, setIsCaller] = useState(false);
  const [calluser,setcalluser]=useState(null);
  const[uid,setuid]=useState([]);
  const [onwait, setonwait] = useState(false);
  var { user } = useUser();


  const [input, setinput] = useState("");
  useEffect(() => {
    socket.connect();
    socket.emit("user",{mongouid});
    console.log("connection on",mongouid);
    
 return () => {
    socket.disconnect();
  };
  },[mongouid]);
 useEffect(() => {

   
   const handleAccepted = (userId) => {
     console.log("Call accepted", userId);
 
   setonwait(false);
   setuid(userId);
    setInCall(true) 
 
   };
   socket.on("call-accepted", handleAccepted);
   
   return () => socket.off("call-accepted", handleAccepted);
   
});
  const startCall = (type) => {

  if (!selectedFriend) return;
setonwait(true);
  const callUsers = selectedFriend.members
    ? selectedFriend.members.map(m => m._id || m)
    : [selectedFriend.user._id];

  const filteredUsers = callUsers.filter(id => id !== mongouid);

  setcalluser(filteredUsers);

  setIsCaller(true);

  socket.emit("call-user", {
    toUserId: filteredUsers,
    name: user?.fullName,
    url: user?.imageUrl,
    fromUserId: mongouid,
    callType: type,
    users: filteredUsers
  });

};;
useEffect(() => {

  const handleIncomingCall = (data) => {
    setcalluser(data.users);
    setIncomingCall(data);
    
  };

  socket.on("incoming-call", handleIncomingCall);

  return () => {
    socket.off("incoming-call", handleIncomingCall);
  };

}, []);
const acceptCall = () => {
  socket.emit("accept-call", {
    toUserId: incomingCall.fromUserId
  });
  
  setInCall(true);
  setIncomingCall(null);
};

const rejectCall = () => {
  let callerid=incomingCall.fromUserId;
  let userscall=incomingCall.users;
if(userscall.length > 1){
  return   setIncomingCall(null);
}

  socket.emit("reject-call", {
    fromUserId: mongouid,
    toUserId:callerid
  });

  setIncomingCall(null);
};
const endCall = () => {
  socket.emit("end-call", {
    users:selectedFriend.members? selectedFriend.members : selectedFriend.user._id,
    toUserId:mongouid
  });
  setInCall(false);
  setonwait(false);
};

  const toggleUserSelect = (user) => {
  setSelectedUsers((prev) => {
    const exists = prev.find((u) => u._id === user._id);
    if (exists) {
      return prev.filter((u) => u._id !== user._id);
    }
    return [...prev, user];
  });
};
const createGroup = async () => {
  if (!groupName.trim()) {
    return alert("Enter group name");
  }

  // if (selectedUsers.length < 2) {
  //   return alert("Select at least 2 users");
  // }

  try {
    const res = await fetcher("/api/group/create", {
      method: "POST",
      body: {
        name: groupName,
        members: selectedUsers.map((u) => u._id),
        adminId: mongouid,
      },
    });

    alert(res.message);
    setShowGroupModal(false);
    setGroupName("");
    setSelectedUsers([]);
  } catch (err) {
    console.log(err);
  }
};
    useEffect(() => {
       if (!selectedFriend) return;
     
      console.log("user id",mongouid);
      if(selectedFriend.members){
        let chatId=selectedFriend.chatid
         socket.emit("join-groupchat",{chatId});
         console.log(chatId);
         
      }
      else{
let chatId=selectedFriend.chatId;
console.log("hii",chatId);

        socket.emit("join-chat",{chatId});
      }
      return () => {
        let chatId=selectedFriend.chatid || selectedFriend.chatId;
        console.log("chat id",chatId);
        
    socket.emit("leave-chat",{chatId});
  };
 
    },[selectedFriend]);
    let callened=async(data)=>{
      console.log("call ended");
      setonwait(false);
      setIncomingCall(null);
   
    }
    let callrejected=async(data)=>{
     alert("Call rejected");
      
   setonwait(false);
   
   
    }
    
    useEffect(() => {
      let handlefriendgroup=(data)=>{
        console.log("friend",data);

        setFriends((prev) => [...prev, data]);

        
    
      }
 const handleMessage = (data) => {

  
    setMessages((prev) => {
      const exists = prev.some((m) => m._id === data._id);
      if (exists) return prev;
      return [ ...prev, data ];
    });
  };
      socket.on("message", handleMessage);
      socket.on("create",handlefriendgroup);
      socket.on("call-ended",callened);
      socket.on("call-rejected",callrejected);

    return () => {
    socket.off("message", handleMessage);
    socket.off("create", handlefriendgroup);
  }; 
    }, [socket]);
  const handle=async()=>{
  
    if(input===""){
      return alert("Please enter a message");
    }
    console.log("enter");
    
    let data={
      userId:user.id,
      friend:selectedFriend,
      message:input,
    }
  
   let res=await fetcher("/api/chat/addmessage", {
      method: "POST",
      body: {data},
    });
    
    console.log(res);
    setinput("");
    
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 2000); 

    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setUsers([]);
      return;
    }

    searchUsers(debouncedSearch);
  }, [debouncedSearch]);
  const searchUsers = async (value) => {
    try {
      setLoadingUsers(true);

      const res = await fetcher("/api/user/search", {
        method: "POST",
        body: { query: value,id:user.id },
        
      });
console.log(res);

      setUsers(res || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingUsers(false);
    }
  };
  const addFriend = async (friendId) => {
    try {
      let res=await fetcher("/api/friend/add", {
        method: "POST",
        body:{
          userId: user.id,
          friendId,
        },
      
      });

      alert(res.message);
    } catch (err) {
      console.log(err);
    }
  };
  let fetchfriend = async () => {
    if (!user?.id) return <>loading</>;
    try {



      let res = await fetcher("/api/user/create", { method: "POST", body: user });
      if(res.message){
      return  alert(res.message);
      }
      console.log(res.friends);
      
setFriends(res.friends);
setmongouid(res.mongouid);

console.log(res);

    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
   
    fetchfriend();

  }, [user?.id]);
  const fetchMessage = async (friend) => {
    setSelectedFriend(friend)
    let res=await fetcher("/api/chat/getmessage", {
      method: "POST",
      body: {userId:user.id,friend:friend}
    })
  
    if(res.message){
      return  setMessages([]);
      }
console.log(res);

    setMessages(res);
  }





 return (
  <div className="h-screen w-full bg-gray-100 flex overflow-hidden">
    <aside
      className={`
        bg-white border-r flex flex-col
        w-full md:w-[35%] lg:w-[32%] xl:w-[30%]
        ${selectedFriend ? "hidden md:flex" : "flex"}
      `}
    >
  
      <div className="p-4 border-b flex items-center gap-3">
        <Link href="/profile">
        <Image
          src={user?.imageUrl || "https://i.pravatar.cc/150?img=5"}
          alt="profile"
          width={45}
          height={45}
          className="rounded-full"
        />
        </Link>
        <div>
          <h2 className="font-semibold">{user?.fullName}</h2>
          <p className="text-xs text-gray-500">Online</p>
        </div>
        
      </div>

      <div className="p-3 border-b">
       
<div className="px-3 pb-3">
  <button
    onClick={() => setShowGroupModal(true)}
    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg"
  >
    ➕ Create Group
  </button>
</div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

   
      {search && (
        <div className="border-b max-h-60 overflow-y-auto">
          {loadingUsers && (
            <p className="p-3 text-sm text-gray-500">Searching...</p>
          )}

          {!loadingUsers && users.length === 0 && (
            <p className="p-3 text-sm text-gray-500">No users found</p>
          )}

          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between p-3 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={u.image || "https://i.pravatar.cc/150"}
                  alt={u.name}
                  width={35}
                  height={35}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">{u.name}</span>
              </div>

              <button
                onClick={() => addFriend(u._id)}
                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

   
      <div className="flex-1 overflow-y-auto">
        {friends.length === 0 && (
          <p className="p-3 text-sm text-gray-500">No friends yet</p>
        )}

        {friends.map((friend) => (
          <div
            key={friend._id}
            onClick={() => fetchMessage(friend)}
            className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
          >
            <Image
              src={friend.user?.image || friend.image? friend.user?.image || friend.image : "https://i.pravatar.cc/150"}
              alt={friend.user?.name||"friend"}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium">{friend.user?.name|| friend.name}</span>
          </div>
        ))}
      </div>
    </aside>

    <main
      className={`
        flex-1 flex-col bg-gray-50
        ${selectedFriend ? "flex" : "hidden md:flex"}
      `}
    >
      {!selectedFriend ? (
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-600">
            Select a chat to start messaging 💬
          </h1>
        </div>
      ) : (
        <>
          <div className="p-4 bg-white border-b flex items-center gap-3">
           
            <button
              onClick={() => setSelectedFriend(null)}
              className="md:hidden text-sm"
            >
              ←
            </button>

            <Image
              src={selectedFriend.user?.image|| "https://i.pravatar.cc/150"}
              alt={selectedFriend.user?.name || selectedFriend?.name || "friend"}
              width={40}
              height={40}
              className="rounded-full"
            />

            <div>
              <h2 className="font-semibold">{selectedFriend.name|| selectedFriend.user?.name}</h2>
              <p className="text-xs text-gray-500">Online</p>
            </div>
             <CallButtons disabled={inCall === true || onwait=== true}
  onAudioCall={() => startCall("audio")}
  onVideoCall={() => startCall("video")}
/>
          </div>

          {/* 💬 Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
          <ChatMessages
  messages={messages}
  currentUserId={mongouid}
  onLoadMore={""}
/>
          </div>

          {/* ✍️ Input */}
          <div className="p-3 bg-white border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setinput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
            />
            <button onClick={handle} className="bg-black text-white px-4 rounded-lg">
              Send
            </button>
          </div>
        </>
      )}
    </main>
    {/* 🧩 GROUP MODAL */}
    <IncomingCall
      caller={incomingCall}
      onAccept={acceptCall}
      onReject={rejectCall}
    />
    {
      onwait && <WaitCall endCall={endCall} />
    }
   
    {/* Video Call Screen */}
  {inCall && (
    <div className={`absolute inset-0 z-50
      md:static md:flex-1 flex flex-col bg-gray-900`}>
<VideoCall 
  socket={socket}
userid={uid}
  myId={mongouid}
  isCaller={isCaller}
  user={calluser}
  onEnd={() => setInCall(false)}
 onwait={onwait}
/>
 </div>
)}
{showGroupModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[90%] max-w-md rounded-xl p-4">
      
      <h2 className="text-lg font-semibold mb-3">Create Group</h2>

      {/* Group name */}
      <input
        type="text"
        placeholder="Group name..."
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
      />

      {/* Users list */}
      <div className="max-h-60 overflow-y-auto border rounded-lg">
        {friends.filter((friend)=>{return friend?.user?.clerkId}).map((friend) => {
          const selected = selectedUsers.find(
            (u) => u._id === friend.user?._id
          );

          return (
            <div
              key={friend.user?._id}
              onClick={() => toggleUserSelect(friend.user)}
              className={`flex items-center gap-3 p-2 cursor-pointer ${
                selected ? "bg-green-100" : "hover:bg-gray-100"
              }`}
            >
              <Image
                src={friend.user?.image}
                alt={friend.user?.name}
                width={35}
                height={35}
                className="rounded-full"
              />
              <span className="text-sm">{friend.user?.name}</span>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setShowGroupModal(false)}
          className="px-4 py-1 text-sm border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={createGroup}
          className="px-4 py-1 text-sm bg-green-600 text-white rounded-lg"
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}
  </div>
);
}