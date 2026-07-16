import "#src/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "#src/modules/auth/authRoute.js";
import errorHandler from "#src/common/middlewares/errorHandler.js";

const app = express();
const PORT = 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("서버가 잘 동작하고 있어요! 🎉");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중이에요!`);
});
