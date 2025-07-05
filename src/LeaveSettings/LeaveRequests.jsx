import React, { useState, useEffect } from 'react';
import axios from "../Axiosinstance";
import { format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Box, Button, TextField, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Grid, FormControl,
  InputLabel, Select, MenuItem, Chip, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Add, Delete, Edit, Search, Event as EventIcon, Close as CloseIcon } from '@mui/icons-material';
import Nodatapage from "../Nodatapage";

const leaveTypes = [
  { value: "annualLeave", label: "Annual Leave" },
  { value: "sickLeave", label: "Sick Leave" },
  { value: "maternityLeave", label: "Maternity Leave" },
  { value: "paternityLeave", label: "Paternity Leave" },
  { value: "comoffLeave", label: "Compoff Leave" },
];

const ApprovalProcessTab = ({ value, isStaff, data = [], loading = false, refreshData = () => { } }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject: '', related: '', department: '', role: '', notificationRecipient: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [allStaff, setAllStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [showComoffModal, setShowComoffModal] = useState(false);
  const [comoffType, setComoffType] = useState('');
  const [nextDateAfterComboff, setNextDateAfterComboff] = useState('');
  const currentUserId = Number(JSON.parse(sessionStorage.getItem('userId')));

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
    }
  };

  useEffect(() => { fetchDropdownOptions(); }, []);
  useEffect(() => {
    setFilteredData(searchTerm.trim() === '' ? data :
      data.filter(item =>
        item.leaveAppliedStaffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notificationReceivedToName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.relatedReason?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data]);

  const staffOptions = allStaff
    .filter(staff =>
      (!formData.department || staff.departmentName === formData.department) &&
      (!formData.role || staff.roleName === formData.role)
    )
    .map(staff => ({ value: staff.id, label: staff.name }));

  const handleSave = async () => {
    const payload = {
      subject: formData.subject,
      relatedReason: formData.related === 'comoffLeave' ? 'Combo off' : formData.related,
      nextDateAfterComboOff: formData.related === 'comoffLeave' && comoffType === 'leave' ?
        format(new Date(nextDateAfterComboff), 'yyyy-MM-dd') : null,
      comboOffAction: formData.related === 'comoffLeave' ? comoffType.toUpperCase() : null,
      notificationReceivedTO: { id: formData.notificationRecipient },
      daySelections: selectedDates.map(d => ({
        date: format(new Date(d.date), 'yyyy-MM-dd'),
        ...(d.type === 'HALF' && { startTime: d.fromTime, endTime: d.toTime })
      }))
    };

    try {
      setSaving(true);
      const response = await axios.post('/approval-process', payload);
      toast.success('Approval process created successfully!');
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
    const recipientId = row.notificationReceivedTo?.id || row.notificationReceiverId || row.notoficationReceiverId;
    const staffMember = allStaff.find(s => s.id === recipientId);

    setFormData({
      subject: row.subject || '',
      related: leaveTypes.find(lt => lt.value === row.relatedReason)?.value || leaveTypes[0]?.value || '',
      department: staffMember?.departmentName || '',
      role: staffMember?.roleName || '',
      notificationRecipient: recipientId ? String(recipientId) : ''
    });

    setSelectedDates(row.daySelection?.map(day => ({
      date: new Date(day.date),
      type: day.startTime ? 'HALF' : 'FULL',
      fromTime: day.startTime || '',
      toTime: day.endTime || ''
    })) || []);

    setNextDateAfterComboff(row.nextDateAfterComboff || '');
    setComoffType(row.comboOffAction?.toLowerCase() || '');
    setEditingId(row.id);
    setTimeout(() => setDialogOpen(true), 30);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/approval-process/${selectedRow.id}`);
      toast.success('Deleted successfully!');
      refreshData();
      setConfirmDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete!');
      console.error(error);
    }
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

  const handleRelatedChange = (value) => {
    if (value === 'comoffLeave') {
      setShowComoffModal(true);
    } else {
      setFormData(prev => ({ ...prev, related: value }));
      setComoffType('');
      setNextDateAfterComboff('');
    }
  };

  const handleComoffTypeSelect = (type) => {
    setComoffType(type);
    setShowComoffModal(false);
    setFormData(prev => ({ ...prev, related: 'comoffLeave' }));
    if (type === 'incentive') {
      setSelectedDates([]);
      setNextDateAfterComboff('');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({ subject: '', related: '', department: '', role: '', notificationRecipient: '' });
    setSelectedDates([]);
    setComoffType('');
    setNextDateAfterComboff('');
  };

  const handleRecipientChange = (e) => {
    const selectedId = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      notificationRecipient: selectedId === currentUserId ? '' : String(selectedId)
    }));
  };

  const tableCellStyles = {
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
    },
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

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{ height: '40px', width: { xs: '100%', sm: 'auto' } }}
        >
          New
        </Button>
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
        <Table stickyHeader size="small" sx={{ minWidth: 650, '& .MuiTableCell-root': tableCellStyles }}>
          <TableHead>
            <TableRow>
              {['S.NO', 'NAME', 'APPLIED DATE','RELATED', 'ASSIGN NAME', 'STATUS', 'LEAVE COUNTS', 'ACTIONS'].map(header => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? filteredData.map((row, index) => {
              const status = (row.status || 'PENDING').toUpperCase();
              const isDisabled = status === 'APPROVED' || status === 'REJECTED';

              return (
                <TableRow hover key={row.id || index}>
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
                  <TableCell>{row.notificationReceivedToName}</TableCell>
                  <TableCell>
                    <Chip
                      label={status}
                      size="small"
                      sx={{
                        backgroundColor:
                          status === 'APPROVED' ? '#4caf50' :
                            status === 'REJECTED' ? '#f44336' : '#9e9e9e',
                        color: '#fff',
                        textTransform: 'uppercase',
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.maximumNumberToAssign}</TableCell>
                  <TableCell>
                    <Tooltip title={isDisabled ? "Cannot edit when status is APPROVED or REJECTED" : "Edit"} arrow>
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => !isDisabled && handleEdit(index, row)}
                          disabled={isDisabled}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={isDisabled ? "Cannot delete when status is APPROVED or REJECTED" : "Delete"} arrow>
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedRow(row);
                              setConfirmDialogOpen(true);
                            }
                          }}
                          disabled={isDisabled}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow><TableCell colSpan={8} align="center"><Nodatapage /></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this approval process?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Comoff Type Selection Modal */}
      <Dialog open={showComoffModal} onClose={() => setShowComoffModal(false)}>
        <DialogTitle>Select Compoff Type</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleComoffTypeSelect('leave')}
              sx={{ flex: 1 }}
            >
              Leave
            </Button>
            <Button
              variant="contained"
              onClick={() => handleComoffTypeSelect('incentive')}
              sx={{ flex: 1 }}
            >
              Incentive
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Main Approval Process Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <IconButton onClick={handleDialogClose} sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}>
          <CloseIcon />
        </IconButton>
        <DialogTitle>{editingId ? 'Edit Approval Process' : 'Add Approval Process'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Related</InputLabel>
                <Select
                  value={formData.related}
                  label="Related"
                  onChange={(e) => handleRelatedChange(e.target.value)}
                  renderValue={(selected) => {
                    const selectedOption = leaveTypes.find(lt => lt.value === selected);
                    return selected === 'comoffLeave' && comoffType
                      ? `${selectedOption?.label} (${comoffType})`
                      : selectedOption?.label || '';
                  }}
                >
                  {leaveTypes.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Assign Staff Department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value, notificationRecipient: '' }))}
              >
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Assign Staff Role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value, notificationRecipient: '' }))}
              >
                {roles.map(role => (
                  <MenuItem key={role.roleId} value={role.roleName}>{role.roleName}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Assign Staff Notification"
                value={formData.notificationRecipient}
                onChange={handleRecipientChange}
                required
              >
                {staffOptions.length > 0 ? staffOptions
                  .filter(option => Number(option.value) !== currentUserId)
                  .map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  )) : <MenuItem disabled>No staff available</MenuItem>}
              </TextField>
            </Grid>

            {/* Show calendar and next date field only for comoff leave with leave type selected */}
            {formData.related === 'comoffLeave' && comoffType === 'leave' && (
              <>
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
                              select
                              size="small"
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
                              {['FULL', 'HALF'].map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                              ))}
                            </TextField>
                            {dates.type === 'HALF' && (
                              <>
                                <TextField
                                  size="small"
                                  type="time"
                                  label="From"
                                  value={dates.fromTime}
                                  onChange={(e) => {
                                    const updated = [...selectedDates];
                                    updated[i].fromTime = e.target.value;
                                    setSelectedDates(updated);
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                  size="small"
                                  type="time"
                                  label="To"
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Next Date After Comboff"
                    type="date"
                    value={nextDateAfterComboff}
                    onChange={(e) => setNextDateAfterComboff(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
              </>
            )}

            {/* Show calendar for other leave types */}
            {formData.related !== 'comoffLeave' && (
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
                            select
                            size="small"
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
                            {['FULL', 'HALF'].map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </TextField>
                          {dates.type === 'HALF' && (
                            <>
                              <TextField
                                size="small"
                                type="time"
                                label="From"
                                value={dates.fromTime}
                                onChange={(e) => {
                                  const updated = [...selectedDates];
                                  updated[i].fromTime = e.target.value;
                                  setSelectedDates(updated);
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                              <TextField
                                size="small"
                                type="time"
                                label="To"
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
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
          <Button onClick={handleDialogClose} variant="outlined" color="secondary">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} sx={{ ml: 2 }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="bottom-right" autoClose={1000} />
    </>
  );
};

export default ApprovalProcessTab;