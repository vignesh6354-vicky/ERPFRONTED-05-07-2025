import React, { useState } from 'react';
import {
    AppBar, Tabs, Tab, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Typography,
    styled, useTheme, useMediaQuery, IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Task from '../Project/Task.jsx'

// Styled components
const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: theme.spacing(2),
}));

const ModalPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3), width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto',
}));

const FormField = styled(Box)(({ theme }) => ({ margin: theme.spacing(2, 0) }));
const ChipsContainer = styled(Box)(({ theme }) => ({
    display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
    '& > *': { margin: theme.spacing(0.5) },
}));

const ResponsiveTableCell = styled(TableCell)(({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
        padding: '8px 4px', fontSize: '0.75rem',
        '&.MuiTableCell-head': { fontWeight: 'bold', backgroundColor: theme.palette.grey[200] },
    },
}));

function TabPanel({ children, value, index, ...other }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <div hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: isMobile ? 1 : 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index) {
    return { id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}` };
}

const initialTasks = [
    {
        id: 1, name: 'Design Homepage', active: true, deadline: '2023-06-30', createdBy: 'John Doe',
        assign: 'Jane Smith', projectName: 'Website Redesign', tag: ['UI', 'Design']
    },
    {
        id: 2, name: 'Implement API', active: true, deadline: '2023-07-15', createdBy: 'Mike Johnson',
        assign: 'Alex Brown', projectName: 'Backend Services', tag: ['Backend', 'API']
    },
];

const projects = ['Website Redesign', 'Backend Services', 'Mobile App'];
const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Alex Brown'];
const tags = ['UI', 'Design', 'Backend', 'API', 'Frontend', 'Database'];

export default function TaskManagement() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [value, setValue] = useState(0);
    const [open, setOpen] = useState(false);
    const [tasks, setTasks] = useState(initialTasks);
    const [newTask, setNewTask] = useState({
        name: '', active: true, deadline: '', createdBy: '', assign: '', projectName: '', tag: []
    });

    const handleChange = (_, newValue) => setValue(newValue);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleInputChange = (e) => setNewTask({ ...newTask, [e.target.name]: e.target.value });
    const handleEdit = (task) => console.log("Edit task:", task);
    const handleDelete = (task) => setTasks(prev => prev.filter(t => t.id !== task.id));

    const handleTagChange = (event) => {
        const { value } = event.target;
        setNewTask({ ...newTask, tag: typeof value === 'string' ? value.split(',') : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTasks([...tasks, { ...newTask, id: tasks.length + 1, active: newTask.active === 'true' }]);
        setNewTask({ name: '', active: true, deadline: '', createdBy: '', assign: '', projectName: '', tag: [] });
        handleClose();
    };

    const tabStyles = {
        display: 'flex', justifyContent: 'center', marginBottom: '20px', bgcolor: '#F0F4F8',
        padding: '8px 12px', '& .MuiTab-root': {
            textTransform: 'none', fontWeight: 'bold', fontSize: '16px', color: '#142a4f',
            padding: '6px 18px', backgroundColor: '#ffffff', transition: 'all 0.3s ease-in-out',
            '&:hover': { backgroundColor: '#e6ecf3' },
            '&.Mui-selected': { backgroundColor: '#142a4f', color: '#ffffff', boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
        },
    };

    return (
        <>
            <Tabs value={value} onChange={handleChange} variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }} sx={tabStyles}>
                <Tab label="TASK" {...a11yProps(0)} />
                {/* <Tab label="PROJECT" {...a11yProps(1)} />
                <Tab label="FLOW" {...a11yProps(2)} /> */}
            </Tabs>

            <Paper sx={{ p: 2 }}>
                <TabPanel value={value} index={0}>
                    <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', mb: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleOpen} size={isMobile ? 'small' : 'medium'}
                            sx={{ width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? '200px' : 'none' }}>
                            Create Task
                        </Button>
                    </Box>

                    <TableContainer
                        component={Paper}
                        sx={{
                            maxWidth: '100%',
                            overflowX: 'auto',
                            border: '1px solid rgba(224, 224, 224, 1)'
                        }}
                    >
                        <Table
                            size={isMobile ? 'small' : 'medium'}
                            sx={{
                                minWidth: isMobile ? '100%' : 650,
                                borderCollapse: 'collapse',
                                '& td, & th': {
                                    border: '1px solid rgba(224, 224, 224, 1)',
                                },
                                '& thead th': {
                                    backgroundColor: theme.palette.grey[200],
                                },
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    {['S.NO', 'NAME', 'ACTIVE', 'DEADLINE', 'CREATED BY', 'ASSIGN', 'PROJECT', 'TAG', 'ACTION'].map((header) => (
                                        <ResponsiveTableCell key={header} align="center">
                                            <strong>{header}</strong>
                                        </ResponsiveTableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks.map((task, index) => (
                                    <TableRow key={task.id} hover>
                                        <ResponsiveTableCell align="center">{index + 1}</ResponsiveTableCell>
                                        <ResponsiveTableCell align="center">{task.name}</ResponsiveTableCell>
                                        <ResponsiveTableCell align="center">{task.active ? 'Yes' : 'No'}</ResponsiveTableCell>
                                        <ResponsiveTableCell align="center">{task.deadline}</ResponsiveTableCell>
                                        <ResponsiveTableCell align="center">{task.createdBy}</ResponsiveTableCell>
                                        <ResponsiveTableCell align="center">{task.assign}</ResponsiveTableCell>
                                        <ResponsiveTableCell align="center">{task.projectName}</ResponsiveTableCell>
                                        <ResponsiveTableCell align="center">
                                            <ChipsContainer>
                                                {Array.isArray(task.tag) ? task.tag.map((t) => (
                                                    <Chip key={t} label={t} size="small" sx={{ fontSize: isMobile ? '0.6rem' : '0.8125rem' }} />
                                                )) : <Chip label={task.tag} size="small" sx={{ fontSize: isMobile ? '0.6rem' : '0.8125rem' }} />}
                                            </ChipsContainer>
                                        </ResponsiveTableCell>
                                        <ResponsiveTableCell align="center">
                                            <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                                                <IconButton color="primary" size="small" onClick={() => handleEdit(task)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton color="error" size="small" onClick={() => handleDelete(task)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </ResponsiveTableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </TabPanel>

                {/* <TabPanel value={value} index={1}><Task /></TabPanel>
                <TabPanel value={value} index={2}><Typography>Flow Content</Typography></TabPanel> */}

                <StyledModal open={open} onClose={handleClose}>
                    <ModalPaper>
                        <Typography variant="h6" gutterBottom>Create New Task</Typography>
                        <form onSubmit={handleSubmit}>
                            {[
                                { field: 'name', label: 'Task Name', type: 'text', required: true },
                                { field: 'active', label: 'Active', type: 'select', options: [true, false], required: true },
                                { field: 'deadline', label: 'Deadline', type: 'date', required: true },
                                { field: 'createdBy', label: 'Created By', type: 'select', options: users, required: true },
                                { field: 'assign', label: 'Assign To', type: 'select', options: users, required: true },
                                { field: 'projectName', label: 'Project Name', type: 'select', options: projects, required: true },
                                { field: 'tag', label: 'Tags', type: 'multiselect', options: tags, required: false }
                            ].map(({ field, label, type, options, required }) => (
                                <FormField key={field}>
                                    {type === 'select' ? (
                                        <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                            <InputLabel>{label}</InputLabel>
                                            <Select name={field} value={newTask[field]} onChange={handleInputChange} label={label} required={required}>
                                                {options.map(option => <MenuItem key={option} value={option}>{option.toString()}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    ) : type === 'multiselect' ? (
                                        <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                            <InputLabel>{label}</InputLabel>
                                            <Select multiple name={field} value={newTask[field]} onChange={handleTagChange}
                                                renderValue={(selected) => (
                                                    <ChipsContainer>{selected.map(value => <Chip key={value} label={value} size={isMobile ? 'small' : 'medium'} />)}</ChipsContainer>
                                                )} label={label}>
                                                {options.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <TextField fullWidth label={label} name={field} value={newTask[field]}
                                            onChange={handleInputChange} type={type} required={required}
                                            size={isMobile ? 'small' : 'medium'} InputLabelProps={type === 'date' ? { shrink: true } : undefined} />
                                    )}
                                </FormField>
                            ))}

                            <Box display="flex" justifyContent="flex-end" mt={3} gap={1}>
                                <Button variant="outlined" onClick={handleClose} size={isMobile ? 'small' : 'medium'}>Cancel</Button>
                                <Button type="submit" variant="contained" color="primary" size={isMobile ? 'small' : 'medium'}>Create Task</Button>
                            </Box>
                        </form>
                    </ModalPaper>
                </StyledModal>
            </Paper>
        </>
    );
}