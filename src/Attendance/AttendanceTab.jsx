import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, CardContent,
    Button, DialogTitle, DialogContent, DialogActions,
    Divider, Chip, Dialog
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import Calendar from 'react-calendar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import 'react-calendar/dist/Calendar.css';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import {
    CalendarToday as CalendarIcon,
    Work as WorkIcon,
    AccessTime as TimeIcon,
    Schedule as ScheduleIcon,
    ExitToApp as ExitIcon,
    Person as PersonIcon,
    Fingerprint as CheckInIcon,
    EventBusy as LeaveIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useHolidayContext } from '../Contexts/HolidayContext';

const AttendanceTab = ({ isMobile, month, year }) => {

    const [employeeData, setEmployeeData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const staffId = sessionStorage.getItem("userId");
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedDateRecord, setSelectedDateRecord] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const [absentCount, setAbsentCount] = useState(0);
    const [leaveData, setLeaveData] = useState([]);
    const [leaveDetail, setLeaveDetail] = useState(null);
    const { holidays } = useHolidayContext();
    console.log(holidays, "holidays");


    useEffect(() => {

        fetchEmployeeData();
    }, [staffId]);

    const fetchEmployeeData = async () => {
        try {
            const response = await axios.get(`staff/${staffId}`);
            console.log(response.data, "employeeData");
            setEmployeeData(response.data);
        } catch (err) {
            console.error('Failed to fetch employee data:', err);
            setError('Failed to load employee info');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        axios.get(`/approval-process/approved-leaves/${staffId}`).then((res) => {
            setLeaveData(res.data);
        });
    }, []);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await axios.get(`/attendance/staff/${staffId}`);
                console.log(response.data, "response.data")
                setAttendanceData(response.data);
            } catch (error) {
                console.error('Failed to fetch attendance data:', error);
            }
        };

        if (staffId) {
            fetchAttendanceData();
        }
    }, [staffId]);


    useEffect(() => {
        const todayStr = dayjs().format('YYYY-MM-DD');
        const todayRecord = attendanceData.find(entry => entry.date === todayStr);

        if (todayRecord && ["IN_PROGRESS", "AB", "P"].includes(todayRecord.status)) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
        if (todayRecord && ["AB", "P", "HD"].includes(todayRecord.status)) {
            setIsLoggedOut(true);
        } else {
            setIsLoggedOut(false);
        }
        const count = attendanceData.filter(entry => entry.status === "AB").length;
        setAbsentCount(count);
    }, [attendanceData]);

    const getAttendanceStatus = (date) => {
        const dateStr = date.toLocaleDateString('sv-SE'); // "sv-SE" gives YYYY-MM-DD format in local time
        const record = attendanceData.find((entry) => entry.date === dateStr);
        console.log(record, "record");
        return record ? record.status : null;
    };

    const handleCheckInClick = async () => {
        try {
            // const now = new Date();
            // const formattedLoginTime = now.toISOString(); // e.g., "2025-05-23T20:45:00"

            const formattedLoginTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');
            console.log(formattedLoginTime);
            console.log(formattedLoginTime, "formattedLoginTime");
            const payload = {
                staffId: employeeData.id, // or employeeData.staffId if named that way
                loginTime: formattedLoginTime
            };

            const response = await axios.post(
                '/attendance/login',
                payload
            );

            toast.success("Logged in successfully");

        } catch (error) {
            console.error('Check-in failed:', error);

            const message =
                error.response?.data?.details ||
                error.response?.data?.message ||
                'Check-in failed. Please try again.';
            toast.error(message); // show toast
        }
    };

    const handleCheckOutClick = async () => {
        try {
            // const now = new Date();
            // const formattedLoginTime = now.toISOString(); // e.g., "2025-05-23T20:45:00"
            const formattedLoginTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');
            const payload = {
                staffId: employeeData.id, // or employeeData.staffId if named that way
                logoutTime: formattedLoginTime
            };

            const response = await axios.post(
                '/attendance/logout',
                payload
            );

            toast.success("attendance marked successfully");

        } catch (error) {
            console.error('Check-in failed:', error);

            const message =
                error.response?.data?.details ||
                error.response?.data?.message ||
                'Check-in failed. Please try again.';
            toast.error(message); // show toast
        }
    };

    const approvedLeaveDates = leaveData
        ?.filter((entry) => entry.status === 'APPROVED')
        .flatMap((entry) =>
            entry.daySelection.map((day) => new Date(day.date).toDateString())
        );


    const joiningDate = employeeData.createdDate
        ? dayjs(employeeData.createdDate).toDate()
        : new Date();

    if (loading) return <Typography>Loading...</Typography>;

    return (

        <Box>
            <Box mt={2} sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'flex-end',
                alignItems: isMobile ? 'flex-start' : 'center',
                mb: 3,
                gap: 2
            }}>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    flexDirection: isMobile ? 'column' : 'row',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CheckInIcon />}
                            onClick={handleCheckInClick}
                            fullWidth={isMobile}
                            disabled={isLoggedIn}
                        >
                            {isLoggedIn ? 'In' : 'Check In'}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<ExitIcon />}
                            onClick={handleCheckOutClick}
                            fullWidth={isMobile}
                            disabled={isLoggedOut}
                        >
                            {isMobile ? 'Out' : 'Check Out'}
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Box sx={{
                backgroundColor: 'background.paper',
                p: 3,
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/** First Row */}
                    {[
                        {
                            icon: <BadgeIcon sx={{ fontSize: { xs: 28, sm: 34, md: 40 } }} />,
                            title: employeeData.name || '',
                            subtitle: employeeData.role.name,
                            noIconTitle: true,
                            bgColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        },
                        {
                            icon: <PersonIcon sx={{ fontSize: { xs: 28, sm: 34, md: 40 } }} />,
                            title: 'EMPLOYEE ID',
                            subtitle: employeeData.hrCode,
                            bgColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        },
                        {
                            icon: <CalendarTodayIcon sx={{ fontSize: { xs: 28, sm: 34, md: 40 } }} />,
                            title: 'JOINING DATE',
                            subtitle: employeeData.createdDate,
                            bgColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        },
                        {
                            icon: <WorkOutlineIcon sx={{ fontSize: { xs: 28, sm: 34, md: 40 } }} />,
                            title: 'DEPARTMENT',
                            subtitle: employeeData.department.name,
                            bgColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        },
                    ].map((item, idx) => (
                        <Grid item xs={12} sm={6} md={3} key={`card-1-${idx}`}>
                            <Card sx={{
                                height: '100%',
                                borderRadius: 3,
                                background: item.bgColor,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                }
                            }}>
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        minHeight: { xs: 100, sm: 100, md: 100 },
                                        p: { xs: 2, sm: 3 },
                                        '&:last-child': { pb: { xs: 2, sm: 3 } }
                                    }}
                                >
                                    {!item.noIconTitle && (
                                        <Box sx={{
                                            mr: { xs: 2, sm: 3 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: { xs: 48, sm: 56 },
                                            height: { xs: 48, sm: 56 },
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                            backdropFilter: 'blur(5px)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}>
                                            {React.cloneElement(item.icon, {
                                                sx: {
                                                    color: 'primary.dark',
                                                    fontSize: { xs: 28, sm: 34, md: 40 }
                                                }
                                            })}
                                        </Box>
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                textTransform: 'uppercase',
                                                fontFamily: 'Montserrat, sans-serif',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8125rem' },
                                                color: 'text.secondary',
                                                fontWeight: 600,
                                                letterSpacing: '0.5px',
                                                lineHeight: 1.2,
                                                mb: 1
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography
                                            variant={item.noIconTitle ? 'h5' : 'subtitle1'}
                                            sx={{
                                                textTransform: item.noIconTitle ? 'uppercase' : 'none',
                                                fontFamily: 'Montserrat, sans-serif',
                                                fontSize: item.noIconTitle
                                                    ? { xs: '1rem', sm: '1.2rem', md: '1.3rem' }
                                                    : { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
                                                fontWeight: 700,
                                                lineHeight: 1.3,
                                                color: 'text.primary',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {item.subtitle}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={2} sx={{ mb: 0 }}>
                    {[
                        {
                            icon: <AccessTimeIcon />,
                            title: 'Weekly Hours',
                            subtitle: employeeData.weeklyDuration,
                            unit: 'hrs',
                            bgColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        },
                        {
                            icon: <CalendarViewMonthIcon />,
                            title: 'Monthly Hours',
                            subtitle: employeeData.monthlyDuration,
                            unit: 'hrs',
                            bgColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        },
                        {
                            icon: <EventNoteIcon />,
                            title: 'Yearly Hours',
                            subtitle: employeeData.yearlyDuration,
                            unit: 'hrs',
                            bgColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        },
                        {
                            icon: <BeachAccessIcon />,
                            title: 'Leaves Taken',
                            subtitle: absentCount,
                            unit: 'days',
                            bgColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        },
                    ].map((item, idx) => (
                        <Grid item xs={12} sm={6} md={3} key={`card-2-${idx}`}>
                            <Card
                                sx={{
                                    height: '100%',
                                    borderRadius: 3,
                                    background: item.bgColor,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        // minHeight: { xs: 120, sm: 130, md: 140 },
                                        minHeight: { xs: 100, sm: 100, md: 100 },
                                        p: { xs: 2, sm: 3 },
                                        gap: 2
                                    }}
                                >
                                    {/* Icon Box on the Left */}
                                    <Box
                                        sx={{
                                            width: { xs: 48, sm: 56 },
                                            height: { xs: 48, sm: 56 },
                                            minWidth: { xs: 48, sm: 56 },
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                            backdropFilter: 'blur(5px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {React.cloneElement(item.icon, {
                                            sx: {
                                                fontSize: { xs: 28, sm: 32, md: 36 },
                                                color: 'secondary.dark'
                                            }
                                        })}
                                    </Box>

                                    {/* Text Content */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: 'Montserrat, sans-serif',
                                                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                                                color: 'text.secondary',
                                                fontWeight: 600,
                                                letterSpacing: '0.5px',
                                                mb: 0.5
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontFamily: 'Montserrat, sans-serif',
                                                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                                                    fontWeight: 800,
                                                    color: 'text.primary',
                                                    mr: 1
                                                }}
                                            >
                                                {item.subtitle}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: 'Montserrat, sans-serif',
                                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                                    color: 'text.secondary',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {item.unit}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: '30px',
                                                height: '3px',
                                                backgroundColor: 'primary.main',
                                                borderRadius: '2px',
                                                mt: 1,
                                                opacity: 0.8
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

            </Box>
            <Box
                sx={{
                    width: '100%',
                    '& .react-calendar': {
                        width: '100% !important',
                        maxWidth: '100% !important',
                        border: 'none',
                        fontFamily: 'inherit',
                    },
                    '& .react-calendar__month-view__days__day': {
                        border: '1px solid #ccc',
                        backgroundColor: '#f5eed5', // ✅ your custom light purple
                        height: 100,
                        width: 50,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                    },
                    '& .react-calendar__tile--now': {
                        backgroundColor: '#d6d6eb', // optional: slightly darker for today
                    },
                    '& .react-calendar__tile--active': {
                        backgroundColor: '#c2c2e0 !important', // optional: darker for selected date
                        color: '#000',
                    },
                    '& .react-calendar__month-view__weekdays__weekday': {
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        color: '#FFFFFF',
                        fontSize: '1.25rem',
                        border: '1px solid #ccc', // ✅ Border on each cell
                        height: 100,
                        width: 50,
                        backgroundColor: '#1A2B48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',

                    },
                    '& .react-calendar__month-view__weekdays__weekday abbr': {
                        textDecoration: 'none'
                    },
                    '@media (max-width: 600px)': {
                        '& .react-calendar__month-view__days__day': {
                            height: 50,
                        },
                    }
                }}
            >
                <Calendar
                    calendarType="gregory"
                    value={new Date(year, month)}
                    minDate={joiningDate}
                    onClickDay={(date) => {
                        const dateStr = date.toLocaleDateString('sv-SE');
                        // Check if the clicked date is a holiday
                        const isHoliday = holidays.some((h) => {
                            const holidayDate = new Date(h.date);
                            holidayDate.setHours(0, 0, 0, 0);
                            return holidayDate.getTime() === date.setHours(0, 0, 0, 0);
                        });
                        if (isHoliday) {
                            return; // Exit early if it's a holiday
                        }

                        const record = attendanceData.find((entry) => entry.date === dateStr);
                        if (record) {
                            setSelectedDateRecord(record);
                            setLeaveDetail(null);
                            setDialogOpen(true);
                            return;
                        }
                        // Check leave entry
                        const leaveEntry = leaveData.find((entry) =>
                            entry.status === 'APPROVED' &&
                            entry.daySelection.some((d) => d.date === dateStr)
                        );
                        if (leaveEntry) {
                            const dayObj = leaveEntry.daySelection.find((d) => d.date === dateStr);
                            setSelectedDateRecord(null); // no attendance
                            setLeaveDetail({
                                date: dateStr,
                                subject: leaveEntry.subject,
                                reason: leaveEntry.relatedReason,
                                type: dayObj?.type || 'Full',
                                approver: leaveEntry.notificationReceivedToName,
                                status: leaveEntry.status
                            });
                            setDialogOpen(true);
                            return;
                        }
                    }}
                    tileContent={({ date, view }) => {
                        if (view !== 'month' || date < joiningDate) return null;
                        const status = getAttendanceStatus(date);
                        const dateStr = new Date(date).toDateString();
                        const isLeaveDay = approvedLeaveDates.includes(dateStr);
                        let statusColor;
                        switch (status) {
                            case 'P':
                                statusColor = 'green';
                                break;
                            case 'AB':
                                statusColor = 'red';
                                break;
                            case 'HD':
                                statusColor = '#1f4182';
                                break;
                            default:
                                statusColor = 'gray';
                        }
                        // Match holidays
                        const normalizedDate = new Date(date);
                        normalizedDate.setHours(0, 0, 0, 0);
                        const holiday = holidays.find(h => {
                            const holidayDate = new Date(h.date);
                            holidayDate.setHours(0, 0, 0, 0);
                            return holidayDate.getTime() === normalizedDate.getTime();
                        });

                        return (
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                paddingTop: 5,
                            }}>
                                {holiday ? (
                                    <Chip
                                        label={holiday.name}
                                        size="small"
                                        style={{ backgroundColor: 'rgb(163, 36, 53)', color: 'white' }}
                                        title={holiday.name}
                                    />
                                ) : (
                                    <Chip
                                        label={isLeaveDay ? 'L' : (status || 'NA')}
                                        size="small"
                                        style={{
                                            backgroundColor: isLeaveDay ? '#ff9800' : statusColor,
                                            color: 'white',
                                        }}
                                    />
                                )}

                            </div>
                        );
                    }}
                />

            </Box>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: "#1976d2" }}>
                    Attendance Details
                </DialogTitle>
                <DialogContent dividers>
                    {selectedDateRecord ? (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} display="flex" alignItems="center">
                                    <EventIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="body1">
                                        <strong>Date:</strong> {dayjs(selectedDateRecord.date).format('DD MMM YYYY')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Chip
                                        label={selectedDateRecord.status}
                                        color={
                                            selectedDateRecord.status === 'P' ? 'success'
                                                : selectedDateRecord.status === 'AB' ? 'error'
                                                    : selectedDateRecord.status === 'LV' ? 'warning'
                                                        : 'default'
                                        }
                                        variant="filled"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Grid>
                                <Divider sx={{ width: '100%', my: 2 }} />
                                <Grid item xs={6} display="flex" alignItems="center">
                                    <LoginIcon color="action" sx={{ mr: 1 }} />
                                    <Typography>
                                        <strong>Login:</strong> {selectedDateRecord.loginTime ? dayjs(selectedDateRecord.loginTime).format('hh:mm A') : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} display="flex" alignItems="center">
                                    <LogoutIcon color="action" sx={{ mr: 1 }} />
                                    <Typography>
                                        <strong>Logout:</strong> {selectedDateRecord.logoutTime ? dayjs(selectedDateRecord.logoutTime).format('hh:mm A') : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} display="flex" alignItems="center">
                                    <AccessTimeIcon color="secondary" sx={{ mr: 1 }} />
                                    <Typography>
                                        <strong>Worked Duration:</strong> {selectedDateRecord.totalWorkedDurationMinutes} mins
                                    </Typography>
                                </Grid>
                                <Divider sx={{ width: '100%', my: 2 }} />
                                <Grid item xs={6}>
                                    <Typography><strong>Early Login:</strong> {selectedDateRecord.isEarlyLogin ? <DoneIcon color="success" /> : <CloseIcon color="error" />}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography><strong>Late Login:</strong> {selectedDateRecord.isLateLogin ? <DoneIcon color="error" /> : <CloseIcon color="success" />}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography><strong>Early Logout:</strong> {selectedDateRecord.isEarlyLogout ? <DoneIcon color="warning" /> : <CloseIcon color="success" />}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography><strong>Late Logout:</strong> {selectedDateRecord.isLateLogout ? <DoneIcon color="info" /> : <CloseIcon color="disabled" />}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : leaveDetail ? (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} display="flex" alignItems="center">
                                    <EventIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="body1">
                                        <strong>DATE:</strong> {dayjs(leaveDetail.date).format('DD MMM YYYY')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Chip label="LEAVE" color="warning" sx={{ fontWeight: 'bold' }} />
                                </Grid>
                                <Divider sx={{ width: '100%', my: 2 }} />
                                <Grid item xs={6}>
                                    <Typography><strong>SUBJECT:</strong> {leaveDetail.subject.toUpperCase()}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography><strong>REASON:</strong> {leaveDetail.reason.toUpperCase()}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography><strong>TYPE:</strong> {leaveDetail.type.toUpperCase()}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Typography>No data available for this date.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} variant="contained" color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );


};

export default AttendanceTab;
