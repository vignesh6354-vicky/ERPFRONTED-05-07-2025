import React, { useState, useEffect } from 'react';
import axios from '../Axiosinstance';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, Tabs, Tab, Button, IconButton,
    useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, FormControl, InputLabel, Select, TextField, MenuItem,InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
// import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import Nodatapage from "../Nodatapage";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResponsiveTable = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = React.useState(0);
    const [loading, setLoading] = useState(false);
    const { role, featurePermissions } = useUser();
    // const isAdmin = role === 'ADMIN';
    // const canEditSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'EDIT');
    // const canDeleteSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'DELETE');
    // const canManageSettings = canEditSettings|| canDeleteSettings;
    // const canCreateSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'CREATE');
    // const [refreshKey, setRefreshKey] = useState(0);
    // const [hasMore, setHasMore] = useState(false);
    // const [cursor, setCursor] = useState(null);
    // const [initialLoading, setInitialLoading] = useState(true);
    // const [loadingMore, setLoadingMore] = useState(false);
    // const [setDownloading] = useState(false);
    const [apiData, setApiData] = useState({
        staff: [],
        departments: [],
        roles: []
    });

    const [formData, setFormData] = useState({
        staffId: '',
        role: '',
        department: '',
        staffName: '',
        incentiveReceivedDate: '',
        amount: '',
        incentiveType: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [currentIncentiveId, setCurrentIncentiveId] = useState(null);
    const [incentiveToDelete, setIncentiveToDelete] = useState(null);
    const [tableData, setTableData] = useState([]);

    // Fetch all data needed for the component
    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [incentivesRes, staffRes, deptRes, rolesRes] = await Promise.all([
                axios.get("/Incentive"),
                axios.get("/staff/allstaffs"),
                axios.get("/departments/all-departments"),
                axios.get("/roles/all")
            ]);

            setApiData({
                staff: staffRes.data,
                departments: deptRes.data,
                roles: rolesRes.data
            });

            setTableData(incentivesRes.data.map(item => ({
                incentiveId: item.incentiveId,
                serialNumber: item.incentiveId,
                role: item.roleName,
                department: item.departmentName,
                staffName: item.staffName,
                date: item.incentiveReceivedDate,
                amount: `$${item.amount}`,
                incentiveType: item.incentiveType,
                staffId: item.staffId
            })));
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAddNew = async () => {
        setIsEditing(false);
        setCurrentIncentiveId(null);
        setFormData({
            staffId: '',
            role: '',
            department: '',
            staffName: '',
            incentiveReceivedDate: '',
            amount: '',
            incentiveType: ''
        });

        try {
            setLoading(true);
            const [staffRes, deptRes, rolesRes] = await Promise.all([
                axios.get("/staff/allstaffs"),
                axios.get("/departments/all-departments"),
                axios.get("/roles/all")
            ]);

            setApiData({
                staff: staffRes.data,
                departments: deptRes.data,
                roles: rolesRes.data
            });
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
            toast.error("Failed to load dropdown data");
        } finally {
            setLoading(false);
        }

        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({
            staffId: '',
            role: '',
            department: '',
            staffName: '',
            incentiveReceivedDate: '',
            amount: '',
            incentiveType: ''
        });
    };

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);
        setIncentiveToDelete(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStaffChange = (e) => {
        const selectedStaffId = e.target.value;
        const selectedStaff = apiData.staff.find(staff => staff.id == selectedStaffId);

        if (selectedStaff) {
            setFormData(prev => ({
                ...prev,
                staffId: selectedStaff.id,
                staffName: selectedStaff.name,
                role: selectedStaff.roleName || '',
                department: selectedStaff.departmentName || ''
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                staff: {
                    id: formData.staffId
                },
                incentiveReceivedDate: formData.incentiveReceivedDate,
                amount: parseFloat(formData.amount),
                incentiveType: formData.incentiveType
            };

            if (isEditing && currentIncentiveId) {
                await axios.put(`/Incentive/${currentIncentiveId}`, {
                    amount: parseFloat(formData.amount),
                    incentiveType: formData.incentiveType
                });
                toast.success('Incentive updated successfully!');
            } else {
                await axios.post("/Incentive", payload);
                toast.success('Incentive added successfully!');
            }

            await fetchAllData();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving incentive:", error);
            toast.error(`Failed to ${isEditing ? 'update' : 'add'} incentive`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        setIsEditing(true);
        setCurrentIncentiveId(row.incentiveId);
        setFormData({
            staffId: row.staffId,
            role: row.role,
            department: row.department,
            staffName: row.staffName,
            incentiveReceivedDate: row.date,
            amount: row.amount.replace('$', ''),
            incentiveType: row.incentiveType
        });
        setOpenModal(true);
    };

    const handleDeleteClick = (incentiveId) => {
        setIncentiveToDelete(incentiveId);
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/Incentive/${incentiveToDelete}`);
            toast.success('Incentive deleted successfully!');
            await fetchAllData();
        } catch (error) {
            console.error("Error deleting incentive:", error);
            toast.error('Failed to delete incentive');
        } finally {
            setLoading(false);
            handleCloseDeleteModal();
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    bgcolor: '#F0F4F8',
                    padding: '8px 12px',
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#142a4f',
                        padding: '6px 18px',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            backgroundColor: '#e6ecf3',
                        },
                        '&.Mui-selected': {
                            backgroundColor: '#142a4f',
                            color: '#ffffff',
                            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                        },
                    },
                }}
            >
                <Tab label="INCENTIVE" />
            </Tabs>
            <Box>
                {/* Add/Edit Incentive Modal */}
                <Dialog
                    open={openModal}
                    onClose={handleCloseModal}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                {isEditing ? 'Edit Incentive' : 'Add New Incentive'}
                            </Typography>
                            <IconButton onClick={handleCloseModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                                <Typography>Loading data...</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                                <FormControl fullWidth size="medium">
                                    <InputLabel>Staff</InputLabel>
                                    <Select
                                        name="staffId"
                                        value={formData.staffId}
                                        label="Staff"
                                        onChange={handleStaffChange}
                                        disabled={isEditing}
                                    >
                                        {apiData.staff.map((staff) => (
                                            <MenuItem key={staff.id} value={staff.id}>
                                                {staff.name.toUpperCase()} ({staff.hrCode.toUpperCase()}) - {staff.roleName.toUpperCase()} ( {staff.departmentName.toUpperCase()} )
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    name="role"
                                    label="Role"
                                    size="medium"
                                    fullWidth
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled
                                />

                                <TextField
                                    name="department"
                                    label="Department"
                                    size="medium"
                                    fullWidth
                                    value={formData.department}
                                    onChange={handleChange}
                                    disabled
                                />

                                <TextField
                                    name="incentiveReceivedDate"
                                    label="Date"
                                    type="date"
                                    size="medium"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={formData.incentiveReceivedDate}
                                    onChange={handleChange}
                                />

                                <TextField
                                    name="amount"
                                    label="Amount"
                                    type="number"
                                    size="medium"
                                    fullWidth
                                    value={formData.amount}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    }}
                                />

                                <TextField
                                    name="incentiveType"
                                    label="Incentive Type"
                                    size="medium"
                                    fullWidth
                                    value={formData.incentiveType}
                                    onChange={handleChange}
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            color="primary"
                            variant="contained"
                            disabled={!formData.staffId || !formData.incentiveReceivedDate || !formData.amount || !formData.incentiveType || loading}
                        >
                            {isEditing ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog
                    open={openDeleteModal}
                    onClose={handleCloseDeleteModal}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography variant="h6">Confirm Delete</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this incentive?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteModal} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            color="error"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Main Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        backgroundColor: '#f9f9f9',
                        p: 1,
                        m: 'auto',
                        width: '95%',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: isMobile ? 'center' : 'flex-start',
                            mb: 2,
                            px: 1,
                            mt: 3,
                        }}
                    >
                        {/* {canCreateSettings && ( */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddNew}
                            size={isMobile ? 'small' : 'medium'}
                            disabled={loading}
                            fullWidth={isMobile}
                        >
                            {loading ? 'Loading...' : 'ADD INCENTIVE'}
                        </Button>
                        {/* )} */}
                    </Box>

                    {/* Scrollable Box for Mobile */}
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table
                            sx={{
                                minWidth: isMobile ? 650 : '100%',
                                '& .MuiTableCell-root': {
                                    border: '1px solid rgba(224, 224, 224, 1)',
                                    textAlign: 'center',
                                    fontFamily: 'Marquis',
                                    padding: '12px',
                                    fontSize: isMobile ? '12px' : '14px',
                                },
                                '& .MuiTableCell-head': {
                                    backgroundColor: '#f5f5f5',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                },
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.NO</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Staff Name</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Incentive Type</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {tableData.length > 0 ? (
                                    tableData.map((row, index) => (
                                        <TableRow key={row.incentiveId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.role.toUpperCase()}</TableCell>
                                            <TableCell>{row.department.toUpperCase()}</TableCell>
                                            <TableCell>{row.staffName.toUpperCase()}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell>{row.amount}</TableCell>
                                            <TableCell>{row.incentiveType.toUpperCase()}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEdit(row)}
                                                    size="small"
                                                    disabled={loading}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteClick(row.incentiveId)}
                                                    size="small"
                                                    disabled={loading}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            {loading ? 'Loading data...' : <Nodatapage />}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </TableContainer>
            </Box>
        </>
    );
};

export default ResponsiveTable;