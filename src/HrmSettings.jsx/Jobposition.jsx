import React, { useState, useEffect, } from 'react';
import {
    Paper, Table, TableHead, TableBody, TableRow, TableCell,
    Button, Typography, Box, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, InputAdornment, CircularProgress,
    Tooltip, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import { Add, Edit, Delete, Search, Cancel } from '@mui/icons-material';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { deleteEntity } from '../Constants/DeleteEntity';
import Nodatapage from "../Nodatapage";
import InfiniteScroll from 'react-infinite-scroll-component';
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";

const JobpositionManagement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [jobpositionData, setJobpositionData] = useState([]);
    const [openJobpositionModal, setOpenJobpositionModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentJobpositionId, setCurrentJobpositionId] = useState(null);
    const [newJobposition, setNewJobposition] = useState({ name: '' });
    const [filterText, setFilterText] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [jobpositionIdToDelete, setJobpositionIdToDelete] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const {role, featurePermissions } = useUser();
    const isAdmin = role === 'ADMIN';
    const canEditSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'EDIT');
    const canDeleteSettings= isAdmin || hasPermission(featurePermissions, 'Settings', 'DELETE');
    const canManageSettings = canEditSettings || canDeleteSettings;
    const canCreateSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'CREATE');

    // Fetch initial jobposition data
    useEffect(() => {
        fetchJobpositionData();
    }, []);

    const fetchJobpositionData = async (reset = false) => {
        if (reset) {
            setInitialLoading(true);
        } else {
            if (loadingMore) return;
            setLoadingMore(true);
        }

        try {
            const params = {
                size: 10,
                ...(!reset && cursor && { cursor }),
                ...(filterText && { search: filterText })
            };

            const response = await axios.get('/job-positions', { params });
            const newData = response.data;

            setJobpositionData(prev =>
                reset ? newData : [...prev, ...newData]
            );
            setHasMore(newData.length >= 10);
            if (newData.length > 0) {
                setCursor(newData[newData.length - 1].id);
            }
        } catch (error) {
            console.error('Error fetching jobposition data:', error);
            // ... error handling ...
        } finally {
            if (reset) {
                setInitialLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };
    // Initial load and reset when filter changes
    useEffect(() => {
        fetchJobpositionData(true);
    }, [filterText]);


    const handleOpenJobpositionModal = () => {
        setOpenJobpositionModal(true);
        setIsEditing(false);
        setNewJobposition({ name: '' });
    };

    const handleCloseJobpositionModal = () => {
        setOpenJobpositionModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewJobposition({
            ...newJobposition,
            [name]: value.toUpperCase(), // Convert to uppercase as user types
        });
    };

    const handleAddJobposition = async () => {
        if (!newJobposition.name?.trim()) {
            toast.error('Please enter a valid job position name');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: newJobposition.name.toUpperCase(),
            };

            if (isEditing) {
                await axios.put(`/job-positions/${currentJobpositionId}`, payload);
                toast.success('Job position updated successfully!');
            } else {
                await axios.post('/job-positions', payload);
                toast.success('Job position added successfully!');
            }
            await fetchJobpositionData();
            handleCloseJobpositionModal();
        } catch (error) {
            console.error('Error saving job position:', error);
            const errorMsg = error.response?.data?.message ||
                (error.code === 'ERR_NETWORK' ? 'Network error - please check your connection' :
                    'Failed to save job position');
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleEditJobposition = (id) => {
        const jobpositionToEdit = jobpositionData.find((jobposition) => jobposition.id === id);
        if (jobpositionToEdit) {
            setNewJobposition({ name: jobpositionToEdit.name.toUpperCase() });
            setCurrentJobpositionId(id);
            setIsEditing(true);
            setOpenJobpositionModal(true);
            // toast.info('Editing job position');
        }
    };

    const handleDeleteJobposition = (id) => {
        setJobpositionIdToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        deleteEntity({
            endpoint: '/job-positions',
            entityId: jobpositionIdToDelete,
            fetchDataCallback: fetchJobpositionData,
            onFinally: () => {
                setConfirmDialogOpen(false);
                setJobpositionIdToDelete(null);
            },
            onSuccessMessage: 'jobposition deleted successfully!',
            onErrorMessage: 'Failed to delete workplace. Please try again.'
        });
    };

    const filteredJobpositionData = jobpositionData.filter((row) =>
        String(row.id).includes(filterText.toLowerCase()) ||
        row.name.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <>
            <Paper style={{ padding: isMobile ? '12px' : '24px' }}>
                <Box>
                    <Box
                        display="flex"
                        flexDirection={isMobile ? 'column' : 'row'}
                        alignItems={isMobile ? 'stretch' : 'center'}
                        marginBottom="16px"
                        gap="8px"
                    >
                        {canCreateSettings && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenJobpositionModal}
                                style={{ height: '40px' }}
                                startIcon={<Add />}
                                fullWidth={isMobile}
                            >
                                {isMobile ? 'New' : 'New Job Position'}
                            </Button>
                        )}
                        <TextField
                            variant="outlined"
                            placeholder="Search Job Position or ID"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                style: { height: '40px' },
                            }}
                            style={{
                                maxWidth: isMobile ? '100%' : '300px',
                                marginRight: isMobile ? '0' : '16px'
                            }}
                            fullWidth={isMobile}
                        />

                        {!isMobile && <Box flexGrow={1} />}

                    </Box>


                    <>
                        <Box sx={{ overflowX: 'auto' }}>
                            {initialLoading ? (
                                <Box display="flex" justifyContent="center" p={2}>
                                    <CircularProgress />
                                </Box>
                            ) : filteredJobpositionData.length === 0 ? (
                                <Nodatapage />
                            ) : (
                                <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                                    <InfiniteScroll
                                        dataLength={filteredJobpositionData.length}
                                        next={() => fetchJobpositionData()}
                                        hasMore={hasMore}
                                        loader={
                                            loadingMore && (
                                                <Box display="flex" justifyContent="center" p={2}>
                                                    <CircularProgress />
                                                </Box>
                                            )
                                        }
                                        endMessage={
                                            <Box textAlign="center" p={2}>
                                                <Typography variant="body2" color="textSecondary">
                                                    No more job positions to load
                                                </Typography>
                                            </Box>
                                        }
                                        style={{ overflow: 'visible' }}
                                    >

                                        <Table
                                            size={isMobile ? "small" : "medium"}
                                            sx={{
                                                '& .MuiTableCell-root': {
                                                    border: '1px solid rgba(224, 224, 224, 1)',
                                                    padding: isMobile ? '6px 8px' : '8px 12px',
                                                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                                                },
                                                '& .MuiTableHead-root': {
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 2, // Higher than the body cells
                                                    backgroundColor: '#f5f5f5'
                                                },
                                                '& .MuiTableCell-head': {
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#f5f5f5'
                                                }
                                            }}
                                        >
                                            <TableHead>


                                                <TableRow>
                                                    <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: isMobile ? '50px' : '100px' }}>ID</TableCell>
                                                    <TableCell align="center" style={{ minWidth: isMobile ? '100px' : '150px' }}>JOB POSITION</TableCell>
                                                     {canManageSettings && <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: isMobile ? '100px' : '150px' }}>ACTIONS</TableCell>}
                                                </TableRow>
                                            </TableHead>


                                            <TableBody>

                                                {filteredJobpositionData.map((row, index) => (
                                                    <TableRow key={row.id} hover>
                                                        <TableCell align="center">{index + 1}</TableCell>
                                                        <TableCell align="center" style={{ textTransform: "uppercase" }}>
                                                            {row.name}
                                                        </TableCell>
                                                          {canManageSettings && (
                                                        <TableCell align="center">
                                                              {canEditSettings && (
                                                            <Tooltip title="Edit">
                                                                <IconButton
                                                                    onClick={() => handleEditJobposition(row.id)}
                                                                    color="primary"
                                                                    size={isMobile ? "small" : "medium"}
                                                                >
                                                                    <Edit fontSize={isMobile ? "small" : "medium"} />
                                                                </IconButton>
                                                            </Tooltip>
                                                              )}
                                                                {canDeleteSettings && (
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    onClick={() => handleDeleteJobposition(row.id)}
                                                                    color="error"
                                                                    size={isMobile ? "small" : "medium"}
                                                                >
                                                                    <Delete fontSize={isMobile ? "small" : "medium"} />
                                                                </IconButton>
                                                            </Tooltip>
                                                                )}
                                                        </TableCell>
                                                          )}
                                                    </TableRow>
                                                ))}

                                            </TableBody>
                                        </Table>
                                    </InfiniteScroll>
                                </Box>
                            )}
                        </Box>
                    </>

                </Box>
                <ConfirmDialog
                    open={confirmDialogOpen}
                    onClose={() => setConfirmDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this workplace?"
                    confirmText="Delete"
                />
                <Dialog
                    open={openJobpositionModal}
                    onClose={handleCloseJobpositionModal}
                    maxWidth="sm"
                    fullWidth
                    fullScreen={isMobile}
                >
                    <DialogTitle>
                        <Box sx={{
                            bgcolor: '#142a4f',
                            color: 'white',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            textAlign: 'center'
                        }}>
                            <Typography variant="h6" fontWeight="bold">
                                {isEditing ? 'EDIT JOB POSITION' : 'NEW JOB POSITION'}
                            </Typography>

                        </Box>

                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: isMobile ? 0 : 2 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Job Position Name"
                                    name="name"
                                    value={newJobposition.name}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^[A-Za-z\s]*$/.test(value) && value.length <= 50) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    autoFocus
                                    inputProps={{
                                        maxLength: 50,
                                        placeholder: "Enter Job Position (e.g. SOFTWARE ENGINEER)",
                                    }}
                                    // helperText="Only alphabetic characters and spaces are allowed"
                                    sx={{
                                        '& input::placeholder': {
                                            fontSize: '0.9rem',
                                            color: '#000',
                                        },
                                    }}
                                    onKeyPress={(e) => {
                                        // Prevent invalid characters from being entered
                                        if (!/[A-Za-z\s]/.test(e.key)) {
                                            e.preventDefault();
                                            toast.warning('Only alphabetic characters are allowed');
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
                        <Button
                            onClick={handleCloseJobpositionModal}
                            color="primary"
                            variant="outlined"
                            style={{ textTransform: 'uppercase' }}
                            startIcon={<Cancel />}
                            size={isMobile ? "small" : "medium"}
                        >
                            CANCEL
                        </Button>
                        <Button
                            onClick={handleAddJobposition}
                            color="primary"
                            variant="contained"
                            disabled={!newJobposition.name.trim() || loading}
                            style={{ textTransform: 'uppercase' }}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
                            size={isMobile ? "small" : "medium"}
                        >
                            {isEditing ? 'UPDATE' : 'ADD'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </>
    );
};

export default JobpositionManagement;