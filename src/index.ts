import express, { Application } from "express";
import cors from "cors";
import { Request, Response } from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app: Application = express();
const port = 1199;

app.use(express.json({ limit: "20mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

type Joke = {
  items: {
    id: number;
    joke: string;
  }[];
};
const db = new Low<Joke>(new JSONFile("./src/db.json"), { items: [] });
await db.read();

app.get("/api/v1/jokes", (req: Request, res: Response) => {
  res.send({ status: "/api/v1/jokes route is reachable" });
});

// Serve a successful response. For use with wait-on
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.send({ status: "ok" });
});

app.get("/jokes/random", async (req: Request, res: Response) => {
  await db.read();
  const joke =
    db.data?.items[Math.floor(Math.random() * db.data?.items.length)];
  if (joke) {
    res.json(joke);
  }
});

// Show route
app.get("/jokes", async (req: Request, res: Response) => {
  await db.read();
  // console.log(db.data);
  res.json(db.data?.items ?? []);
});
// add route
app.get("/admin/jokes/add", (req: Request, res: Response) => {
  res.send({ status: "/manage/jokes/add route is reachable" });
});
// edit route
app.get("/joke/:id", async (req: Request, res: Response) => {
  await db.read();
  const id = parseInt(req.params.id, 10);

  const joke = db.data?.items.find((item) => item.id === id);

  if (joke) {
    res.json(joke);
  } else {
    res.status(404).json({ error: "Joke not found" });
  }
});
app.put("/joke/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { joke } = req.body;

  await db.read();
  const itemIndex = db.data?.items.findIndex((item) => item.id === id);

  if (itemIndex !== undefined && itemIndex !== -1 && db.data) {
    db.data.items[itemIndex].joke = joke;
    await db.write();
    res.status(200).json(db.data.items[itemIndex]);
  } else {
    res.status(404).json({ error: "Joke not found" });
  }
});
// delete route
app.delete("/joke/:id", async (req: Request, res: Response) => {
  await db.read();
  const id = parseInt(req.params.id);
  const index = db.data?.items.findIndex((item) => item.id === id);

  if (index !== undefined && index !== -1) {
    db.data?.items.splice(index, 1);
    await db.write();
    res.status(200).json({ message: "Joke deleted successfully." });
  } else {
    res.status(404).json({ error: "Joke not found. Nothing was deleted" });
  }
});


app.listen(port, () => {
  console.log(`Backend is listening to http://localhost:${port}`);
});
