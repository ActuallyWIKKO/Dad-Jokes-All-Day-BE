import express, { Application, Request, Response  } from "express";
import cors from "cors";
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


// get jokes route
app.get("/jokes", async (req: Request, res: Response) => {
  await db.read();
  // console.log(db.data);
  res.json(db.data?.items ?? []);
});
// get joke id route
app.get("/joke/:id", async (req, res) => {
  await db.read();
  const id = parseInt(req.params.id, 10);
  const index = db.data?.items.findIndex((item) => item.id === id);

  if (index !== undefined && index !== -1) {
    res.json(db.data.items[index]);
  } else {
    res.status(404).json({ error: "Joke not found" });
  }
});
// Update joke id
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


// post route
app.post(
  "/jokes", 
  async (req: Request, res:Response): Promise<void> => {
    const { joke } = req.body;

    if (!joke || typeof joke !== "string") {
      res.status(400).json({ error: "Invalid joke data" });
      return;
    }

    await db.read();

    const newId = db.data?.items.length
      ? Math.max(...db.data.items.map((item) => item.id)) + 1
      : 1;

    const newJoke = { id: newId, joke };

    db.data?.items.push(newJoke);
    await db.write();

    res.status(201).json(newJoke);
    return;
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
