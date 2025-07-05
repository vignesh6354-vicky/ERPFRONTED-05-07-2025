import React, { useState, useEffect } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, Grid, TextField,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, IconButton, InputAdornment, Autocomplete, CircularProgress, Chip,
    DialogActions, DialogContentText
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Nodatapage from "../Nodatapage";
import dayjs from 'dayjs';
import axios from '../Axiosinstance';

const ShortLeaveManager = ({ data = [], refreshData = () => { } }) => {
    const currentUserId = Number(sessionStorage.getItem('userId'));
    const currentUserName = sessionStorage.getItem('username') || '';
    const today = dayjs().format('YYYY-MM-DD');

    const [departments, setDepartments] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [filteredApprovers, setFilteredApprovers] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [requestsData, setRequestsData] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editId, setEditId] = useState(null);
    const [duration, setDuration] = useState('');
    const [timeLabel, setTimeLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const defaultForm = {
        name: currentUserName,
        department: '',
        date: '',
        fromTime: '',
        toTime: '',
        reason: '',
        approverName: '',
    };
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        (async () => {
            try {
                const staffRes = await axios.get('/staff/allstaffs');
                const deptRes = await axios.get('/departments/all-departments');
                setAllStaff(staffRes.data || []);
                setDepartments(deptRes.data || []);
            } catch (e) {
                console.error(e);
                toast.error('Failed to fetch departments or staff.');
            }
        })();
    }, []);

    useEffect(() => {
        if (formData.department) {
            setFilteredApprovers(
                allStaff
                    .filter(s => s.departmentName === formData.department && s.id !== currentUserId)
                    .map(s => ({ label: s.name, id: s.id }))
            );
        } else setFilteredApprovers([]);
    }, [formData.department, allStaff]);

    useEffect(() => {
        if (formData.fromTime && formData.toTime) {
            const from = dayjs(`2023-01-01T${formData.fromTime}`);
            const to = dayjs(`2023-01-01T${formData.toTime}`);
            const diff = to.diff(from, 'minute');

            if (diff > 0) {
                const hours = Math.floor(diff / 60);
                const minutes = diff % 60;
                setDuration(`${hours}h ${minutes}m`);

                const hour = from.hour();
                if (hour >= 6 && hour < 12) setTimeLabel('Morning');
                else if (hour >= 12 && hour < 17) setTimeLabel('Afternoon');
                else if (hour >= 17 && hour < 20) setTimeLabel('Evening');
                else setTimeLabel('Night');
            } else {
                setDuration('Invalid');
                setTimeLabel('');
            }
        } else {
            setDuration('');
            setTimeLabel('');
        }
    }, [formData.fromTime, formData.toTime]);



    const filteredRows = data.filter(r => {
        const name = r.name || '';

        const search = searchText.toLowerCase();

        return (
            name.toLowerCase().includes(search)
        );
    });

    const openForm = (idx, id) => {
        if (id === undefined || id === null) {
            // NEW FORM - reset everything
            setEditIndex(null);
            setEditId(null);
            setFormData({
                ...defaultForm,
                date: ''
            });
        } else {

            setEditIndex(idx);
            setEditId(id);
            const requestToEdit = data.find(r => r.id === id);

            if (requestToEdit) {
                const daySelection = requestToEdit.daySelection?.[0] || {};
                const departmentObj = departments.find(d => d.id === requestToEdit.departmentId);
                const approverObj = allStaff.find(s => s.id === requestToEdit.notoficationReceiverId);

                setFormData({
                    name: requestToEdit.leaveAppliedStaffName || currentUserName,
                    department: departmentObj?.name || '',
                    date: daySelection.date || today,
                    fromTime: daySelection.startTime || '',
                    toTime: daySelection.endTime || '',
                    reason: requestToEdit.relatedReason || '',
                    approverName: approverObj?.name || '',
                });
            }
        }
        setDialogOpen(true);
    };

    const closeForm = () => setDialogOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const approver = filteredApprovers.find(a => a.label === formData.approverName);
            if (!approver) {
                toast.error('Please select an approver.');
                return;
            }

            const missingFields = [];
            if (!formData.department) missingFields.push('Department');
            if (!formData.date) missingFields.push('Date');
            if (!formData.fromTime) missingFields.push('From Time');
            if (!formData.toTime) missingFields.push('To Time');
            if (!formData.reason) missingFields.push('Reason');
            // if (formData.reason.length < 5 || formData.reason.length > 255) {
            //     toast.error('Reason must be between 5 and 250 characters');
            //     return;
            // }
            if (missingFields.length > 0) {
                toast.error(`Please fill in the following fields: ${missingFields.join(', ')}`);
                return;
            }

            // Validate time range
            const from = dayjs(`2023-01-01T${formData.fromTime}`);
            const to = dayjs(`2023-01-01T${formData.toTime}`);
            if (to.isBefore(from)) {
                toast.error('End time must be after start time');
                return;
            }

            const payload = {
                subject: 'Permission',
                relatedReason: formData.reason,
                notificationReceivedTO: { id: approver.id },
                daySelections: [{
                    date: formData.date,
                    type: 'PERMISSION',
                    startTime: formData.fromTime,
                    endTime: formData.toTime
                }]
            };

            if (editId) {
                await axios.put(`/PermissionLeaveApply/${editId}`, payload);
                toast.success('Leave request updated successfully.');
            } else {
                await axios.post('/PermissionLeaveApply', payload);
                toast.success('Leave submitted successfully.');
            }

            refreshData();
            setDialogOpen(false);
        } catch (err) {
            console.error(err);
            const errorMsg = err?.response?.data?.details || 'Failed to submit leave.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (id) => {
        setDeleteId(id);
        setConfirmDialogOpen(true);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`/PermissionLeaveApply/${deleteId}`);
            toast.success('Leave request deleted successfully.');
            refreshData();
        } catch (error) {
            console.error('Failed to delete leave request:', error);
            toast.error('Failed to delete leave request');
        } finally {
            setLoading(false);
            setConfirmDialogOpen(false);
        }
    };

    const formatHoursAndMinutes = (value) => {
        if (!value || isNaN(value)) return '0h 0m';
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${hours}h.${minutes}m`;
    };


    return (
        <Box p={3} mx="auto">
            <ToastContainer position="bottom-right" autoClose={1000} />

            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                gap={2}
                mb={2}
            >
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openForm()}
                    sx={{ width: { xs: '100%', md: 'auto' } }}
                >
                    New
                </Button>

                <TextField
                    size="small"
                    placeholder="Search by name..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                />
            </Box>



            <TableContainer sx={{
                maxHeight: 500,
                overflowX: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
            }}>
                <Table stickyHeader size="small" sx={{
                    minWidth: 650,
                    '& .MuiTableCell-root': {
                        border: '1px solid rgba(224, 224, 224, 1)',
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Marquis',
                        textTransform: 'uppercase',
                        wordBreak: 'break-word',
                    },
                    '& .MuiTableCell-head': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                    },
                }}>
                    <TableHead>
                        <TableRow>
                            {['S.No', 'Name', 'Applied Date', 'Reason', 'Assign Name', 'Hours Counts', 'Status', 'Actions'].map(h => (
                                <TableCell key={h}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.length > 0 ? filteredRows.map((row, index) => (
                            <TableRow hover key={row.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.leaveAppliedStaffName}</TableCell>
                                <TableCell align='center'>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                        {row.daySelection?.map((item, index) => (
                                            <Chip
                                                key={index}
                                                label={item.date}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.8rem' }}
                                            />
                                        ))}
                                    </Box>
                                </TableCell>

                                <TableCell>{row.relatedReason || '-'}</TableCell>
                                <TableCell>{row.notificationReceivedToName || '-'}</TableCell>
                                <TableCell>{formatHoursAndMinutes(row.maximumNumberToAssign)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={(row.status || 'PENDING').toUpperCase()}
                                        size="small"
                                        sx={{
                                            backgroundColor:
                                                (row.status || 'PENDING').toUpperCase() === 'APPROVED'
                                                    ? '#4caf50'
                                                    : (row.status || 'PENDING').toUpperCase() === 'REJECTED'
                                                        ? '#f44336'
                                                        : '#9e9e9e',
                                            color: '#fff',
                                            textTransform: 'uppercase',
                                        }}
                                    />
                                </TableCell>
                                {/* <TableCell>
                                    <IconButton onClick={() => openForm(null, row.id)}>
                                        <Edit color="primary" />
                                    </IconButton>
                                    <IconButton onClick={() => openDeleteDialog(row.id)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </TableCell> */}

                                <TableCell align="center">
                                    
                                    <IconButton
                                        onClick={() => openForm(null, row.id)}
                                        disabled={["APPROVED", "REJECTED"].includes(row.status)}
                                    >
                                        <Edit color="primary" />
                                    </IconButton>

                                    <IconButton
                                        onClick={() => openDeleteDialog(row.id)}
                                        disabled={["APPROVED", "REJECTED"].includes(row.status)}
                                    >
                                        <Delete color="error" />
                                    </IconButton>
                                </TableCell>

                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center"><Nodatapage /></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>


            {/* Rest of the component remains the same */}
            <Dialog open={dialogOpen} onClose={closeForm} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {editIndex !== null ? 'New Short Leave' : 'Edit Short Leave'}
                </DialogTitle>
                <DialogContent dividers>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={departments}
                                    getOptionLabel={o => o.name}
                                    value={departments.find(d => d.name === formData.department) || null}
                                    onChange={(_, v) =>
                                        setFormData(f => ({
                                            ...f,
                                            department: v?.name || '',
                                            approverName: '', // reset approver when department changes
                                        }))
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label="Department" required fullWidth />
                                    )}
                                    disableClearable
                                />

                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Leave Date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: today }}
                                    required
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="From Time"
                                    type="time"
                                    value={formData.fromTime}
                                    onChange={(e) => setFormData(f => ({ ...f, fromTime: e.target.value }))}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="To Time"
                                    type="time"
                                    value={formData.toTime}
                                    onChange={(e) => setFormData(f => ({ ...f, toTime: e.target.value }))}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Duration"
                                    value={duration ? `${duration} (${timeLabel})` : ''}
                                    InputProps={{ readOnly: true }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Reason"
                                    multiline
                                    rows={3}
                                    value={formData.reason}
                                    onChange={(e) => setFormData(f => ({ ...f, reason: e.target.value }))}
                                    required
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={filteredApprovers}
                                    getOptionLabel={a => a.label}
                                    value={filteredApprovers.find(a => a.label === formData.approverName) || null}
                                    onChange={(_, v) =>
                                        setFormData(f => ({
                                            ...f,
                                            approverName: v?.label || ''
                                        }))
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label="Approver" required fullWidth />
                                    )}
                                    disableClearable
                                />

                            </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" mt={3}>
                            <Button onClick={closeForm} sx={{ mr: 2 }} variant="outlined" color="secondary">
                                Cancel
                            </Button>
                            <Button variant="contained" type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this leave request?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ShortLeaveManager;