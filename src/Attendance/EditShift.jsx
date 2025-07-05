import React, { useState, useEffect } from "react";
import axios from '../Axiosinstance';
import {
  Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, FormLabel,
  InputLabel, useMediaQuery, useTheme, RadioGroup, FormControlLabel, Radio,
  CircularProgress
} from "@mui/material";
import { Edit, Delete, Close } from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, addDays, differenceInDays, isAfter, isBefore, isWithinInterval, parseISO } from "date-fns";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { deleteEntity } from '../Constants/DeleteEntity';
import { alpha } from '@mui/material/styles';

const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const ShiftCategoriesTab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [shiftOptions, setShiftOptions] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [shiftIdToDelete, setshiftIdToDelete] = useState(null);
  const [loading, setLoading] = useState({
    shifts: false,
    categories: false,
    save: false,
    staff: false,
    departments: false,
    roles: false
  });
  // Modal state
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [editData, setEditData] = useState({
    staffId: "",
    departmentId: "",
    roleId: "",
    repeatMode: "default",
    defaultShiftCategoryId: "",
    weeklyShifts: {},
    specificShifts: {},
    fromDate: new Date(),
    toDate: new Date()
  });
  const [specificDays, setSpecificDays] = useState([]);
  // Helper function for toast notifications
  const showToast = (message, type = "success") => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({
          ...prev,
          shifts: true,
          categories: true,
          staff: true,
          departments: true,
          roles: true
        }));

        const [
          shiftsRes,
          categoriesRes,
          staffRes,
          departmentsRes,
          rolesRes
        ] = await Promise.all([
          axios.get('/work-shifts'),
          axios.get('/shift-category/get-all-workshifts'),
          axios.get('/staff/allstaffs'),
          axios.get('/departments/all-departments'),
          axios.get('/roles/all')
        ]);

        setShifts(Array.isArray(shiftsRes?.data) ? shiftsRes.data : []);
        setShiftOptions(Array.isArray(categoriesRes?.data)
          ? categoriesRes.data.map(shift => ({
            id: shift.id,
            label: `${shift.name} (${shift.workStartTime} - ${shift.workEndTime})`
          }))
          : []);
        setStaffOptions(Array.isArray(staffRes?.data) ? staffRes.data : []);
        setDepartmentOptions(Array.isArray(departmentsRes?.data) ? departmentsRes.data : []);
        setRoleOptions(Array.isArray(rolesRes?.data) ? rolesRes.data : []);

      } catch (error) {
        showToast("Failed to load data: " + (error.response?.data?.message || error.message)||(error.response?.data?.details || error.message), "error");
        console.error("API Error:", error);
      } finally {
        setLoading(prev => ({
          ...prev,
          shifts: false,
          categories: false,
          staff: false,
          departments: false,
          roles: false
        }));
      }
    };

    fetchData();
  }, []);

  // Calculate specific days when dates change
  useEffect(() => {
    if (editData.repeatMode === "specific" && editData.fromDate && editData.toDate) {
      const diff = differenceInDays(editData.toDate, editData.fromDate) + 1;
      setSpecificDays(diff > 0 ?
        Array.from({ length: diff }, (_, i) => addDays(editData.fromDate, i)) :
        []);
    } else {
      setSpecificDays([]);
    }
  }, [editData.fromDate, editData.toDate, editData.repeatMode]);

  // Handlers
  const handleEdit = (shift) => {
    console.log("Editing shift:", shift);
    setCurrentShift(shift);

    // Map API response to edit form data
    const repeatMode = shift.shiftType === "DEFAULT" ? "default" :
      shift.shiftType === "WEEKLY" ? "weekly" : "specific";

    // Filter specific shifts to only include dates within the period
    const filteredSpecificShifts = shift.dateToShiftCategoryIdMap ?
      Object.fromEntries(
        Object.entries(shift.dateToShiftCategoryIdMap).filter(([date]) => {
          const dateObj = parseISO(date);
          const fromDate = shift.fromDate ? new Date(shift.fromDate) : new Date();
          const toDate = shift.toDate ? new Date(shift.toDate) : new Date();
          return isWithinInterval(dateObj, { start: fromDate, end: toDate });
        })
      ) : {};

    setEditData({
      staffId: shift.staff?.id || shift.staffId || "",
      departmentId: shift.department?.id || shift.departmentId || "",
      roleId: shift.role?.id || shift.roleId || "",
      repeatMode,
      defaultShiftCategoryId: shift.defaultShiftCategoryId || "",
      weeklyShifts: shift.dayToShiftCategoryIdMap || {},
      specificShifts: filteredSpecificShifts,
      fromDate: shift.fromDate ? new Date(shift.fromDate) : new Date(),
      toDate: shift.toDate ? new Date(shift.toDate) : new Date()
    });

    setOpenEditModal(true);
  };

  const handleDeleteshift = (id) => {
    setshiftIdToDelete(id);
    setConfirmDialogOpen(true);
  };

  // const handleDelete = async (id) => {
  //   try {
  //     setLoading(prev => ({ ...prev, save: true }));
  //     await axios.delete(`/work-shifts/${id}`);
  //     setShifts(shifts.filter(shift => shift.id !== id));
  //     showToast("Shift deleted successfully");
  //   } catch (error) {
  //     showToast("Failed to delete shift: " + (error.response?.data?.message || error.message)||(error.response?.data?.details || error.message), "error");
  //   } finally {
  //     setLoading(prev => ({ ...prev, save: false }));
  //   }
  // };
