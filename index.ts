import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma";

// 【追加】接続文字列が正しく読み込めているか確認するのじゃ
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ エラー: DATABASE_URL が見つからんぞ！ .env ファイルを確認して保存したか？");
  process.exit(1);
} else {
  // パスワードを隠して接続先を表示するぞ
  console.log("✅ 接続先を読み込んだぞ:", dbUrl.split("@")[1]);
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["query"] });

const app = express();
const PORT = process.env.PORT || 8888;

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.render("index", { users });
  } catch (error) {
    console.error("❌ 取得エラー:", error);
    res.status(500).send("データベースからデータを取ってこれんかったぞ。");
  }
});

app.post("/users", async (req, res) => {
  const name = req.body.name;
  if (name) {
    try {
      await prisma.user.create({ data: { name } });
    } catch (error) {
      console.error("❌ 追加エラー:", error);
    }
  }
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
