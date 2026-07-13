WebSockets, briefly
HTTP is request/response: the client asks, the server answers, the connection closes (or is reused, but each exchange is still client-initiated). There's no way for the server to say "hey, something happened" on its own.

A WebSocket starts as a normal HTTP request that asks to "upgrade" the connection. Once the server agrees, that same TCP connection stays open and becomes full-duplex — either side can push data to the other at any time, with very little per-message overhead. That's what makes it fit for chat/presence: the server can shove a new message at a client the instant it arrives, instead of the client having to keep asking "any updates?" (polling).

Socket.IO (used here) is a library on top of that — it adds automatic reconnection, fallback transports, and a simple emit/on event API instead of raw frames.

How it's wired up in this project

 Browser (client)                          Server (server/src)
 ─────────────────                         ──────────────────
 useAuthStore.js                           lib/socket.js
   connectSocket()                          - creates the http server + io instance
   io(BASE_URL, {                           - on "connection":
     query: { userId } })  ───handshake───▶     userSocketMap[userId] = socket.id
                                                 io.emit("getOnlineUsers", [...ids])
   socket.on("getOnlineUsers", ...)  ◀──────── (broadcast to everyone)
   → set({ onlineUsers })

 useMessageStore.js
   subscribeToMessages()
   socket.on("newMessage", ...)      ◀──────── io.to(receiverSocketId)
                                                   .emit("newMessage", msg)
                                                (from sendMessage controller)
Key detail: sending a message itself does NOT go over the socket. It's a plain HTTP call:


ChatContainer → useMessageStore.sendMessage()
  → axios POST /messages/send/:receiverId
      → message.controller.js: save Message doc
      → getReceiverSocketId(receiverId)  (lookup in userSocketMap)
      → if online: io.to(that socket id).emit("newMessage", message)
      ← HTTP 201 response with the saved message
  → sender appends the response to its own `messages` state directly
The socket is used one-way, for push: only to notify the receiver in real time. The sender already knows it sent the message (it gets that back in the HTTP response), so there's no need to round-trip it through the socket.

Scenario: two users, User A and User B
1. Both log in (socket opens)

A logs in → useAuthStore.connectSocket() runs → opens io(BASE_URL, { query: { userId: A._id } }).
Server's io.on("connection") fires, reads userId from the handshake query, stores userSocketMap[A._id] = socketA.id, and broadcasts getOnlineUsers with the current list of connected ids to everyone connected so far.
B logs in later on a different browser/tab → same thing happens → userSocketMap[B._id] = socketB.id → server broadcasts getOnlineUsers again, now [A._id, B._id].
Both A's and B's clients receive that event and update onlineUsers in useAuthStore — this is what makes the green "Online" dot next to a contact's avatar in ChatContainer.jsx update live.
2. A opens a chat with B and sends "hey"

A's ChatContainer calls sendMessage({ text: "hey" }).
That's a POST /messages/send/:B_id — a normal HTTP request, cookie-authenticated.
sendMessage in message.controller.js saves { senderId: A, receiverId: B, text: "hey" } to Mongo, then does getReceiverSocketId(B_id) → finds socketB.id in userSocketMap → io.to(socketB.id).emit("newMessage", savedMessage).
The HTTP response (the saved message) comes back to A, and A's store appends it to its own messages array immediately — A sees the bubble without waiting on any socket round trip.
On B's side, purely because the socket is open, socket.on("newMessage", ...) fires in useMessageStore.js the moment the server emits it. If B currently has that chat open (activeUser = A), the message is appended live and appears instantly with no refresh. If B is looking at someone else, the store just triggers a fetchChattedUsers() refresh so A shows up in B's sidebar.
3. B replies — same thing in reverse: HTTP POST /messages/send/:A_id → saved → io.to(socketA.id).emit("newMessage", ...) → A receives it live via its open socket, since A never closed its connection.

4. Someone logs out or closes the tab → the socket disconnects → server's socket.on("disconnect") deletes that entry from userSocketMap and re-broadcasts getOnlineUsers → the other party's "Online" indicator flips to "Offline" in real time too.

The one connection per browser session is what makes both directions possible — presence updates and message pushes — without either client ever having to poll.

