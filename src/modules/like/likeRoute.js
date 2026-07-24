import express from "express";
import { likeController } from "./likeController.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";

const likeRouter = express.Router();

likeRouter.get("/count", likeController.getLikeCount);

likeRouter.post("/", authenticate, likeController.toggleLike);

export default likeRouter;
