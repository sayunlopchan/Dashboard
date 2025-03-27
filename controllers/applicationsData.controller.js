const asyncHandler = require("express-async-handler");
const ApplicationsData = require("../models/ApplicationsData.model.js");

const getApplicationsData = asyncHandler(async (req, res) => {
  const data = await ApplicationsData.find({});

  // Emit the fetched data via Socket.IO
  const io = req.app.get("io");
  if (io) {
    io.emit("applicationsDataFetched", data);
  }

  res.status(200).json(data);
});

module.exports = {
  getApplicationsData,
};
