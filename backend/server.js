import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import multer from "multer";
import fs from "fs";

import { createTables } from "./sql.js";
import authenticateToken from "./middlewares/authMiddleware.js";

import registerAuthRoutes from "./routes/authRoutes.js";
import registerPostRoutes from "./routes/postRoutes.js";
import registerCommentRoutes from "./routes/commentRoutes.js";
import registerFriendRoutes from "./routes/friendRoutes.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

createTables();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Cliente conectado via WebSocket");

  socket.on("nova_postagem", () => {
    io.emit("atualizar_feed");
  });

  socket.on("novo_comentario", (postId) => {
    io.emit("atualizar_comentarios", postId);
  });

  socket.on("editar_comentario", (comentarioAtualizado) => {
    io.emit("comentario_editado", comentarioAtualizado);
  });

  socket.on("deletar_comentario", (comentarioId) => {
    io.emit("comentario_deletado", comentarioId);
  });

  socket.on("editar_postagem", (postagemAtualizada) => {
    io.emit("postagem_editada", postagemAtualizada);
  });

  socket.on("deletar_postagem", (postId) => {
    io.emit("postagem_deletada", postId);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

app.get("/", (req, res) => {
  res.send("API do Zebify está funcionando!");
});

registerAuthRoutes(app);
registerPostRoutes(app, authenticateToken, upload, io);
registerCommentRoutes(app, authenticateToken, io);
registerFriendRoutes(app, authenticateToken, io);

server.listen(port, () => {
  console.log(`Servidor HTTP e WebSocket rodando na porta ${port}`);
});
