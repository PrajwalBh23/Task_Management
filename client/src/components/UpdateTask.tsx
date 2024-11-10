import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, Button, Typography, Divider, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from 'react-router-dom';
import { parse, isValid, format } from 'date-fns';
import {API} from "../AuthContext";

// Type for the task object
interface Task {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    status: string;
    priority: string;
}

// Props for the AddTask component
interface UpdateTaskProps {
    taskData: any;
    open: boolean;
    handleClose: () => void;
}

const UpdateTask: React.FC<UpdateTaskProps> = ({ taskData, open, handleClose }) => {
    const [task, setTask] = useState<Task>(taskData);
    const location = useLocation();
    const { state } = location;
    const tokenFromUrl = state ? state.token : null;

    useEffect(() => {
        console.log('taskData from parent:', taskData);

        // Parse the deadline string into a Date object if it exists
        const parsedDeadline = parse(taskData.deadline, 'dd/MM/yyyy', new Date());
        if (isValid(parsedDeadline)) {
            setTask((prev) => ({ ...prev, deadline: format(parsedDeadline, 'dd-MM-yyyy') }));
        } else {
            setTask((prev) => ({ ...prev, deadline: '' }));
        }
    }, [taskData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setTask((prev) => ({ ...prev, [name]: value }));
    };

    const handleDeadlineChange = (date: Date | null) => {
        if (date) {
            const formattedDate = format(date, 'dd-MM-yyyy');
            setTask((prev) => ({ ...prev, deadline: formattedDate }));
        }
    };

    const handleSubmit = async () => {
        let formattedDeadline = '';
        if (task.deadline) {
            const parsedDate = parse(task.deadline, 'dd-MM-yyyy', new Date());
            if (isValid(parsedDate)) {
                formattedDeadline = format(parsedDate, 'dd-MM-yyyy');
            } else {
                console.error('Invalid date:', task.deadline);
                return;
            }
        }

        const updatedTaskData = {
                title: task.title,
                description: task.description,
                deadline: formattedDeadline,
                priority: task.priority,
        };

        const token = tokenFromUrl || localStorage.getItem('token');

        try {
            const response = await fetch(`${API}/route/updateTask`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({taskId: task._id, ...updatedTaskData  }),
            });

            if (response.ok) {
                alert('Task updated successfully!');
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
                    Update Task
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
                            InputProps={{ style: { border: 'none' } }}
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
                            InputProps={{ style: { border: 'none' } }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            <div>
                                <DatePicker
                                    selected={
                                        task.deadline
                                            ? isValid(parse(task.deadline, 'dd/MM/yyyy', new Date()))
                                                ? parse(task.deadline, 'dd/MM/yyyy', new Date())
                                                : null
                                            : null
                                    }
                                    onChange={(date: Date | null) => handleDeadlineChange(date)}
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
                            Update Task
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateTask;
