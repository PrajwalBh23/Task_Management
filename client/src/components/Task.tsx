import React, { useState, useEffect, useRef } from 'react';
import './Styles/Task.css';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddTask from './Add_Task'; // Import the Add_Task component
import UpdateTask from './UpdateTask';
import { useLocation } from 'react-router-dom';
import {API} from "../AuthContext";

interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    deadline: string;
    priority: String,
    postedBy: string;
}

const GeneratedHTML: React.FC = () => {
    const location = useLocation(); // Use useLocation to access route state
    const { state } = location; // Destructure the state object
    const tokenFromUrl = state ? state.token : null; // Access token from route state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);


    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setOpenDropdownId(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    // const toggleDropdown = (taskId: string) => {
    //     setOpenDropdownId((prevId) => (prevId === taskId ? null : taskId));
    // };

    const handleOpenUpdateModal = () => {
        setIsUpdateModalOpen(true);
    };

    // Close modal
    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
    };

    const toggleDropdown = (taskId: string) => {
        setOpenDropdownId(prevId => prevId === taskId ? null : taskId);
    };
    
    const handleEdit = async (taskId: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API}/route/getTask?taskId=${taskId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
    
            if (response.ok) {
                const taskData = await response.json();
                setTaskToEdit(taskData);
                setIsUpdateModalOpen(true); // Open the modal to update task
            } else {
                console.error('Error fetching task:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching task:', error);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        console.log(`Changing status of task ${taskId} to ${newStatus}`);
        const token = tokenFromUrl || localStorage.getItem('token');
        try {
            const response = await fetch(`${API}/route/edit-status`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId, newStatus })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Task status updated successfully:', data);
                setOpenDropdownId(null);
                setTasks(data);  // Update tasks in frontend state
            } else {
                console.error('Error updating task status:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };


    const handleDelete = async (taskId: string) => {
        console.log('Delete task', taskId);
        const token = tokenFromUrl || localStorage.getItem('token');
        try {
            const response = await fetch(`${API}/route/delect`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Task status updated successfully:', data);
                setOpenDropdownId(null);
                setTasks(data);  // Update tasks in frontend state
            } else {
                console.error('Error updating task status:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    // Open modal
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const getAllTasks = async () => {
            const token = tokenFromUrl || localStorage.getItem('token');
            try {
                const response = await fetch(`${API}/route/tasks`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();  // Parse the JSON response
                    console.log('Tasks fetched successfully:', data);  // Log the actual response data
                    setTasks(data);
                } else {
                    console.error('Error fetching tasks:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        getAllTasks();
    }, []);

    const renderTask = (task: Task) => (
        <div className="box-single" key={task._id}>
            <span className="single-line" style={{ position: 'relative' }}>
                <p
                    style={{
                        border: 'none',
                        background: 'rgb(233 211 188)',
                        padding: '2px 5px',
                        fontSize: 'small',
                        borderRadius: '8px',
                    }}
                >
                    {task.priority}
                </p>
                <MoreHorizIcon onClick={() => toggleDropdown(task._id)} />
            </span>
            {openDropdownId === task._id && (
                <div className="dropdown-menu" ref={dropdownRef}>
                    <button onClick={() => handleEdit(task._id)}>Edit</button>
                    <button
                        className="status-button"
                        onMouseEnter={() => setIsStatusDropdownOpen(true)}
                        onMouseLeave={() => setIsStatusDropdownOpen(false)}
                    >
                        Status
                    </button>

                    {/* Show status-dropdown based on state */}
                    {isStatusDropdownOpen && (
                        <div
                            className="status-dropdown"
                            onMouseEnter={() => setIsStatusDropdownOpen(true)}
                            onMouseLeave={() => setIsStatusDropdownOpen(false)}
                        >
                            <button onClick={() => handleStatusChange(task._id, 'In Progress')}>In Progress</button>
                            <button onClick={() => handleStatusChange(task._id, 'Done')}>Done</button>
                            <button onClick={() => handleStatusChange(task._id, 'To Do')}>To Do</button>
                        </div>
                    )}
                    <button onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
            )}

            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
                <span style={{ fontWeight: 'bold', fontSize: 'medium', padding: '7px 0' }}>
                    DeadLine:
                </span>{' '}
                {task.deadline}
            </p>
            {isUpdateModalOpen && (
                <UpdateTask taskData={taskToEdit} open={isUpdateModalOpen} handleClose={handleCloseUpdateModal} />
            )}

        </div>
    );

    const expiredTasksCount = tasks.filter((task) => task.status === 'Expired Task').length;
    const completedTasksCount = tasks.filter((task) => task.status === 'Done').length;
    const activeTasksCount = tasks.length - expiredTasksCount;  // All tasks minus expired tasks

    return (
        <>
            <div className="header">
                <div className="search-box">
                    <div className="search-content">
                        <div className="search-icon">
                            <SearchIcon className="search-img" />
                        </div>
                        <input
                            type="text"
                            id="Search_Project"
                            className="search-input"
                            placeholder="Search Project"
                        />
                    </div>
                </div>

                <div className="filter-container">
                    <FilterAltIcon />
                    <span id="Filter" className="filter-text">
                        Filter
                    </span>
                    <ExpandMoreIcon />
                </div>
            </div>

            <div className="container">
                <div className="result">
                    <div className="result-container">
                        <div className="result_box">
                            <RunningWithErrorsIcon style={{ height: '26px', color: 'white', borderRadius: '50%', padding: '10px', background: 'red' }} />
                            <p>Expired Task</p>
                            <p className='count'>{expiredTasksCount}</p>
                        </div>
                        <div className="result_box">
                            <BusinessCenterIcon style={{ height: '26px', color: 'white', borderRadius: '50%', padding: '10px', background: 'rgba(223, 119, 79, 1)' }} />
                            <p>All Active Task</p>
                            <p className='count'>{activeTasksCount}</p>
                        </div>
                        <div className="result_box">
                            <AlarmOnIcon style={{ height: '25px', color: 'white', borderRadius: '50%', padding: '10px', background: 'rgba(111, 160, 229, 1)' }} />
                            <p>Completed Task</p>
                            <p className='count'>{completedTasksCount}<span style={{ fontSize: '1.2rem' }}>/10</span></p>
                        </div>
                    </div>
                    <button className='result-button' onClick={handleOpenModal}><AddIcon style={{ color: 'white' }} />Add Task</button>
                    {isModalOpen && (
                        <AddTask open={isModalOpen} handleClose={handleCloseModal} />
                    )}
                </div>
                <div className="main">
                    <div className="main-box">
                        <div id="to-do" className="main-task">
                            <h2>
                                <CircleIcon style={{ color: 'rgb(80 48 229)', fontSize: 'x-small' }} /> To do{' '}
                                <span>{tasks.filter((task) => task.status === 'To Do').length}</span>
                            </h2>
                            <hr
                                style={{
                                    height: '3px',
                                    margin: 'auto',
                                    width: '90%',
                                    border: 'none',
                                    background: 'rgb(80 48 229)',
                                }}
                            />
                            {tasks.filter((task) => task.status === 'To Do').map(renderTask)}
                        </div>
                    </div>
                    <div className="main-box">
                        <div id="progress" className="main-task">
                            <h2>
                                <CircleIcon style={{ color: 'rgb(253 174 29)', fontSize: 'x-small' }} /> Progress{' '}
                                <span>{tasks.filter((task) => task.status === 'In Progress').length}</span>
                            </h2>
                            <hr
                                style={{
                                    height: '3px',
                                    margin: 'auto',
                                    width: '90%',
                                    border: 'none',
                                    background: 'rgb(253 174 29)',
                                }}
                            />
                            {tasks.filter((task) => task.status === 'In Progress').map(renderTask)}
                        </div>
                    </div>
                    <div className="main-box">
                        <div id="completed" className="main-task">
                            <h2>
                                <CircleIcon style={{ color: 'rgb(139 196 138)', fontSize: 'x-small' }} /> Done{' '}
                                <span>{tasks.filter((task) => task.status === 'Done').length}</span>
                            </h2>
                            <hr
                                style={{
                                    height: '3px',
                                    margin: 'auto',
                                    width: '90%',
                                    border: 'none',
                                    background: 'rgb(139 196 138)',
                                }}
                            />
                            {tasks.filter((task) => task.status === 'Done').map(renderTask)}
                        </div>
                    </div>
                    <div className="main-box">
                        <div id="expired" className="main-task">
                            <h2>
                                <CircleIcon style={{ color: 'rgb(223 119 79)', fontSize: 'x-small' }} /> Timeout{' '}
                                <span>{tasks.filter((task) => task.status === 'Done').length}</span>
                            </h2>
                            <hr
                                style={{
                                    height: '3px',
                                    margin: 'auto',
                                    width: '90%',
                                    border: 'none',
                                    background: 'rgb(223 119 79)',
                                }}
                            />
                            {tasks.filter((task) => task.status === 'Expired Task').map(renderTask)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeneratedHTML;
