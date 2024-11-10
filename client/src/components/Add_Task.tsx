import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, Button, Typography, Divider, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import {API} from "../AuthContext";

// Type for the task object
interface Task {
    title: string;
    description: string;
    deadline: Date | null;
    status: string;
    priority: string;
}

// Props for the AddTask component
interface AddTaskProps {
    open: boolean;
    handleClose: () => void;
}

const AddTask: React.FC<AddTaskProps> = ({ open, handleClose }) => {
    const [task, setTask] = useState<Task>({
        title: '',
        description: '',
        deadline: null,
        priority: 'Low',
        status:''
    });
    const location = useLocation(); // Use useLocation to access route state
    const { state } = location; // Destructure the state object
    const tokenFromUrl = state ? state.token : null; // Access token from route state


    // Handle input changes for text fields and select dropdown
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setTask((prev) => ({ ...prev, [name]: value }));
    };

    // Handle deadline change
    const handleDeadlineChange = (date: Date) => {
        setTask((prev) => ({ ...prev, deadline: date }));
    };

    // Handle form submission
    const handleSubmit = async () => {

        const formattedDate = task.deadline ? format(task.deadline, 'dd/MM/yyyy') : '';

        const taskData = {
            ...task,
            deadline: formattedDate,
        };
        const token = tokenFromUrl || localStorage.getItem('token');

        try {
            const response = await fetch(`${API}/route/tasks`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...taskData, // Send the task data
                }),
            });

            if (response.ok) {
                alert("Task Save Successfully")
                console.log('Task submitted:', task);
                handleClose(); 
                window.location.reload();
            } else {
                console.error('Error submitting task:', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting task:', error);
        }
    };


    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Typography variant="h4" sx={{ textAlign: 'center' }}>
                    Add Task
                </Typography>
            </DialogTitle>
            <Divider sx={{ marginBottom: 2 }} />
            <DialogContent>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        padding: '20px',
                    }}
                >
                    <div>
                        <TextField
                            label="Task Title"
                            name="title"
                            value={task.title}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            margin="dense"
                            InputProps={{ style: { border: 'none' } }} // Remove border
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={task.description}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            margin="dense"
                            multiline
                            rows={4}
                            InputProps={{ style: { border: 'none' } }} // Remove border
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            <div>
                                <DatePicker
                                    selected={task.deadline}
                                    onChange={handleDeadlineChange}
                                    placeholderText="Select a deadline"
                                    dateFormat="dd/MM/yyyy"
                                    customInput={
                                        <Button variant="outlined" sx={{ textTransform: 'none' }}>
                                            Deadline
                                        </Button>
                                    }
                                />
                            </div>
                            <div>
                                <FormControl fullWidth variant="outlined" margin="dense">
                                    <InputLabel htmlFor="priority-select">Priority</InputLabel>
                                    <Select
                                        id="priority-select"
                                        label="Select Priority"
                                        name="priority"
                                        value={task.priority}
                                        onChange={handleInputChange}
                                        inputProps={{
                                            style: {
                                                backgroundColor: 'white',
                                                color: 'black',
                                                height: '20px', // Adjust the height here
                                                padding: '0 14px', // Adjust padding to make it smaller
                                            },
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: '200px', // Optional: Adjust the dropdown height if needed
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="Low">Low</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="High">High</MenuItem>
                                    </Select>
                                </FormControl>

                            </div>
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleSubmit}
                            sx={{ marginTop: '20px' }}
                        >
                            Add Task
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddTask;
