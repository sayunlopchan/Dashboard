const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notifaction.controller');

router.route('/')
  .get(getNotifications)
  .put(markAllAsRead)
  .delete(deleteAllNotifications);

router.route('/:id')
  .put(markAsRead)
  .delete(deleteNotification);

module.exports = router;