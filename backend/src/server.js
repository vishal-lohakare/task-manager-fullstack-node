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
  "https://task-manager-fullstack-node.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // Allow fixed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ⭐ Allow ALL Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
    expiresIn: "20s",
  });

  // ✅ Refresh Token (long life)
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "2m" },
  );

  // 🔥 STORE IN DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  // ✅ Store refresh token in cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ accessToken });
});

app.post("/refresh-token", async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: "No token" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }

  // 🔥 NEW: CHECK DB
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || user.refreshToken !== token) {
    return res.status(403).json({ message: "Token mismatch" });
  }

  // Issue new access token
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "20s",
  });

  res.json({ accessToken });
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

app.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { refreshToken: null },
    });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ message: "Logged out" });
});
