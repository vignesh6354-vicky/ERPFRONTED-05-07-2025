import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import Home from "./Home";
import ForgotPasswordPage from "./ForgotPassword/ForgotPasswordPage.jsx";
import SideNav from "./SideNav";
import LiderErp from "./LiderErp";
import Lider from "./Lider";
import LiderService from "./LiderService";
import PrivateRoute from "./PrivateRoute";
import ScrollToTop from './Constants/ScrollToTop.jsx';
import Staff from "./HrmStaff/Staff.jsx"; // Import your EmployeeTable component
import EditStaff from "./HrmStaff/EditStaff.jsx"; // Create this new component
import ContractModal from "./Contract/ContractModal";
import RolePermission from "./RolePermission"; // Add this import
import Role from "./Role"; // Add this import if not already present
import RoleEdit from "./RoleEdit.jsx";
import Timesheet from "./Attendance/Timesheet.jsx";
import { NotificationProvider } from './Constants/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {NetworkStatusProvider} from './Network/NetworkStatusContext';
import NetworkStatusFallBackPage from './Network/NetworkStatusFallBackPage'; // Import the fallback page component
import { UserProvider } from './Contexts/Usercontext.jsx';
import Profile from "./Profile/Profile.jsx";
import Liderproduct from "./Liderproduct.jsx";
import { HolidayProvider } from './Contexts/HolidayContext';
import Newsletter from "./Newsletter.jsx"

function App() {
  return (
    <NetworkStatusProvider>
    <NotificationProvider>
      <UserProvider>
        <HolidayProvider>
    <Router>
      <ScrollToTop />
      <NetworkStatusFallBackPage /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/Lider" element={<Lider />} />
        <Route path="/lider-service" element={<LiderService />} />
       <Route path="/Liderproduct" element={<Liderproduct />} />
       <Route path="/Staff" element={<Staff />} />
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/SideNav" element={<SideNav />} />
          <Route path="/employees" element={<Staff />} />
          <Route path="/staff/edit/:id" element={<EditStaff />} />
          {/* <Route path="/edit-contract/:id" element={<ContractModal />} /> */}
          <Route path="/roles" element={<Role />} /> {/* Add this line */}
          <Route path="/role-permission" element={<RolePermission />} />
          <Route path="/roles/edit/:id" element={<RoleEdit />} />  
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/Profile" element={<Profile />} />
        </Route>
        <Route path="/About/LiderErp" element={<LiderErp />} />
        <Route path="/about-us/lider" element={<Lider />} />
          <Route path="/Newsletter" element={<Newsletter />} />

      </Routes>
      <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
       
    </Router>
     </HolidayProvider>
    </UserProvider>
    </NotificationProvider>
    </NetworkStatusProvider>
  );
}

export default App;
