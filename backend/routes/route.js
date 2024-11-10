const express = require('express');
const router = express.Router();
const { createTask, getTasksForUser, editTaskStatus, deleteTask, getTask, updateTask } = require('../controllers/controller');
const { isAuthenticated } = require('../controllers/auth.js');

router.post('/tasks', isAuthenticated, createTask);
router.get('/tasks', isAuthenticated, getTasksForUser);
router.patch('/edit-status', isAuthenticated, editTaskStatus);
router.delete('/delect', isAuthenticated, deleteTask);
router.get('/getTask', isAuthenticated, getTask);
router.put('/updateTask', isAuthenticated, updateTask)

module.exports = router;
