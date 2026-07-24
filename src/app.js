import "#src/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import authRouter from "#src/modules/auth/authRoute.js";
<<<<<<< HEAD
import likeRouter from "#src/modules/like/likeRoute.js";
=======
import translationRouter from "#src/modules/translation/translationRoute.js";
import reviewRouter from "#src/modules/review/reviewRoute.js";
>>>>>>> bcf791ddabed21c9a84a8ad438b463f3a1df9598
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
<<<<<<< HEAD
app.use("/like", likeRouter);
=======
app.use("/translation", translationRouter);
app.use("/review", reviewRouter);
>>>>>>> bcf791ddabed21c9a84a8ad438b463f3a1df9598

app.get("/", (req, res) => {
  res.send("서버가 잘 동작하고 있어요! 🎉");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중이에요!`);
});
