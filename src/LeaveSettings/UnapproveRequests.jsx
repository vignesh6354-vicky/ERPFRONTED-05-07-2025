import React, { useState, useEffect } from 'react';
import axios from "../Axiosinstance";
import { format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
    Box, Button, TextField, TableContainer, Table, TableHead, TableRow, TableCell, 
    TableBody, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, FormControl, InputLabel, Select, MenuItem, Chip, InputAdornment, Alert, Snackbar 
} from '@mui/material';
import { Add, Edit, Search } from '@mui/icons-material';
import { CheckCircle, Cancel, HourglassEmpty, Delete as DeleteIcon, Event as EventIcon, Close as CloseIcon } from '@mui/icons-material';
import Nodatapage from "../Nodatapage";

const statusStyles = {
  APPROVED: { label: 'Approved', icon: <CheckCircle fontSize="small" />, chipColor: 'success' },
  REJECTED: { label: 'Rejected', icon: <Cancel fontSize="small" />, chipColor: 'error' },
  PENDING: { label: 'Pending', icon: <HourglassEmpty fontSize="small" />, chipColor: 'warning' },
};

const leaveTypes = [
    { value: "annualLeave", label: "Annual Leave" },
    { value: "sickLeave", label: "Sick Leave" },
    { value: "maternityLeave", label: "Maternity Leave" },
    { value: "paternityLeave", label: "Paternity Leave" },
];

