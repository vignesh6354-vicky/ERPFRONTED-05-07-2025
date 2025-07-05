import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
} from "@mui/material";
import HomeFooter from "./Constants/HomeFooter";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Navbar from "./Constants/Navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


const LiderERP = () => {
  const navigate = useNavigate();

  const prod = [
  {
    title: "Lider ERP",
       image: "CC1.jpg",
    description: `A powerful ERP system designed to streamline business operations—from finance and inventory to sales and HR.

Key Taken:
• Real-time business dashboard • Inventory & warehouse control • Finance, billing & expenses • HR, payroll & attendance • Workflow automation • Role-based access`
  },
  {
    title: "Impulz (LMS)",
       image: "CC2.jpg",
    description: `A modern LMS built for educational institutions to create, manage, and track learning effectively.

Key Taken:
• Student & batch management • Interactive course creation • Attendance & grading • Assignments & tests • Real-time analytics • Role-based access`
  },
  {
    title: "Urban (Gatekeeper App)",
        image: "CC3.jpg",
    description: `A smart gatekeeping app enhancing residential and corporate security through digital visitor management.

Key Taken:
• Digital check-in/verification • Resident alerts & approvals • Staff/delivery tracking • Emergency alerts • Visitor logs • QR/OTP-based entry`
  },
  {
    title: "Pathway (Transport App)",
        image: "Ac4.jpg",
    description: `A transport terminal app to manage bus routes, reduce delays, and offer real-time tracking.

Key Taken:
• Live bus tracking • Route monitoring • Driver & vehicle info • Smart pickup/drop alerts • Digital logs • Route transparency`
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};



  return (
    <Box>
      <Navbar />

      {/* Hero Section */}
   <Box
      sx={{
        position: 'relative',
        py: { xs: 10, sm: 18 },
        textAlign: 'center',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
     <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/images/Bc1.jpg')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(10px)',
          transform: 'scale(1.05)', // to hide blur edges
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // 40% black overlay
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container sx={{ position: 'relative', zIndex: 2 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: 'Marquis',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            color: 'white',
          }}
        >
          WELCOME TO LIDER TECHNOLOGY
        </Typography>

        <Typography
          variant="h5"
          component="p"
          sx={{
            mb: 4,
            fontFamily: 'Marquis',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            color: 'white',
          }}
        >
          Empowering businesses with innovative IT solutions.
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontWeight: 'bold',
            fontFamily: 'Marquis',
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
          aria-label="Get Started"
          onClick={() => navigate('/login')}
        >
          Get Started
        </Button>
      </Container>
    </Box>
    <br />
      <Typography
           variant="h3"
           sx={{
             fontWeight: 900,
             textAlign: "center",
             mb: 4,
             color: "#1e3a8a",
             fontFamily: "'Marquis', serif",
             fontSize: { xs: "1.75rem", md: "2.5rem" },
             textTransform: "uppercase",
             letterSpacing: 1,
             position: "relative",
             "&::after": {
               content: '""',
               position: "absolute",
               bottom: -5,
               left: "50%",
               transform: "translateX(-50%)",
               width: 80,
               height: 4,
               backgroundColor: "#1e40af",
               borderRadius: 2,
             },
           }}
         >
           Our Products
         </Typography>

<Box
  sx={{
    textAlign: { xs: "center", md: "left" }, // Align left only on desktop
    px: { xs: 1, md: 6 },
    mx: { xs: "auto", md: 0 }, // Center on mobile, default on desktop
    ml: { md: "auto" }, // Move to right on desktop
    maxWidth: { md: "75%" }, // Limit width on desktop for balance
  }}
>

       
         <br /><br /><br />
 <Grid
  container
  spacing={{ xs: 3, md: 6 }}
  // direction={index % 2 === 0 ? "row" : "row-reverse"}
  alignItems="center"
  justifyContent="center"
  component={motion.div}
  variants={fadeInUp}
  sx={{ pl: { md: 6 } }}
>

 {prod.map((item, index) => (
  <Grid
    container
    key={index}
    spacing={{ xs: 3, md: 6 }}
    direction={index % 2 === 0 ? "row" : "row-reverse"}
    alignItems="center"
    justifyContent="center"
    component={motion.div}
    variants={fadeInUp}
    sx={{
      maxWidth: 1100,
      mx: "auto",
      mb: { xs: 8, md: 10 },
    }}
  >
    {/* Image Section */}
    <Grid item xs={12} md={5} sx={{ textAlign: "center" }}>
      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.4s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
          mx: "auto",
          maxWidth: 400,
        }}
      >
        <img
          src={`/images/${item.image}`}
          alt={item.title}
          style={{
            width: "100%",
            objectFit: "cover",
            aspectRatio: "4 / 3",
            borderRadius: "12px",
          }}
        />
      </Box>
    </Grid>

    {/* Text Section */}
    <Grid item xs={12} md={7} sx={{ textAlign: "center" }}>
      <Box sx={{ px: { xs: 1, md: 3 }, mx: "auto" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#1d4ed8",
            mb: 2,
            fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.75rem" },
          }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "0.95rem", sm: "1.05rem" },
            lineHeight: 1.8,
            color: "#374151",
            mb: 1.5,
          }}
        >
          {item.description.split("Key Taken:")[0].trim()}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: "0.9rem", sm: "1rem" },
            color: "#475569",
            lineHeight: 1.7,
            backgroundColor: "#f8fafc",
            borderLeft: "4px solid #2563eb",
            px: 2,
            py: 1,
            borderRadius: 1,
            fontStyle: "italic",
            display: "inline-block",
            mx: "auto",
          }}
        >
          <strong>Key Taken:</strong>{" "}
          {item.description
            .split("Key Taken:")[1]
            ?.replace(/\n• /g, " ")
            ?.replace(/\n/g, " ")
            .trim()}
        </Typography>
      </Box>
    </Grid>
  </Grid>
))}

 </Grid>
       </Box>
    <HomeFooter />
    </Box>
  );
};

export default LiderERP;
