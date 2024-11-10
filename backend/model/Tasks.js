const mongoose = require('mongoose');     
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: { 
        type: String, 
    },
    description: { 
        type: String,
    },
    status: { 
        type: String, 
        enum: ['To Do', 'In Progress', 'Done', 'Expired Task'], 
        default: 'To Do' 
    },
    priority: {
        type: String, 
    },
    deadline: { 
        type: String,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, 
});

// Method to check if the task is expired and update its status
taskSchema.methods.checkExpiration = function () {
    const currentTime = Date.now();

    // Convert the deadline string (DD/MM/YYYY) to a Date object
    const [day, month, year] = this.deadline.split('/'); // Split the string by "/"
    const deadlineDate = new Date(`${year}-${month}-${day}T00:00:00Z`); 

    // Compare the deadline with the current time
    if (deadlineDate.getTime() < currentTime && this.status !== 'Expired Task') {
        this.status = 'Expired Task';
        this.save();
    }
};

module.exports = mongoose.model("Task", taskSchema);