const StatusDropdown = ({ status = 'PENDING', onChange, row }) => {
  const selectedStyle = statusStyles[status] || statusStyles.PENDING;
  return (
    <Box>
      <Select
        value={status}
        onChange={(e) => onChange(e.target.value, row)}
        size="small"
        displayEmpty
        renderValue={() => (
          <Chip
            icon={selectedStyle.icon}
            label={selectedStyle.label}
            color={selectedStyle.chipColor}
            size="small"
            sx={{ borderRadius: '8px', fontWeight: 500 }}
          />
        )}
        sx={{
          minWidth: 150,
          height: 36,
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          px: 1,
          '& .MuiSelect-icon': { color: '#555' },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        }}
        MenuProps={{ PaperProps: { sx: { borderRadius: 1 } } }}
      >
        {['APPROVED', 'REJECTED'].map((val) => (
          <MenuItem key={val} value={val}>
            <Chip
              icon={statusStyles[val].icon}
              label={statusStyles[val].label}
              color={statusStyles[val].chipColor}
              size="small"
              sx={{ borderRadius: '8px', fontWeight: 500 }}
            />
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

const ApprovalProcessTab = ({ value, isStaff, data = [], loading = false, refreshData = () => {} }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        subject: '', related: '', department: '', role: '', notificationRecipient: ''
    });
    const [allStaff, setAllStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [openToast, setOpenToast] = useState(false);
    const [filteredData, setFilteredData] = useState(data);

    const fetchDropdownOptions = async () => {
        try {
            const [staffRes, deptRes, rolesRes] = await Promise.all([
                axios.get('/staff/allstaffs'),
                axios.get('/departments/all-departments'),
                axios.get('/roles/all')
            ]);
            setAllStaff(staffRes.data || []);
            setDepartments(deptRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            console.error('Failed to fetch dropdown options:', error);
            toast.error('Failed to fetch dropdown options');
        }
    };

    useEffect(() => { fetchDropdownOptions(); }, []);
    useEffect(() => { setFilteredData(data); }, [data]);
    useEffect(() => {
        setFilteredData(searchTerm.trim() === '' ? data : 
            data.filter(item => item.leaveAppliedStaffName?.toLowerCase().includes(searchTerm.toLowerCase())))
    }, [searchTerm, data]);

    const staffOptions = allStaff
        .filter(staff => (!formData.department || staff.departmentName === formData.department) &&
                        (!formData.role || staff.roleName === formData.role))
        .map(staff => ({ value: staff.id, label: staff.name }));

    const handleSave = async () => {
        const payload = {
            subject: formData.subject,
            relatedReason: formData.related,
            notificationReceivedTO: { id: formData.notificationRecipient },
            daySelections: selectedDates.map(d => ({
                date: format(new Date(d.date), 'yyyy-MM-dd'),
                type: d.type === 'FULL' ? 'Full' : 'Half',
                ...(d.type === 'HALF' && { startTime: d.fromTime, endTime: d.toTime }),
            })),
        };

        try {
            setSaving(true);
            await (editingId ? 
                axios.put(`/approval-process/${editingId}`, payload) :
                axios.post('/approval-process', payload));
            toast.success(`Approval process ${editingId ? 'updated' : 'created'} successfully!`);
            handleDialogClose();
            refreshData();
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Failed to save approval process');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (index, row) => {
        const staffMember = allStaff.find(s => s.id === (row.notoficationReceiverId || row.notificationReceiverId));
        setFormData({
            subject: row.subject || '',
            related: row.relatedReason || '',
            notificationRecipient: String(row.notoficationReceiverId || row.notificationReceiverId || ''),
            department: staffMember?.departmentName || '',
            role: staffMember?.roleName || ''
        });
        setSelectedDates(row.daySelection?.map(day => ({
            date: new Date(day.date),
            type: day.type === 'Full' ? 'FULL' : 'HALF',
            fromTime: day.startTime || '',
            toTime: day.endTime || ''
        })) || []);
        setEditingId(row.id);
        setDialogOpen(true);
    };

    const handleStatusChange = async (newStatus, row) => {
        try {
            await axios.post(`/approval-process/${row.id}/approve`, 
                { status: newStatus },
                { params: { approverId: row.leaveAppliedStaffId } }
            );
            refreshData();
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingId(null);
        setFormData({ subject: '', related: '', department: '', role: '', notificationRecipient: '' });
        setSelectedDates([]);
    };

    const handleDeleteDate = async (approvalProcessId, date) => {
        try {
            await axios.delete(`/approval-process/${approvalProcessId}/day-selection?date=${date}`);
            setSelectedDates(selectedDates.filter(d => !isSameDay(new Date(d.date), new Date(date))));
            refreshData();
            toast.success('Date deleted successfully!');
        } catch (error) {
            console.error('Error deleting date:', error);
            toast.error('Failed to delete date');
        }
    };

    const currentUserId = Number(JSON.parse(sessionStorage.getItem('userId')));
    const handleRecipientChange = (e) => {
        const selectedId = Number(e.target.value);
        if (selectedId === currentUserId) {
            setFormData(prev => ({ ...prev, notificationRecipient: '' }));
            setOpenToast(true);
        } else {
            setFormData(prev => ({ ...prev, notificationRecipient: selectedId }));
        }
    };

    return (
        <>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ height: '40px', width: { xs: '100%', sm: '250px', md: '300px', lg: '250px' } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                />
            </Box>

            <TableContainer sx={{ maxHeight: 500, overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <Table stickyHeader size="small" sx={{ minWidth: 650, '& .MuiTableCell-root': tableCellStyle }}>
                    <TableHead>
                        <TableRow>
                            {['S.NO', 'NAME', 'APPLIED DATE', 'RELATED', 'LEAVE COUNTS', 'STATUS', 'ACTIONS'].map((header) => (
                                <TableCell key={header}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.length > 0 ? filteredData.map((row, index) => {
                            const isEditDisabled = row.status === 'APPROVED' || row.status === 'REJECTED';
                            
                            return (
                                <TableRow hover key={row.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.leaveAppliedStaffName}</TableCell>
                                    <TableCell align='center'>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                            {row.daySelection?.map((item, i) => (
                                                <Chip key={i} label={item.date} variant="outlined" size="small" sx={{ fontSize: '0.8rem' }} />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{row.relatedReason}</TableCell>
                                    <TableCell>{row.maximumNumberToAssign}</TableCell>
                                    <TableCell><StatusDropdown status={row.status} onChange={handleStatusChange} row={row} /></TableCell>
                                    <TableCell>
                                        <Tooltip title={isEditDisabled ? "Cannot edit approved/rejected requests" : "Edit"} arrow>
                                            <span>
                                                <IconButton 
                                                    color="primary" 
                                                    onClick={() => !isEditDisabled && handleEdit(index, row)}
                                                    disabled={isEditDisabled}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow><TableCell colSpan={7} align="center"><Nodatapage /></TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
                <IconButton onClick={handleDialogClose} sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}>
                    <CloseIcon />
                </IconButton>
                <DialogTitle>{editingId ? 'Edit Approval Process' : 'Add Approval Process'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {['subject', 'related'].map((field) => (
                            <Grid item xs={12} md={6} key={field}>
                                {field === 'related' ? (
                                    <FormControl fullWidth required>
                                        <InputLabel>Related</InputLabel>
                                        <Select
                                            value={formData[field]}
                                            label="Related"
                                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                                        >
                                            {leaveTypes.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <TextField
                                        fullWidth
                                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                                        value={formData[field]}
                                        onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                                        required
                                    />
                                )}
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Box mt={4} sx={calendarStyles}>
                                <Calendar
                                    onClickDay={(date) => {
                                        const newDate = new Date(date);
                                        const index = selectedDates.findIndex(d => isSameDay(new Date(d.date), newDate));
                                        if (index === -1) {
                                            setSelectedDates([...selectedDates, { date: newDate, type: 'FULL' }]);
                                        } else {
                                            const updated = [...selectedDates];
                                            updated[index].type = updated[index].type === 'FULL' ? 'HALF' : null;
                                            setSelectedDates(updated.filter(d => d.type !== null));
                                        }
                                    }}
                                    tileDisabled={({ date }) => isBefore(date, startOfDay(new Date()))}
                                />
                                <Box mt={2}>
                                    {selectedDates.map((dates, i) => (
                                        <Box key={i} sx={{ mb: 2 }}>
                                            <Box display="flex" alignItems="center" gap={1} sx={dateBoxStyle}>
                                                <EventIcon color="primary" />
                                                <Chip
                                                    label={format(new Date(dates.date), 'yyyy-MM-dd')}
                                                    variant="outlined"
                                                    color="error"
                                                    onDelete={() => editingId ? 
                                                        handleDeleteDate(editingId, format(new Date(dates.date), 'yyyy-MM-dd')) : 
                                                        setSelectedDates(selectedDates.filter((_, idx) => idx !== i))}
                                                    deleteIcon={<Tooltip title="Remove date"><DeleteIcon /></Tooltip>}
                                                    sx={chipStyle}
                                                />
                                                <TextField
                                                    select size="small"
                                                    value={dates.type}
                                                    onChange={(e) => {
                                                        const updated = [...selectedDates];
                                                        updated[i].type = e.target.value;
                                                        if (e.target.value === 'FULL') {
                                                            updated[i].fromTime = '';
                                                            updated[i].toTime = '';
                                                        }
                                                        setSelectedDates(updated);
                                                    }}
                                                >
                                                    {['FULL', 'HALF'].map((type) => (
                                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                                    ))}
                                                </TextField>
                                                {dates.type === 'HALF' && (
                                                    <>
                                                        <TextField
                                                            size="small" type="time" label="From"
                                                            value={dates.fromTime}
                                                            onChange={(e) => {
                                                                const updated = [...selectedDates];
                                                                updated[i].fromTime = e.target.value;
                                                                setSelectedDates(updated);
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        />
                                                        <TextField
                                                            size="small" type="time" label="To"
                                                            value={dates.toTime}
                                                            onChange={(e) => {
                                                                const updated = [...selectedDates];
                                                                updated[i].toTime = e.target.value;
                                                                setSelectedDates(updated);
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        />
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
                    <Button onClick={handleDialogClose} variant="outlined" color="secondary">Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} sx={{ ml: 2 }}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <Snackbar open={openToast} autoHideDuration={3000} onClose={() => setOpenToast(false)} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="error" onClose={() => setOpenToast(false)}>You cannot assign notification to yourself</Alert>
            </Snackbar>
        </>
    );
};

const tableCellStyle = {
    border: '1px solid rgba(224, 224, 224, 1)',
    padding: '8px 12px',
    fontSize: '0.875rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontFamily: 'Marquis',
    textTransform: 'uppercase',
    wordBreak: 'break-word',
    '&.MuiTableCell-head': {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        position: 'sticky',
        top: 0,
        zIndex: 1,
    }
};

const calendarStyles = {
    '& .react-calendar__month-view__days__day': {
        border: '1px solid #ccc',
        backgroundColor: '#f5eed5',
        height: 50,
        width: 50,
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    '& .react-calendar__tile--now': { backgroundColor: '#d6d6eb' },
    '& .react-calendar__tile--active': { backgroundColor: '#c2c2e0 !important', color: '#000' },
    '& .react-calendar__month-view__weekdays__weekday': {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#FFFFFF',
        fontSize: '0.75rem',
        border: '1px solid #ccc',
        height: 50,
        width: 50,
        backgroundColor: '#1A2B48',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    '& .react-calendar__month-view__weekdays__weekday abbr': { textDecoration: 'none' },
    '@media (max-width: 600px)': { '& .react-calendar__month-view__days__day': { height: 50 } }
};

const dateBoxStyle = {
    backgroundColor: '#f9f9f9',
    borderRadius: 2,
    p: 1.2,
    boxShadow: 1,
};

const chipStyle = {
    fontWeight: 500,
    fontSize: '0.875rem',
    px: 1,
    backgroundColor: '#e3f2fd',
    color: 'rgb(241, 62, 89)',
};

export default ApprovalProcessTab;