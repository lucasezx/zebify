import {
  requestFriend,
  acceptFriend,
  listFriends,
  listFriendRequests,
  listUsers,
  listUsersWithStatus,
  rejectFriend,
  removeFriend,
  cancelRequest,
} from "../controllers/friendshipController.js";

export default function registerFriendRoutes(app, authenticateToken, io) {
  app.post("/api/friends/request", authenticateToken, requestFriend);
  app.post("/api/friends/accept", authenticateToken, acceptFriend(io));
  app.get("/api/friends", authenticateToken, listFriends);
  app.get("/api/friends/requests", authenticateToken, listFriendRequests);
  app.get("/api/users", authenticateToken, listUsers);
  app.get("/api/users/with-status", authenticateToken, listUsersWithStatus);
  app.post("/api/friends/reject", authenticateToken, rejectFriend);
  app.delete("/api/friends/:id", authenticateToken, removeFriend(io));
  app.delete("/api/friends/request/:id", authenticateToken, cancelRequest);
}
