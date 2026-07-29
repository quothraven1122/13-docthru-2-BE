import "#src/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import authRouter from "#src/modules/auth/authRoute.js";
import challengeRouter from "#src/modules/challenge/challengeRoute.js";
import translationRouter from "#src/modules/translation/translationRoute.js";
import reviewRouter from "#src/modules/review/reviewRoute.js";
import userRouter from "#src/modules/users/userRoute.js";
import errorHandler from "#src/common/middlewares/errorHandler.js";
import { swaggerSpec } from "#src/common/configs/swagger.js";
import { config } from "#src/common/configs/config.js";

const app = express();
const PORT = 3000;

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRouter);
app.use("/translation", translationRouter);
app.use("/review", reviewRouter);
app.use("/users", userRouter);

app.use("/challenges", challengeRouter);

app.get("/", (req, res) => {
  res.send("서버가 잘 동작하고 있어요! 🎉");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중이에요!`);
});
