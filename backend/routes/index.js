import registerAuthRoutes from './authRoutes.js';
import registerPostRoutes from './postRoutes.js';
import registerCommentRoutes from './commentRoutes.js';
import registerFriendRoutes from './friendRoutes.js';
import registerUserRoutes from './userRoutes.js'

export default function registerRoutes(app, authenticateToken, upload, io) {
  registerAuthRoutes(app);
  registerPostRoutes(app, authenticateToken, upload, io);
  registerCommentRoutes(app, authenticateToken, io);
  registerFriendRoutes(app, authenticateToken, io);
  registerUserRoutes(app, authenticateToken);
}
