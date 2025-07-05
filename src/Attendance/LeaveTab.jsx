import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider, Stack,
  CircularProgress,
} from "@mui/material";
import axios from "../Axiosinstance";
import AssignmentIcon from '@mui/icons-material/Assignment';
import NoDataPage from "../Nodatapage";

const tabEndpoints = [
  { label: "Approved", url: "/approval-process/approved" },
  { label: "Pending", url: "/approval-process/pending" },
  { label: "Rejected", url: "/approval-process/rejected" },
];

export default function ApprovalStatusTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (e, val) => setActiveTab(val);
  const fetchData = async (tabIndex) => {
    setLoading(true);
    try {
      const response = await axios.get(tabEndpoints[tabIndex].url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching approval data:", error);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const renderTableHeader = () => (
    <TableRow>
      <TableCell align="center" >S.NO</TableCell>
      <TableCell align="center" >Subject</TableCell>
      <TableCell align="center">Reason</TableCell>
      <TableCell align="center">Assigned No</TableCell>
      <TableCell align="center">Receiver</TableCell>
      <TableCell align="center">Email</TableCell>
      <TableCell align="center">Staff Name</TableCell>
      <TableCell align="center">Staff Email</TableCell>
    </TableRow>
  );

  const renderTableBody = () => {
    if (!loading && data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center">
           <NoDataPage />
          </TableCell>
        </TableRow>
      );
    }

    return data.map((row,index) => (
      <TableRow key={row.id}>
        <TableCell align="center">{index+1}</TableCell>
        <TableCell align="center">{row.subject}</TableCell>
        <TableCell align="center">{row.relatedReason}</TableCell>
        <TableCell align="center">{row.maximumNumberToAssign}</TableCell>
        <TableCell align="center">{row.notificationReceivedToName}</TableCell>
        <TableCell align="center">{row.receivedPersonEmail}</TableCell>
        <TableCell align="center">{row.leaveAppliedStaffName}</TableCell>
        <TableCell align="center">{row.leaveAppliedStaffEmail}</TableCell>
      </TableRow>
    ));
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Stack direction="row" alignItems="center" mb={2} spacing={1.5}>
        <AssignmentIcon sx={{
          fontSize: 36,

          background: 'rgba(25, 118, 210, 0.1)',
          borderRadius: '50%',
          p: 1
        }} />
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Approval Process Status
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
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
          // borderRadius: '12px',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#142a4f',
            // borderRadius: '8px',
            padding: '6px 18px',
            // margin: '0 8px',
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
        {tabEndpoints.map((tab, idx) => (
          <Tab key={idx} label={tab.label} />
        ))}
      </Tabs>

      <Box mt={2}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table
              stickyHeader
              size="small"
              sx={{
                minWidth: 800,
                '& .MuiTableCell-root': {
                  border: '1px solid rgba(224, 224, 224, 1)',
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                },
                '& .MuiTableCell-head': {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                },
              }}
            >
              <TableHead
                sx={{
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  textTransform: 'uppercase',
                  fontFamily: 'Marquis',
                }}
              >
                {renderTableHeader()}
              </TableHead>
              <TableBody
                sx={{
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  textTransform: 'uppercase',
                  fontFamily: 'Marquis',
                }}
              >
                {renderTableBody()}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
}
