import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  TableCell,
  Paper,
  LinearProgress,
  Avatar,
  useTheme,
  styled,
  alpha,
  tableCellClasses,
} from '@mui/material';
import {
  People,
  Inventory,
  Construction,
  School,
  Leaderboard,
  Business,
  Group,
  Lock,
} from '@mui/icons-material';
import Notifications from "./Notifications/UserCreatedNotification";
import Leave from "./Attendance/LeaveManagement";
import Staff from "./HrmStaff/Staff";
import Contract from "./Contract/Contract";
import Shift from "./Attendance/Shift";
import Insurance from './HrmInsurance/Insurance';
import Department from "./Department/Department";
import Role from "./Role";

const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(
    theme.palette.primary.dark,
    0.9
  )} 100%)`,
  color: theme.palette.common.white,
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.secondary.main,
    height: 4,
    borderRadius: '2px',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'capitalize',
  fontSize: '1rem',
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const dashboardCards = [
  { title: 'Staff', count: 45, icon: <People />, tagline: 'Total employees' },
  { title: 'Product', count: 189, icon: <Inventory />, tagline: 'Available items' },
  { title: 'Material', count: 324, icon: <Construction />, tagline: 'Raw materials' },
  { title: 'Teacher', count: 32, icon: <School />, tagline: 'Teaching staff' },
  { title: 'Leads', count: 67, icon: <Leaderboard />, tagline: 'Potential clients' },
  { title: 'Departments', count: 12, icon: <Business />, tagline: 'Active departments' },
  { title: 'Customers', count: 245, icon: <Group />, tagline: 'Registered clients' },
  { title: 'Role', count: 8, icon: <Lock />, tagline: 'User roles' },
];

const tableHeaders = ['Staff', 'Role', 'Contract', 'Insurance', 'Department'];


const productsProgress = [
  { name: 'Laptops', progress: 75 },
  { name: 'Phones', progress: 60 },
  { name: 'Accessories', progress: 90 },
];


const dummyTableData = [
  [
    { id: 1, name: 'John Doe', role: 'Developer', department: 'IT' },
    { id: 2, name: 'Jane Smith', role: 'Manager', department: 'HR' },
  ],
  [
    { id: 1, product: 'Chair', stock: 45, price: '$120', status: 'In Stock' },
    { id: 2, product: 'Table', stock: 23, price: '$250', status: 'Low Stock' },
  ],
  [
    { id: 1, lead: 'ABC Corp', status: 'Contacted', value: '$5000' },
    { id: 2, lead: 'XYZ Ltd', status: 'New', value: '$2500' },
  ],
];

export default function Dashboard() {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1600, margin: '0 auto' }}>
      {/* Cards Section */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          color: theme.palette.primary.main,
          mb: 4,
          position: 'relative',
          '&:after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            backgroundColor: theme.palette.secondary.main,
            position: 'absolute',
            bottom: '-8px',
            left: 0
          }
        }}
      >
        DASHBOARD

      </Typography>
      <Grid container spacing={3}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <DashboardCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2) }}>
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {card.count}
                  </Typography>
                  <Typography variant="subtitle1">{card.title}</Typography>
                  <Typography variant="caption">{card.tagline}</Typography>
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>
        ))}
      </Grid>


      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            color: theme.palette.primary.main,
            mb: 4,
            position: 'relative',
            '&:after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: theme.palette.secondary.main,
              position: 'absolute',
              bottom: '-8px',
              left: 0,
            },
          }}
        >
          Overview
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {tableHeaders.map((header, index) => (
            <Tab label={header} key={index} />
          ))}
        </Tabs>
        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: theme.shadows[1],
            mt: 2,
            p: 2,
          }}
        >
          {tabValue === 0 && <Staff />}
          {tabValue === 1 && <Role />}
          {tabValue === 2 && <Contract />}
          {tabValue === 3 && <Insurance />}
          {tabValue === 4 && <Department />}
        </Paper>
      </Box>

      <br />
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          color: theme.palette.primary.main,
          mb: 4,
          position: 'relative',
          '&:after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            backgroundColor: theme.palette.secondary.main,
            position: 'absolute',
            bottom: '-8px',
            left: 0
          }
        }}
      >
        PROJECTS

      </Typography>
      {/* Progress and Notifications */}
      <Grid container spacing={3}>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Product Progress
            </Typography>
            {productsProgress.map((product, index) => (
              <Box key={index} mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={product.progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          height: {
            xs: '80PX',        // auto height on small screens
            sm: '100px',       // 400px height on small-medium screens
            md: '250px',       // 500px on medium and up
          },
          overflowY: 'auto',    // vertical scroll if content overflows
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={2}>
          Notifications
        </Typography>
        <Notifications />
      </Paper>
    </Grid>
      </Grid>
      <br />    <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          color: theme.palette.primary.main,
          mb: 4,
          position: 'relative',
          '&:after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            backgroundColor: theme.palette.secondary.main,
            position: 'absolute',
            bottom: '-8px',
            left: 0
          }
        }}
      >
        LEAVE MANAGEMENT

      </Typography>
      <Grid sx={{ mt: 1 }}>
   <Leave />
      </Grid>
    </Box>
  );
}