const mongodb = require("mongodb");
const EventEmitter = require("events");
const UploadQueue = require("../models/upload-queue");

class Database extends EventEmitter {
  constructor() {
    super();
    this.connection = new mongodb.MongoClient("mongodb://localhost");

    this.connection.connect((e) => {
      if (e) {
        console.log(e);
        return;
      }
      this.db = this.connection.db("data");
      this.emit("connected");
    });
  }

  async getSchedules() {
    return await this.db.collection("schedules").find({}).toArray();
  }

  async deleteSchedule(id) {
    const _id = new mongodb.ObjectID(id);

    return await this.db.collection("schedules").deleteOne({ _id });
  }

  async putSchedule(schedule) {
    const db = this.db.collection("schedules");

    if (schedule._id) {
      const _id = new mongodb.ObjectID(schedule._id);
      delete schedule._id;
      await db.updateOne({ _id }, { $set: schedule }, { upsert: true });
    } else await db.insertOne(schedule);
  }

  async addUploadQueue(filename, filePath, videoStart, motionStartSeconds) {
    const model = await UploadQueue.validate({
      filename,
      filePath,
      videoStart,
      motionStartSeconds,
      completed: false,
    });

    return await this.db.collection("queue").insert(model);
  }

  async getUploadQueue() {
    return await this.db
      .collection("queue")
      .find({ completed: false })
      .toArray();
  }

  async completeQueueItem(id) {
    const _id = new mongodb.ObjectID(id);

    return await this.db
      .collection("queue")
      .updateOne({ _id }, { $set: { completed: true } });
  }
}

module.exports = new Database();
