import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Grid,
  createTheme,
  ThemeProvider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  AccountCircle,
  Edit,
  Delete,
  CloudUpload,
} from "@mui/icons-material";
import { Save, Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import RolePermission from '../RolePermission';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import { fontFamily } from '@mui/system';


const theme = createTheme({
  typography: {
    fontFamily: '"Marquis"',
  },
});

const Newstaff = ({ onAddStaff, setActiveTab }) => {
  const [profileData, setProfileData] = useState({
    hrCode: '',
    name: '',
    email: '',
    password: '',
    Gender: '',
    birthday: '',
    birthplace: '',
    homeTown: '',
    maritalStatus: '',
    nation: '',
    identification: '',
    daysForIdentity: '',
    placeOfIssue: '',
    resident: '',
    currentAddress: '',
    literacy: '',
    status: '',
    jobPosition: '',
    workplace: '',
    Role: '',
    // bankAccount: '',
    // accountName: '',
    // bankOfIssue: '',
    // personalTaxCode: '',
    // hourlyRate: '',
    phone: '',
    department: '',
    pancard: ''
  });

  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState({
    departments: true,
    roles: true,
    jobPositions: true,
    workplaces: true
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await axios.get('/departments/all-departments');
        setDepartments(deptResponse.data);

        // Fetch roles
        const rolesResponse = await axios.get('/roles/get-all-role-names');
        setRoles(rolesResponse.data);

        // Fetch job positions
        const jobPositionsResponse = await axios.get('/job-positions');
        setJobPositions(jobPositionsResponse.data);

        // Fetch workplaces
        const workplacesResponse = await axios.get('/work-places');
        setWorkplaces(workplacesResponse.data);

        setLoading({
          departments: false,
          roles: false,
          jobPositions: false,
          workplaces: false
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data. Please try again.');
        setLoading({
          departments: false,
          roles: false,
          jobPositions: false,
          workplaces: false
        });
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!profileData.hrCode || !profileData.name || !profileData.email || !profileData.password) {
        throw new Error('Please fill all required fields');
      }

      // Validate numeric fields
      if (profileData.daysForIdentity && isNaN(profileData.daysForIdentity)) {
        throw new Error('Days for Identity must be a number');
      }

      if (profileData.hourlyRate && isNaN(profileData.hourlyRate)) {
        throw new Error('Hourly Rate must be a number');
      }

      // Format data according to API requirements
      const formattedData = {
        hrCode: profileData.hrCode.toUpperCase(),
        name: profileData.name.toUpperCase(),
        email: profileData.email,
        password: profileData.password,
        gender: profileData.Gender,
        birthday: profileData.birthday,
        birthplace: profileData.birthplace,
        homeTown: profileData.homeTown,
        maritalStatus: profileData.maritalStatus,
        nation: profileData.nation,
        identification: profileData.identification,
        daysForIdentity: profileData.daysForIdentity ? parseInt(profileData.daysForIdentity) : null,
        placeOfIssue: profileData.placeOfIssue,
        resident: profileData.resident,
        currentAddress: profileData.currentAddress,
        literacy: profileData.literacy,
        status: profileData.status,
        jobPosition: profileData.jobPosition,
        workplace: profileData.workplace,
        role: {
          id: profileData.Role.roleId || null,
        },
        // bankAccount: profileData.bankAccount,
        // nameOfAccount: profileData.accountName,
        // bankOfIssue: profileData.bankOfIssue,
        // personalTaxCode: profileData.personalTaxCode,
        // hourlyRate: profileData.hourlyRate ? parseFloat(profileData.hourlyRate) : null,
        phone: profileData.phone,
        department: {
          id: departments.find(d => d.name === profileData.department)?.id || null,
          name: profileData.department
        },
        pancard: profileData.pancard.toUpperCase()
      };

      console.log('Submitting data:', formattedData);

      const response = await axios.post('/staff', formattedData);

      toast.success('Staff created successfully!');

      onAddStaff?.(response.data);
      setActiveTab(0);
    } catch (err) {
      console.error('Submission error:', err);

      let errorMessage = 'Failed to save staff';
      if (err.response) {
        const details = err.response.data?.details;

        errorMessage = Array.isArray(details)
          ? details.join(', ')
          : details || err.response.data?.message || err.response.data?.error ||
          `Server error: ${err.response.status}`;

        console.error('Server error details:', err.response.data);
      }
      else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;

  //   // For numeric fields, prevent non-numeric input
  //   if (name === 'daysForIdentity' || name === 'hourlyRate') {
  //     if (value && isNaN(value)) return; // Don't update if not a number
  //   }

  //   setProfileData({
  //     ...profileData,
  //     [name]: type === 'checkbox' ? checked : value,
  //   });
  // };

  // const handleChange = async (e) => {
  //   const { name, value, type, checked } = e.target;

  //   // Handle Role selection
  //   if (name === 'Role') {
  //     try {
  //       // Fetch the selected role data from the API
  //       const { data } = await axios.get(`/roles/${value}`);
  //       const selectedRole = data.role;

  //       // Update the profile data with the selected role and its permissions
  //       setProfileData({
  //         ...profileData,
  //         Role: {
  //           roleId: selectedRole.roleId,
  //           name: selectedRole.name,
  //           featurePermissions: selectedRole.featurePermissions || [],
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error fetching role details:', error);
  //     }
  //     return;
  //   }

  //   // Handle numeric fields (daysForIdentity, hourlyRate) and other fields
  //   if ((name === 'daysForIdentity' || name === 'hourlyRate') && value !== '') {
  //     if (isNaN(value)) return;
  //   }

  //   setProfileData({
  //     ...profileData,
  //     [name]: type === 'checkbox' ? checked : value,
  //   });

  //   if (error[name]) {
  //     setError((prev) => ({ ...prev, [name]: '' }));
  //   }
  // };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProfileData((prevData) => {
      let newValue = type === 'checkbox' ? checked : value;

      // Handle numeric fields
      if ((name === 'daysForIdentity' || name === 'hourlyRate') && value !== '') {
        if (isNaN(value)) return prevData;
      }

      // Handle Role selection (trigger async fetch separately)
      if (name === 'Role') {
        fetchAndSetRoleDetails(value); // async fetch
        return prevData; // don't update immediately, update happens in fetch
      }

      if (name === 'jobPosition') {
        return {
          ...prevData,
          jobPosition: newValue, // This is the selected position ID
        };
      }


      return {
        ...prevData,
        [name]: newValue,
      };
    });
  };


  const fetchAndSetRoleDetails = async (roleName) => {
    try {
      const { data } = await axios.get(`/roles/${roleName}`);
      const selectedRole = data.role;

      setProfileData((prevData) => ({
        ...prevData,
        Role: {
          roleId: selectedRole.roleId,
          name: selectedRole.name,
          featurePermissions: selectedRole.featurePermissions || [],
        }
      }));
    } catch (error) {
      console.error('Error fetching role details:', error);
    }
  };

  const handleOpenRoleModal = (e) => {
    e.stopPropagation();
    setOpenRoleModal(true);
  };

  const handleCancel = () => {
    setActiveTab(0);
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      // Replace with actual backend endpoint
      await axios.post('/staff/verifyMail', { email: profileData.email });
      setOtpSent(true);
      toast.success("OTP send successfully in your Gmail");
      setLoading(false);
    } catch (err) {
      setEmailError(err?.response?.data?.details || err?.response?.data?.message || 'Failed to Fetch Email');
      setLoading(false);
    }
  };
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/staff/verifyOtp', {
        email: profileData.email,
        otp,
      });

      if (response.status == 200) {
        setOtpVerified(true);
        toast.success("email verified successfully");
        setOtpError('');
      } else {
        setOtpVerified(false);
        setOtpError(response.data.details || response.data.message);
        toast.warning("OTP already verified.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Optional: Check if it's an image (still safe to keep)
    if (!file.type.match('image.*')) {
      setImageError('Only image files are allowed');
      return;
    }

    setImageError('');
    setProfileImage(file);
  };


  const handleRemoveImage = () => {
    setProfileImage(null);
  };
  return (
    <ThemeProvider theme={theme}>
      <Paper style={{ padding: '16px', fontFamily: theme.typography.fontFamily }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Profile Picture Upload */}
            <Grid item xs={12}>
              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                alignItems="center"
                gap={3}
                mb={2}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 120, sm: 150 },
                    height: { xs: 120, sm: 150 },
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid ${theme.palette.primary.main}`,
                    backgroundColor: theme.palette.grey[200]
                  }}
                >
                  {profileImage ? (
                    <img
                      src={typeof profileImage === 'string' ? profileImage : URL.createObjectURL(profileImage)}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <AccountCircle sx={{ fontSize: 80, color: theme.palette.grey[500] }} />
                    </Box>
                  )}

                  {/* Edit overlay */}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-picture-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="profile-picture-upload">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                          backgroundColor: theme.palette.grey[300]
                        }
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </label>
                </Box>

                <Box flex={1} width="100%">
                  <Typography variant="h6" gutterBottom>
                    PROFILE PICTURE
                  </Typography>
                  {/* <Typography variant="body2" color="textSecondary" gutterBottom>
                Upload a clear photo of yourself (max 2MB)
              </Typography> */}
                  <Box display="flex" gap={1} mt={3} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      component="label"
                      htmlFor="profile-picture-upload"
                      startIcon={<CloudUpload />}
                      size="small"
                    >
                      Upload
                      <input
                        accept="image/*"
                        hidden
                        id="profile-picture-upload"
                        type="file"
                        onChange={handleImageUpload}
                      />
                    </Button>
                    {profileImage && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleRemoveImage}
                        startIcon={<Delete />}
                        size="small"
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  {imageError && (
                    <Typography color="error" variant="body2" mt={1}>
                      {imageError}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>PERSONAL INFORMATION</Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profileData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only letters (uppercase, lowercase) and spaces, up to 40 characters
                  if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 40) {
                    handleChange(e);
                  }
                }}
                required
                placeholder="Enter full name (e.g. John)"
                error={profileData.name.length > 0 && profileData.name.length < 3}
                helperText={
                  profileData.name.length > 0 && profileData.name.length < 3
                    ? 'Name must be at least 3 characters'
                    : ''
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="HR Code"
                name="hrCode"
                value={profileData.hrCode}
                onChange={(e) => {
                  const input = e.target.value.toUpperCase();

                  // Allow typing only alphanumeric and up to 7 characters
                  if (input.length <= 7 && /^[A-Z0-9]*$/.test(input)) {
                    handleChange({ target: { name: 'hrCode', value: input } });
                  }
                }}
                required
                placeholder="Enter HR Code (e.g. HR12345)"
                error={
                  profileData.hrCode.length === 7 &&
                  !/^[A-Z]{2}[0-9]{5}$/.test(profileData.hrCode)
                }
                helperText={
                  profileData.hrCode.length === 7 &&
                    !/^[A-Z]{2}[0-9]{5}$/.test(profileData.hrCode)
                    ? 'HR Code must be 2 letters followed by 5 digits (e.g. HR12345)'
                    : ''
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                type="email"
                required
                placeholder="Enter email (e.g. Example@gmail.com)"
                error={!!emailError}
                helperText={emailError}
              />
              <Button
                variant="contained"
                onClick={handleSendOtp}
                disabled={emailError || !profileData.email || otpSent}
                sx={{ mt: 1 }}
              >
                {otpSent ? 'OTP Sent' : 'Send OTP'}
              </Button>
            </Grid>

            {otpSent && (
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  error={!!otpError}
                  helperText={otpError}
                />
                <Button
                  variant="outlined"
                  onClick={handleVerifyOtp}
                  disabled={!otp}
                  sx={{ mt: 1 }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                {otpVerified && (
                  <Typography sx={{ mt: 1 }} color="success.main">
                    ✅ Email Verified Successfully!
                  </Typography>
                )}
              </Grid>
            )}


            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                value={profileData.password}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow passwords between 0 and 15 characters
                  if (value.length <= 15) {
                    handleChange(e);
                  }
                }}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                error={profileData.password.length > 0 && profileData.password.length < 5}
                helperText={
                  profileData.password.length > 0 && profileData.password.length < 5
                    ? 'Password must be at least 5 characters'
                    : ''
                }
                inputProps={{ maxLength: 15 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Gender "
                name="Gender"
                value={profileData.Gender}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {['Male', 'Female', 'Other'].map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {['birthday', 'birthplace', 'homeTown', 'nation'].map((field) => (
              <Grid item xs={6} key={field}>
                <TextField
                  fullWidth
                  label={field.split(/(?=[A-Z])/).join(' ').replace(/^./, (c) => c.toUpperCase())}
                  name={field}
                  type={field.toLowerCase() === 'birthday' ? 'date' : 'text'}
                  InputLabelProps={field.toLowerCase() === 'birthday' ? { shrink: true } : {}}
                  value={profileData[field]}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (field === 'birthday') {
                      handleChange(e);
                    } else {
                      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                      handleChange({ target: { name: field, value: lettersOnly } });
                    }
                  }}
                  placeholder={
                    field === 'birthplace'
                      ? 'Enter place of birth (e.g. Chennai)'
                      : field === 'homeTown'
                        ? 'Enter hometown (e.g. Coimbatore)'
                        : field === 'nation'
                          ? 'Enter nationality (e.g. Indian)'
                          : ''
                  }
                  inputProps={{
                    maxLength: 50,
                  }}
                  sx={{
                    '& input::placeholder': {
                      fontSize: '0.9rem',
                      color: '#000',
                    },
                  }}
                />
              </Grid>
            ))}

            {/* Marital Status as Dropdown */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  name="maritalStatus"
                  value={profileData.maritalStatus || ''}
                  onChange={handleChange}
                  label="Marital Status"
                >
                  <MenuItem value="Single">{"Single".toUpperCase()}</MenuItem>
                  <MenuItem value="Married">{"Married".toUpperCase()}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Identification */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>IDENTIFICATION</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Identification"
                name="identification"
                value={profileData.identification}
                onChange={handleChange}
                placeholder="Enter ID number (e.g. Aadhar, PAN)"
                inputProps={{
                  maxLength: 50, // optional character limit
                  placeholder: 'Enter ID Number (e.g. Aadhar, PAN)',
                }}
                sx={{
                  '& input::placeholder': {
                    fontSize: '0.9rem',
                    color: '#000',
                  },
                }}
              />
            </Grid>
            {/* <Grid item xs={6}>
              <TextField
                fullWidth
                label="Days For Identity"
                name="daysForIdentity"
                value={profileData.daysForIdentity}
                onChange={handleChange}
                type="number"
                inputProps={{
                  min: 0,
                  placeholder: 'Enter Number Of Days (e.g. 30)',
                }}
                sx={{
                  '& input::placeholder': {
                    fontSize: '0.9rem',
                    color: '#000',
                  },
                }}
              />
            </Grid> */}
            {['resident', 'currentAddress'].map((field) => (
              <Grid item xs={field === 'currentAddress' ? 12 : 6} key={field}>
                <TextField
                  fullWidth
                  label={field.split(/(?=[A-Z])/).join(' ').replace(/^./, (c) => c.toUpperCase())}
                  name={field}
                  value={profileData[field]}
                  onChange={(e) => {
                    let value = e.target.value;

                    if (field === 'resident') {
                      // Allow only letters and spaces, and max 50 characters
                      value = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                    }

                    handleChange({ target: { name: field, value } });
                  }}
                  multiline={field === 'currentAddress'}
                  rows={field === 'currentAddress' ? 3 : 1}
                  placeholder={
                    field === 'resident'
                      ? 'Enter Resident Status (e.g. Indian, NRI)'
                      : 'Enter Current Address'
                  }
                  inputProps={{
                    maxLength: field === 'currentAddress' ? 300 : 50,
                  }}
                  sx={{
                    '& input::placeholder, & textarea::placeholder': {
                      fontSize: '0.9rem',
                      color: '#000',
                    },
                  }}
                />
              </Grid>
            ))}


            {/* Job Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>JOB INFORMATION</Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Literacy"
                name="literacy"
                placeholder="Enter Literacy (e.g. Graduate, Diploma)"
                value={profileData.literacy}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  if (onlyLetters.length <= 50) {
                    handleChange({ target: { name: 'literacy', value: onlyLetters } });
                  }
                }}
                inputProps={{
                  maxLength: 50,
                }}
                sx={{
                  '& input::placeholder': {
                    fontSize: '0.9rem',
                    color: '#000',
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="status">Status</InputLabel>
                <Select
                  labelId="status"
                  name="status"
                  value={profileData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {['Active', 'Inactive'].map(status => (
                    <MenuItem key={status} value={status}> {status.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Job Position Dropdown */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Job Position</InputLabel>
                <Select
                  name="jobPosition"
                  value={profileData.jobPosition || ''}
                  onChange={handleChange}
                  label="Job Position"
                  disabled={loading.jobPositions}
                >
                  {loading.jobPositions ? (
                    <MenuItem value="">Loading job positions...</MenuItem>
                  ) : (
                    jobPositions.map((position) => (
                      <MenuItem key={position.id} value={position.name}>{position.name}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Workplace Dropdown */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Workplace</InputLabel>
                <Select
                  name="workplace"
                  value={profileData.workplace}
                  onChange={handleChange}
                  label="Workplace"
                  disabled={loading.workplaces}
                >
                  {loading.workplaces ? (
                    <MenuItem value="">Loading workplaces...</MenuItem>
                  ) : (
                    workplaces.map((place) => (
                      <MenuItem key={place.id} value={place.name}>{place.name}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={10}>
                  <FormControl fullWidth>
                    <InputLabel>Role *</InputLabel>
                    <Select
                      name="Role"
                      value={profileData.Role?.roleId || ''}
                      onChange={handleChange}
                      label="Role"
                      disabled={loading.roles}
                      required
                    >
                      {loading.roles ? (
                        <MenuItem value="">Loading roles...</MenuItem>
                      ) : (
                        roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <Button variant="outlined" onClick={handleOpenRoleModal} style={{ height: '56px' }}>
                    Show Permissions
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Bank Information */}
            {/* <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>BANK INFORMATION</Typography>
            </Grid> */}

            {/* <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bank Account"
                name="bankAccount"
                value={profileData.bankAccount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers
                  if (/^\d*$/.test(value) && value.length <= 18) {
                    handleChange({ target: { name: 'bankAccount', value } });
                  }
                }}
                inputProps={{
                  inputMode: 'numeric',
                  maxLength: 18, // limits typing to 18 digits
                }}
                placeholder="Enter Account Number (e.g. 123456789)"
                sx={{
                  '& input::placeholder': {
                    fontSize: '0.9rem',
                    color: '#000',
                  },
                }}
              />
            </Grid> */}
            {/* {['accountName', 'bankOfIssue'].map((field) => (
              <Grid item xs={6} key={field}>
                <TextField
                  fullWidth
                  label={field.split(/(?=[A-Z])/).join(' ')}
                  name={field}
                  value={profileData[field]}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only letters and spaces, up to 30 characters
                    if (/^[A-Za-z\s]*$/.test(value) && value.length <= 40) {
                      handleChange(e);
                    }
                  }}
                  inputProps={{
                    maxLength: 40,
                    placeholder:
                      field === 'accountName'
                        ? 'Enter Account Name (e.g. John Doe)'
                        : 'Enter Bank Name (e.g. SBI, ICICI)',
                  }}
                  sx={{
                    '& input::placeholder': {
                      fontSize: '0.9rem',
                      color: '#000',
                    },
                  }}
                />
              </Grid>
            ))} */}

            {/* <Grid item xs={6}>
              <TextField
                fullWidth
                label="Personal Tax Code"
                name="personalTaxCode"
                value={profileData.personalTaxCode}
                onChange={(e) => {
                  const input = e.target.value.toUpperCase();
                  const isValid = /^[A-Z0-9]{0,15}$/.test(input); // Alphanumeric only, max 15

                  if (isValid) {
                    handleChange({
                      target: { name: 'personalTaxCode', value: input }
                    });
                  }
                }}
                inputProps={{ maxLength: 15 }}
                placeholder="Enter Tax Code (e.g. GST1234)"
                error={
                  profileData.personalTaxCode.length > 0 &&
                  (profileData.personalTaxCode.length < 8 || profileData.personalTaxCode.length > 15)
                }
                helperText={
                  profileData.personalTaxCode.length > 0 &&
                    (profileData.personalTaxCode.length < 8 || profileData.personalTaxCode.length > 15)
                    ? 'Tax code must be 8 to 15 characters (letters & numbers only)'
                    : ''
                }
              />
            </Grid> */}

            {/* <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hourly Rate"
                name="hourlyRate"
                value={profileData.hourlyRate}
                onChange={handleChange}
                type="number"
                inputProps={{
                  min: 0,
                  step: "0.01",
                  placeholder: "Hourly Rate (e.g 25.5)",
                }}
                sx={{
                  '& input::placeholder': {
                    fontSize: '0.9rem',
                    color: '#000', // optional for black placeholder
                  },
                }}
              />
            </Grid> */}
            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>CONTACT INFORMATION</Typography>
            </Grid>

            <Grid item xs={6}>
              <PhoneInput
                country={'in'}
                value={profileData.phone}
                onChange={(value) => {
                  const nationalNumber = value.replace(/^\+?\d{1,4}/, '');
                  if (/^\d{0,10}$/.test(nationalNumber)) {
                    handleChange({
                      target: {
                        name: 'phone',
                        fontFamily: 'Marquis',
                        value: value
                      }
                    });
                  }
                }}
                inputProps={{
                  name: 'phone',
                  required: true
                }}
                isValid={(value, country) => {
                  const number = value.replace(country.dialCode, '');
                  return number.length === 10;
                }}
                inputStyle={{
                  width: '100%',
                  fontFamily: 'Marquis',
                  border: '1px solid #ccc',
                }}
              />
            </Grid>

            {/* Member Departments */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}> DEPARTMENT</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Department *</InputLabel>
                <Select
                  name="department"
                  value={profileData.department}
                  onChange={handleChange}
                  label="Department"
                  disabled={loading.departments}
                  required
                >
                  {loading.departments ? (
                    <MenuItem value="">Loading departments...</MenuItem>
                  ) : (
                    departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.name}>{dept.name.toUpperCase()}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pancard"
                name="pancard"
                value={profileData.pancard}
                onChange={(e) => {
                  const input = e.target.value.toUpperCase();
                  // Progressive validation pattern
                  const regexStep = /^[A-Z]{0,5}$|^[A-Z]{5}\d{0,4}$|^[A-Z]{5}\d{4}[A-Z]{0,1}$/;

                  if (regexStep.test(input)) {
                    handleChange({
                      target: { name: 'pancard', value: input }
                    });
                  }
                }}
                inputProps={{
                  maxLength: 10,
                }}
                placeholder="PanCard (e.g. ABCDE1234F)"
                error={
                  profileData.pancard.length === 10 &&
                  !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profileData.pancard)
                }
                helperText={
                  profileData.pancard.length === 10 &&
                    !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profileData.pancard)
                    ? 'Invalid PAN format. Use AAAAA9999A'
                    : ''
                }
              />
            </Grid>


            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  style={{ marginRight: '8px' }}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Save />
                    )
                  }
                  disabled={
                    isSubmitting ||
                    loading.departments ||
                    loading.roles ||
                    loading.jobPositions ||
                    loading.workplaces
                  }
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>

              </Box>
            </Grid>
          </Grid>
        </form>

        <Dialog open={openRoleModal} onClose={() => setOpenRoleModal(false)} maxWidth="md" fullWidth scroll="paper">
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Role Permissions</Typography>
              <IconButton onClick={() => setOpenRoleModal(false)}><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <RolePermission
              onCancel={() => setOpenRoleModal(false)}
              onRoleCreated={(role) => {
                // Update the profileData with the new role
                setProfileData(prev => ({
                  ...prev,
                  Role: {
                    roleId: role.roleId,
                    name: role.roleName,
                    featurePermissions: role.featurePermissions || [],
                  }
                }));
                setOpenRoleModal(false);
              }}
              initialRole={profileData.Role} // Pass the role data to RolePermission component
            />

          </DialogContent>
        </Dialog>
      </Paper>
    </ThemeProvider>
  );
};

export default Newstaff;