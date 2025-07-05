import React, { useState } from 'react';
import {
    Button, Modal, Box, Typography, Stepper, Step, StepLabel, TextField,
    Radio, Avatar, Chip,
    Divider, IconButton, useMediaQuery, useTheme, Table, TableBody,
    TableCell, TableContainer, TableHead, Tabs, Tab, TableRow, Paper,
    Checkbox, TablePagination, Container, Grid, Card,
    Badge
} from '@mui/material';
import {
    Close, ArrowBack, ArrowForward, Edit, Delete, Add,
    Visibility, Search, Public, Lock, Group, PersonAdd, Groups
} from '@mui/icons-material';

const steps = ['Select project type', 'About project', 'Privacy', 'Team members'];

const ProjectCreationWizard = ({ open, handleClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeStep, setActiveStep] = useState(0);
    const [projectType, setProjectType] = useState('project');
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [privacyLevel, setPrivacyLevel] = useState('public');
    const [members, setMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleNext = () => activeStep < steps.length - 1
        ? setActiveStep(activeStep + 1)
        : (console.log({ projectType, projectName, privacyLevel, members }), handleClose());

    const handleBack = () => setActiveStep(activeStep - 1);
    const handleAddMember = () => setMembers([...members, {
        id: members.length + 1,
        name: `Member ${members.length + 1}`,
        email: `member${members.length + 1}@example.com`,
        role: 'moderator',
        avatar: `https://i.pravatar.cc/150?img=${members.length + 1}`
    }]);

    const optionCard = (value, current, title, desc, icon, onClick) => (
        <Card variant="outlined" sx={{
            borderColor: value === current ? 'primary.main' : 'divider',
            bgcolor: value === current ? 'primary.light+20' : 'background.paper',
            cursor: 'pointer', mb: 2, p: 2,
            '&:hover': { borderColor: 'primary.main' }
        }} onClick={onClick}>
            <Box display="flex" alignItems="center">
                <Avatar sx={{
                    bgcolor: value === current ? 'primary.main' : 'action.selected',
                    color: value === current ? 'primary.contrastText' : 'text.secondary',
                    mr: 2
                }}>{icon}</Avatar>
                <Box>
                    <Typography fontWeight={600}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary">{desc}</Typography>
                </Box>
                <Radio checked={value === current} sx={{ ml: 'auto' }} />
            </Box>
        </Card>
    );

    const renderStepContent = (step) => [
        <Grid container spacing={2} mt={1} key="type">
            {[
                ['project', 'Project', 'Kanban, tasks, Gantt, deadlines', <Groups />],
                ['collab', 'Collab', 'Collaborate with external teams', <Group />],
                ['workgroup', 'Workgroup', 'Discuss ideas, share files', <PersonAdd />]
            ].map(([val, title, desc, icon]) =>
                <Grid item xs={12} key={val}>
                    {optionCard(val, projectType, title, desc, icon, () => setProjectType(val))}
                </Grid>
            )}
        </Grid>,

        <Box mt={2} key="about">
            <TextField fullWidth label="Project name" value={projectName}
                onChange={(e) => setProjectName(e.target.value)} sx={{ mb: 3 }} />
            <TextField fullWidth multiline rows={4} label="Description"
                value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
            <Typography variant="subtitle1" mt={3} mb={2} fontWeight={600}>Visual theme</Typography>
            <Box display="flex" gap={2} mb={3}>
                {['#4CAF50', '#2196F3', '#9C27B0', '#FF9800'].map((color, i) =>
                    <Badge key={color} badgeContent={i === 0 ? "✓" : ""} overlap="circular">
                        <Avatar sx={{ bgcolor: color, width: 56, height: 56, cursor: 'pointer' }}>
                            {projectName.charAt(0).toUpperCase() || 'P'}
                        </Avatar>
                    </Badge>
                )}
            </Box>
        </Box>,

        <Box mt={2} key="privacy">
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Choose who can see and join this project
            </Typography>
            <Grid container spacing={2} mt={2}>
                {[
                    ['public', 'Public', 'Anyone can join', <Public />],
                    ['private', 'Private', 'Access by invitation', <Lock />],
                    ['hidden', 'Hidden', 'Not listed or visible', <Visibility />]
                ].map(([val, title, desc, icon]) =>
                    <Grid item xs={12} key={val}>
                        {optionCard(val, privacyLevel, title, desc, icon, () => setPrivacyLevel(val))}
                    </Grid>
                )}
            </Grid>
        </Box>,

        <Box mt={2} key="team">
            <Typography fontWeight={600} mb={2}>Project owner</Typography>
            <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                <Box display="flex" alignItems="center">
                    <Avatar src="https://i.pravatar.cc/150?img=5" sx={{ mr: 2 }} />
                    <Box flexGrow={1}>
                        <Typography>You</Typography>
                        <Typography color="text.secondary">rajvicky1906@gmail.com</Typography>
                    </Box>
                    <Button startIcon={<Edit />}>Change</Button>
                </Box>
            </Card>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography fontWeight={600}>Team members</Typography>
                <TextField size="small" placeholder="Search..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <Search /> }} />
            </Box>
            {members.length > 0 ? members.map(member =>
                <Card key={member.id} variant="outlined" sx={{ mb: 1, p: 2 }}>
                    <Box display="flex" alignItems="center">
                        <Avatar src={member.avatar} sx={{ mr: 2 }} />
                        <Box flexGrow={1}>
                            <Typography>{member.name}</Typography>
                            <Typography color="text.secondary">{member.email}</Typography>
                        </Box>
                        <IconButton onClick={() => setMembers(members.filter(m => m.id !== member.id))}>
                            <Delete color="error" />
                        </IconButton>
                    </Box>
                </Card>
            ) : <Card variant="outlined" sx={{ p: 3, textAlign: 'center', mb: 3 }}>
                <Typography color="text.secondary">No team members added yet</Typography>
            </Card>}
            <Box display="flex" gap={2} mt={2}>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddMember}>Add member</Button>
                <Button variant="outlined" startIcon={<Groups />}>Add team</Button>
            </Box>
        </Box>
    ][step];

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: isMobile ? '95%' : '60%', maxWidth: 800, bgcolor: 'background.paper',
                boxShadow: 24, borderRadius: 2, p: 4, maxHeight: '90vh', overflowY: 'auto'
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} pb={2} borderBottom="1px solid divider">
                    <Typography variant="h5" fontWeight={700}>Create New Project</Typography>
                    <IconButton onClick={handleClose}><Close /></IconButton>
                </Box>

                {!isMobile && <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>}

                <Box minHeight="50vh">{renderStepContent(activeStep)}</Box>

                <Box display="flex" justifyContent="space-between" mt={4} pt={3} borderTop="1px solid divider">
                    <Button variant="outlined" onClick={activeStep === 0 ? handleClose : handleBack}
                        startIcon={<ArrowBack />} disabled={activeStep === 0}>
                        {activeStep === 0 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button variant="contained" onClick={handleNext} endIcon={<ArrowForward />}>
                        {activeStep === steps.length - 1 ? 'Create Project' : 'Next'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

const ProjectTable = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selected, setSelected] = useState([]);

    const projects = [
        { id: 1, name: 'Website Redesign', active: true, created: 'June 24', updated: 'June 24', performance: '100%', privacy: 'Public' },
        { id: 2, name: 'Mobile App', active: true, created: 'June 23', updated: 'June 24', performance: '85%', privacy: 'Private' },
        { id: 3, name: 'Marketing', active: false, created: 'June 22', updated: 'June 23', performance: '72%', privacy: 'Public' },
        { id: 4, name: 'Database', active: true, created: 'June 21', updated: 'June 24', performance: '95%', privacy: 'Private' },
        { id: 5, name: 'API', active: true, created: 'June 20', updated: 'June 22', performance: '100%', privacy: 'Hidden' },
    ];

    const handleSelectAll = (e) => setSelected(e.target.checked ? projects.map(p => p.id) : []);
    const handleSelect = (e, id) => setSelected(
        e.target.checked ? [...selected, id] : selected.filter(item => item !== id)
    );
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => (setRowsPerPage(+e.target.value), setPage(0));

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
            <TableContainer>
                <Table stickyHeader sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                padding="checkbox"
                                sx={{ fontWeight: 'bold', bgcolor: 'grey.200', border: '1px solid rgba(224, 224, 224, 1)' }}
                            >
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length < projects.length}
                                    checked={projects.length > 0 && selected.length === projects.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            {['ID', 'Name', 'Active', 'Created', 'Updated', 'Performance', 'Privacy', 'Actions'].map(header => (
                                <TableCell
                                    key={header}
                                    align="center" // ✅ This centers the content
                                    sx={{
                                        fontWeight: 'bold',
                                        bgcolor: 'grey.200',
                                        border: '1px solid rgba(224, 224, 224, 1)'
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((project, index) => (
                                <TableRow
                                    hover
                                    key={project.id}
                                    selected={selected.includes(project.id)}
                                    sx={{
                                        '& td': {
                                            border: '1px solid rgba(224, 224, 224, 1)',
                                            textAlign: 'center' // ✅ Center all cells
                                        }
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selected.includes(project.id)}
                                            onChange={(e) => handleSelect(e, project.id)}
                                        />
                                    </TableCell>

                                    {/* ✅ Serial number instead of ID */}
                                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                                    <TableCell sx={{ fontWeight: 500 }}>{project.name}</TableCell>

                                    <TableCell>
                                        <Chip
                                            label={project.active ? 'Active' : 'Inactive'}
                                            color={project.active ? 'success' : 'default'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>

                                    <TableCell>{project.created}</TableCell>
                                    <TableCell>{project.updated}</TableCell>

                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box width="100%" bgcolor="action.selected" borderRadius={1} height={8}>
                                                <Box
                                                    width={project.performance}
                                                    height={8}
                                                    borderRadius={1}
                                                    bgcolor={
                                                        project.performance === '100%'
                                                            ? 'success.main'
                                                            : project.performance > '80%'
                                                                ? 'warning.main'
                                                                : 'error.main'
                                                    }
                                                />
                                            </Box>
                                            {project.performance}
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={project.privacy}
                                            size="small"
                                            variant="outlined"
                                            icon={
                                                project.privacy === 'Public' ? <Public /> :
                                                    project.privacy === 'Private' ? <Lock /> : <Visibility />
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Box display="flex" gap={1} justifyContent="center">
                                            <IconButton size="small"><Visibility /></IconButton>
                                            <IconButton size="small" color="primary"><Edit /></IconButton>
                                            <IconButton size="small" color="error"><Delete /></IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}


                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={projects.length}
                rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage} />
        </Paper>
    );
};

const ProjectManagement = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Tabs value={0} variant="fullWidth" sx={{
                mb: 2, bgcolor: '#F0F4F8', p: 1, borderRadius: 1,
                '& .MuiTab-root': {
                    textTransform: 'none', fontWeight: 'bold', color: '#142a4f',
                    bgcolor: '#ffffff', '&.Mui-selected': { bgcolor: '#142a4f', color: '#ffffff' }
                }
            }}>
                <Tab label="PROJECT" />
            </Tabs>
            <Container maxWidth={false} disableGutters>
                <Box p={3} bgcolor="white" minHeight="100vh">
                    <Button variant="contained" onClick={() => setOpen(true)} startIcon={<Add />}
                        sx={{ mb: 3, maxWidth: 200, fontWeight: 600 }}>
                        Create Project
                    </Button>
                    <ProjectCreationWizard open={open} handleClose={() => setOpen(false)} />
                    <Box mt={4} width="100%"><ProjectTable /></Box>
                </Box>
            </Container>
        </>
    );
};

export default ProjectManagement;