require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const authMiddleware = require("./middleware/authMiddleware");
const prisma = require("./prisma");

const app = express();

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-manager-fullstack-node-jj25x4pmd-vishals-projects-2ba31bcb.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

app.get("/users", authMiddleware, async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "User creation failed" });
  }
});

const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(400).json({ error: "Invalid password" });
  }

  // ✅ Access Token (short life)
  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // ✅ Refresh Token (long life)
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "1d" },
  );

  // ✅ Store refresh token in cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ accessToken });
});

app.post("/refresh-token", (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
});

app.post("/tasks", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        userId: req.userId,
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Task creation failed" });
  }
});

app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Fetching tasks failed" });
  }
});

app.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const task = await prisma.task.updateMany({
      where: {
        id,
        userId: req.userId,
      },
      data: {
        title,
        completed,
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Task update failed" });
  }
});

app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.deleteMany({
      where: {
        id,
        userId: req.userId,
      },
    });

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: "Task delete failed" });
  }
});
