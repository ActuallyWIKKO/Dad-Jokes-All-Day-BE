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

app.get("/jokes", async (req: Request, res: Response) => {
  await db.read();
  // console.log(db.data);
  res.json(db.data?.items ?? []);
});

app.get("/jokes/random", async (req: Request, res: Response) => {
  await db.read();
  const joke =
    db.data?.items[Math.floor(Math.random() * db.data?.items.length)];
  if (joke) {
    res.json(joke);
  }
});

app.get("/joke/:id", async (req: Request, res: Response) => {
  await db.read();
  // console.log(db.data);
  const id = parseInt(req.params.id);
  const joke = db.data?.items.find((item) => item.id === id);
  if (joke) {
    res.json(joke);
  }
});

// Show route
app.get("/manage/jokes", (req: Request, res: Response) => {
 res.send({ status: "/manage/jokes/manage route is reachable" });
});
// add route
app.get("/manage/jokes/add", (req: Request, res: Response) => {
  res.send({ status: "/manage/jokes/add route is reachable" });
});
// edit route
app.get("/manage/jokes/edit", (req: Request, res: Response) => {
  res.send({ status: "Route /manage/jokes/edit is reachable" });
});
// delete route
app.get("/manage/jokes/delete", (req: Request, res: Response) => {
  res.send({ status: "/manage/jokes/delete route is reachable" });
});


app.listen(port, () => {
  console.log(`Backend is listening to http://localhost:${port}`);
});
