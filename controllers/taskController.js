const { ObjectId } = require("mongodb");
const { getDB } = require("../config/mongo");

// ================= FORMATTER =================
const formatTask = (t) => ({
  id: t._id.toString(),
  title: t.title,
  description: t.description,
  status: t.status,
  createdBy: t.createdBy,
  author: t.author || "Unknown",
  createdAt: t.createdAt,
});

// ================= CREATE TASK =================
exports.createTask = async (req, res) => {
  try {
    const db = getDB();

    const { title, description, status } = req.body;

    const newTask = {
      title,
      description,
      status: status || "pending",
      createdBy: req.user.id,
      author: req.user.username,        
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("tasks").insertOne(newTask);

    res.json({ _id: result.insertedId, ...newTask });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL TASKS =================
exports.getTasks = async (req, res) => {
  try {
    const db = getDB();

    let filter = {};

    if (req.user.role !== "admin") {
      filter = { createdBy: req.user.id };
    }

    const tasks = await db.collection("tasks").find(filter).toArray();

    res.json(tasks.map(formatTask));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET TASK BY ID =================
exports.getTaskById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(formatTask(task));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const update = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
    };

    await db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    const updated = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(id) });

    res.json(formatTask(updated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE TASK =================
exports.deleteTask = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await db.collection("tasks").deleteOne({
      _id: new ObjectId(id),
    });

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
