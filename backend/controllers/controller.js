const Task = require('../model/Tasks'); // Import the Task model

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, deadline, priority, postedBy } = req.body;

        // Create and save the new task
        const newTask = new Task({
            title,
            description,
            deadline,
            priority,
            postedBy: req.user._id,
        });

        await newTask.save();
        res.status(201).json(newTask); // Return the created task
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task' });
    }
};

const getTasksForUser = async (req, res) => {
    try {
        const tasks = await Task.find({ postedBy: req.user._id }); // Find tasks for the specific user
        await Promise.all(tasks.map(task => task.checkExpiration()));
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
};

const editTaskStatus = async (req, res) => {
    const { taskId, newStatus } = req.body;
    const validStatuses = ['To Do', 'In Progress', 'Done', 'Expired Task'];

    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const task = await Task.findOne({ _id: taskId, postedBy: req.user._id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.status = newStatus;  // Update status
        await task.save();        // Save the updated task

        const tasks = await Task.find({ postedBy: req.user._id });
        res.status(200).json(tasks);  // Send all tasks back to the frontend
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Error updating task status' });
    }
};

const deleteTask = async (req, res) => {
    const { taskId } = req.body;

    try {
        // Find and delete the task only if it belongs to the authenticated user
        const deletedTask = await Task.findOneAndDelete({ _id: taskId, postedBy: req.user._id });

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found or unauthorized' });
        }

        // Fetch remaining tasks to send back as response
        const tasks = await Task.find({ postedBy: req.user._id });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task' });
    }
};

const getTask = async (req, res) => {
    const taskId = req.query.taskId;
    
    try {
        const task = await Task.findOne({ _id: taskId, postedBy: req.user._id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);  // Send all tasks back to the frontend

    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Error updating task status' });
    }
};

const updateTask = async (req, res) => {
    const { taskId } = req.body;
    
    const {
        title,
        description,
        deadline,
        priority,
      } = req.body;
    
    try {
      
        const task = await Task.findOneAndUpdate({ _id: taskId },
            {
                title,
                description,
                deadline,
                priority,
          },
          { new: true, runValidators: true } // Add runValidators if you have validation rules
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);  // Send all tasks back to the frontend

    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Error updating task status' });
    }
};


module.exports = { createTask, getTasksForUser, editTaskStatus, deleteTask, getTask, updateTask };