const confirmDelete = async (id) => {
  deleteEntity({
    endpoint: `/work-shifts/${id}`, // ✅ CORRECT INTERPOLATION
    entityId: shiftIdToDelete,
    fetchDataCallback: ShiftCategoriesTab, // function to refetch or update list
    onFinally: () => {
      setConfirmDialogOpen(false);
      setshiftIdToDelete(null);
    },
    onSuccessMessage: 'Shift deleted successfully!',
    onErrorMessage: 'Failed to delete shift. Please try again.',
  });
};

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleShiftChange = (key, value) => {
    if (editData.repeatMode === "weekly") {
      setEditData(prev => ({
        ...prev,
        weeklyShifts: {
          ...prev.weeklyShifts,
          [key]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        specificShifts: {
          ...prev.specificShifts,
          [key]: value
        }
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(prev => ({ ...prev, save: true }));

      // Filter specific shifts to only include dates within the selected period
      const filteredSpecificShifts = Object.fromEntries(
        Object.entries(editData.specificShifts).filter(([date]) => {
          const dateObj = parseISO(date);
          return isWithinInterval(dateObj, {
            start: editData.fromDate,
            end: editData.toDate
          });
        })
      );

      // Prepare payload based on repeat mode
      const payload = {
        staff: { id: parseInt(editData.staffId) },
        department: { id: parseInt(editData.departmentId) },
        role: { id: parseInt(editData.roleId) },
        shiftType:
          editData.repeatMode === "default"
            ? "DEFAULT"
            : editData.repeatMode === "weekly"
              ? "WEEKLY"
              : "SPECIFIC_PERIOD",
        ...(editData.repeatMode === "default" && {
          defaultShiftCategoryId: parseInt(editData.defaultShiftCategoryId),
        }),
        ...(editData.repeatMode === "weekly" && {
          dayToShiftCategoryIdMap: editData.weeklyShifts
        }),
        ...(editData.repeatMode === "specific" && {
          fromDate: format(editData.fromDate, "yyyy-MM-dd"),
          toDate: format(editData.toDate, "yyyy-MM-dd"),
          dateToShiftCategoryIdMap: filteredSpecificShifts
        }),
      };

      let response;
      if (currentShift) {
        response = await axios.put(`/work-shifts/${currentShift.id}`, payload);
        setShifts(shifts.map(s => s.id === currentShift.id ? response.data : s));
        showToast("Shift updated successfully");
      } else {
        response = await axios.post('/work-shifts', payload);
        setShifts(prev => [...prev, response.data]);
        showToast("Shift created successfully");
      }
      setOpenEditModal(false);
    } catch (error) {
      showToast(`Failed to ${currentShift ? "update" : "create"} shift: ${error.response?.data?.message || error.message}'\nDetails: ${error.response?.data?.details || 'N/A'}`, "error");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Render shift selection table
  const renderShiftTable = () => {
    const days = editData.repeatMode === "weekly" ? weekDays : specificDays;
    const shifts = editData.repeatMode === "weekly" ? editData.weeklyShifts : editData.specificShifts;

    if (days.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          No days available for selection
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
              <TableCell><b>Day/Date</b></TableCell>
              <TableCell><b>Shift</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day, i) => {
              const isWeekend = typeof day === 'string'
                ? day === "SATURDAY" || day === "SUNDAY"
                : format(day, "EEEE").toUpperCase() === "SATURDAY" ||
                format(day, "EEEE").toUpperCase() === "SUNDAY";

              const dayKey = typeof day === 'string' ? day : format(day, "yyyy-MM-dd");
              const dayLabel = typeof day === 'string'
                ? day.charAt(0) + day.slice(1).toLowerCase()
                : format(day, "EEE, dd-MM");

              return (
                <TableRow key={i} sx={{
                  // backgroundColor: isWeekend ? theme.palette.error.light : "inherit",
                  backgroundColor: isWeekend ? alpha(theme.palette.error.main, 0.1) : "inherit",
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}>
                  <TableCell sx={{
                    color: isWeekend ? theme.palette.error.main : "inherit",
                    fontWeight: 500
                  }}>
                    {dayLabel}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={isWeekend ? "" : (shifts[dayKey] || "")}
                      onChange={(e) => handleShiftChange(dayKey, e.target.value)}
                      fullWidth
                      size="small"
                      disabled={isWeekend || loading.categories}
                    >
                      {loading.categories ? (
                        <MenuItem disabled>Loading shifts...</MenuItem>
                      ) : (
                        shiftOptions.map((opt) => (
                          <MenuItem key={opt.id} value={opt.id}>
                            {opt.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
    );
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Main Table */}
      <TableContainer component={Paper} elevation={3} sx={{ mb: 3 }}>
        <Table sx={{ border: 1, borderColor: 'grey.400' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[300] }}>
              {['S.NO', 'STAFF', 'DEPARTMENT', 'ROLE', 'SHIFT PATTERN', 'ACTIONS'].map((heading) => (
                <TableCell
                  key={heading}
                  align="center"
                  sx={{
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    border: 1,
                    borderColor: 'grey.400',
                  }}
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.shifts ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, border: 1, borderColor: 'grey.400' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, border: 1, borderColor: 'grey.400' }}>
                  <Typography>No shift data available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((shift, index) => (
                <TableRow key={shift.id} hover>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400' }}>{index + 1}</TableCell>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400' }}>
                    {shift.staff?.name || shift.staffName || 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400', textTransform: 'uppercase' }}>
                    {shift.department?.name || shift.departmentName || 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400' }}>
                    {shift.role?.roleName || shift.roleName || 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ textTransform: 'uppercase', border: 1, borderColor: 'grey.400' }}>
                    {shift.shiftType === 'DEFAULT'
                      ? `Default: ${shiftOptions.find(opt => opt.id === shift.defaultShiftCategoryId)?.label || 'Not set'}`
                      : shift.shiftType === 'WEEKLY'
                        ? 'Weekly Pattern'
                        : 'Specific Period'}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400' }}>
                    <IconButton
                      onClick={() => handleEdit(shift)}
                      color="primary"
                      disabled={loading.save}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteshift(shift.id)}
                      color="error"
                      disabled={loading.save}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
       <ConfirmDialog
                      open={confirmDialogOpen}
                      onClose={() => setConfirmDialogOpen(false)}
                      onConfirm={confirmDelete}
                      title="Confirm Deletion"
                      message="Are you sure you want to delete this shift?"
                      confirmText="Delete"
                    />

      {/* Edit Modal */}
      <Dialog
        open={openEditModal}
        onClose={() => !loading.save && setOpenEditModal(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
       <DialogTitle sx={{ bgcolor: '#142a4f', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6"  sx={{ textAlign: 'center', width: '100%' }}>{currentShift ? "EDIT" : "Add"} SHIFT ALLOCATION</Typography>
            <IconButton
              onClick={() => !loading.save && setOpenEditModal(false)}
              edge="end"
              color="inherit"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {/* Basic Info */}
          <Box mb={3}>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2} mb={2}>
              {/* Staff Select */}
              <FormControl fullWidth>
                <InputLabel>Staff</InputLabel>
                <Select
                  value={editData.staffId || ""}
                  onChange={(e) => handleChange("staffId", e.target.value)}
                  label="Staff"
                  disabled={loading.staff}
                >
                  {loading.staff ? (
                    <MenuItem disabled>Loading staff...</MenuItem>
                  ) : staffOptions.length > 0 ? (
                    staffOptions.map(staff => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No staff available</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Department Select */}
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={editData.departmentId || ""}
                  onChange={(e) => handleChange("departmentId", e.target.value)}
                  label="Department"
                  disabled={loading.departments}
                >
                  {loading.departments ? (
                    <MenuItem disabled>Loading departments...</MenuItem>
                  ) : departmentOptions.length > 0 ? (
                    departmentOptions.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name.toUpperCase()}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No departments available</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Role Select */}
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editData.roleId || ""}
                  onChange={(e) => handleChange("roleId", e.target.value)}
                  label="Role"
                  disabled={loading.roles}
                >
                  {loading.roles ? (
                    <MenuItem disabled>Loading roles...</MenuItem>
                  ) : roleOptions.length > 0 ? (
                    roleOptions.map(role => (
                      <MenuItem key={role.id} value={role.roleId}>
                        {role.roleName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No roles available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Repeat Mode Selection */}
          <Box mb={3}>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: "bold" }}>Repeat Mode</FormLabel>
            <RadioGroup
              row={!isMobile}
              value={editData.repeatMode}
              onChange={(e) => handleChange("repeatMode", e.target.value)}
              sx={{ gap: 2 }}
            >
               <FormControlLabel value="default" control={<Radio />}label="Default (Same shift all days)"/>
              <FormControlLabel value="weekly"control={<Radio />}label="Weekly Pattern"/>
              <FormControlLabel value="specific"control={<Radio />}label="Specific Period"/>
            </RadioGroup>
          </Box>
          {/* Default Shift */}
          {editData.repeatMode === "default" && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Default Shift</InputLabel>
              <Select
                value={editData.defaultShiftCategoryId || ""}
                onChange={(e) => handleChange("defaultShiftCategoryId", e.target.value)}
                label="Default Shift"
                disabled={loading.categories}
              >
                {loading.categories ? (
                  <MenuItem disabled>Loading shifts...</MenuItem>
                ) : shiftOptions.length > 0 ? (
                  shiftOptions.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No shifts available</MenuItem>
                )}
              </Select>
            </FormControl>
          )}

          {/* Calendar for Specific Period */}
          {editData.repeatMode === "specific" && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                Select Date Range
              </Typography>
              <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={4}>
                <Box>
                  <Typography>From Date</Typography>
                  <Calendar
                    onChange={(date) => {
                      if (isAfter(date, editData.toDate)) {
                        handleChange('toDate', date);
                      }
                      handleChange('fromDate', date);
                    }}
                    value={editData.fromDate}
                  />
                </Box>
                <Box>
                  <Typography>To Date</Typography>
                  <Calendar
                    onChange={(date) => {
                      if (isBefore(date, editData.fromDate)) {
                        handleChange('fromDate', date);
                      }
                      handleChange('toDate', date);
                    }}
                    value={editData.toDate}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* Shift Table */}
          {(editData.repeatMode === "weekly" || editData.repeatMode === "specific") && (
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                {editData.repeatMode === "weekly" ? "Weekly Shifts" : "Daily Shifts"}
              </Typography>
              {renderShiftTable()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            disabled={loading.save}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading.save}
            variant="contained"
            color="primary"
            startIcon={loading.save ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {currentShift ? "Update Shift" : "Create Shift"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftCategoriesTab;