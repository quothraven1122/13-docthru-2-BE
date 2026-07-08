import express from "express";

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("서버가 잘 동작하고 있어요! 🎉");
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중이에요!`);
});
