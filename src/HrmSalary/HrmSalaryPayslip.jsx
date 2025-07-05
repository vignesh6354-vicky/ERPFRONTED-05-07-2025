import React, { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableRow, TableCell,
  Divider, Box, CircularProgress, Alert, Button, FormControl, InputLabel,
  Select, useTheme, Tab, MenuItem, TableHead, useMediaQuery, Tabs,
  Container, Paper
} from "@mui/material";
import axios from '../Axiosinstance';
import Nodatapage from "../Nodatapage";
import DownloadIcon from '@mui/icons-material/Download';

const Payslip = () => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filtered staff list based on role and department
  const filteredStaff = allStaff.filter(
    (s) =>
      (!selectedRole || s.roleName === selectedRole) &&
      (!selectedDept || s.departmentName === selectedDept)
  );

  // Load roles, departments, and staff list
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [staffRes, deptRes, roleRes] = await Promise.all([
        axios.get("/staff/allstaffs"),
        axios.get("/departments/all-departments"),
        axios.get("/roles/all"),
      ]);
      setAllStaff(staffRes.data);
      setDepartments(deptRes.data);
      setRoles(roleRes.data);
    } catch (err) {
      setError("Failed to load filter data.");
    }
  };

  // Load payslip when a staff is selected
  useEffect(() => {
    if (selectedStaff) {
      fetchPayslip(selectedStaff);
    }
  }, [selectedStaff]);

  const fetchPayslip = async (staffId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/payslip/staff/${staffId}`);
      if (res.data.length > 0) {
        setPayslip(res.data[0]);
      } else {
        setPayslip(null);
        setError("No payslip data found.");
      }
    } catch (err) {
      setError("Failed to fetch payslip. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!payslip?.id) return;
    setDownloading(true);
    try {
      const response = await axios.get(`/payslip/payslip/${payslip.id}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payslip-${payslip.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };
  const handleTabChange = (e, val) => setActiveTab(val);
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
        <Tab label="SALARY PAYSLIP" />
      </Tabs>
      <Container
        maxWidth={false}
        sx={{
          backgroundColor: 'white',
          py: 4,
          px: isMobile ? 2 : 4,
          minHeight: '100vh'
        }}
      >
        {/* Filters */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 1,
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <FormControl size="medium" sx={{ minWidth: 200, flex: 1 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSelectedStaff("");
              }}
            >
              {/* <MenuItem value=""></MenuItem> */}
              {roles.map((role) => (
                <MenuItem key={role.roleId} value={role.roleName}>
                  {role.roleName.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="medium" sx={{ minWidth: 200, flex: 1 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDept}
              label="Department"
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedStaff("");
              }}
            >
              {/* <MenuItem value=""></MenuItem> */}
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.name}>
                  {dept.name.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="medium" sx={{ minWidth: 200, flex: 1 }}>
            <InputLabel>Staff</InputLabel>
            <Select
              value={selectedStaff}
              label="Staff"
              onChange={(e) => setSelectedStaff(e.target.value)}
            >
              {/* <MenuItem value=""></MenuItem> */}
              {filteredStaff.map((staff) => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.name.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box width="100%" mt={3}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Payslip */}
        {payslip && !loading && (
          <Card
            sx={{
              width: '100%',
              mx: 'auto',
              my: 4,
              borderRadius: 3,
              boxShadow: 4,
              overflowX: 'auto'
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="center" mb={isMobile ? 1 : 0}>
                <Typography variant="h5" fontWeight={600}>
                  PAYSLIP SUMMARY
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table
                  sx={{
                    minWidth: isMobile ? 600 : '100%',
                    borderCollapse: 'collapse',
                    '& .MuiTableCell-root': {
                      border: '1px solid rgba(224, 224, 224, 1)',
                      padding: isMobile ? '8px' : '16px'
                    }
                  }}
                >
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell align="center"><strong>S.NO</strong></TableCell>
                      <TableCell align="center"><strong>ROLE</strong></TableCell>
                      <TableCell align="center"><strong>DEPARTMENT</strong></TableCell>
                      <TableCell align="center"><strong>STAFF</strong></TableCell>
                      <TableCell align="center"><strong>NET SALARY</strong></TableCell>
                      <TableCell align="center"><strong>GROSS</strong></TableCell>
                      <TableCell align="center"><strong>LOP DAYS</strong></TableCell>
                      <TableCell align="center"><strong>ACTIONS</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStaff && payslip ? (
                      [payslip].map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="center">{selectedRole.toUpperCase() || '-'}</TableCell>
                          <TableCell align="center">{selectedDept.toUpperCase() || '-'}</TableCell>
                          <TableCell align="center">
                            {allStaff.find((s) => s.id === selectedStaff)?.name.toUpperCase() || '-'}
                          </TableCell>
                          <TableCell align="center">₹{item.netSalary.toFixed(2)}</TableCell>
                          <TableCell align="center">₹{item.grossSalary.toFixed(2)}</TableCell>
                          <TableCell align="center">{item.lopDays}</TableCell>
                          <TableCell align="center">
                            {/* download button style */}
                            <Button
                              variant="contained"
                              size="small"
                              onClick={handleDownload}
                              disabled={downloading}
                              fullWidth={isMobile}
                              sx={{
                                background: 'linear-gradient(45deg, #1e88e5,rgb(63, 115, 156))',
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                textTransform: 'uppercase',
                                '&.Mui-disabled': {
                                  color: 'white', 
                                  background: 'linear-gradient(45deg, #1e88e5,rgb(63, 115, 156))', 
                                },
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #1565c0, #1e88e5)',
                                },
                              }}
                              startIcon={!isMobile && !downloading ? <DownloadIcon /> : null}
                            >
                              {downloading ? 'Please wait…' : 'Download'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Nodatapage />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>

    </>
  );
};

export default Payslip;