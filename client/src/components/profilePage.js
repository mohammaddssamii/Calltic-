import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Grid,
  Paper,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 420,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 26,
  p: 4,
};

export default function ProfilePage({ profileData }) {
  const [openPassword, setOpenPassword] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [localProfileData, setLocalProfileData] = useState(profileData);

  useEffect(() => {
    setLocalProfileData(profileData);
    setEditData({
      fullName: profileData.fullName || '',
      email: profileData.email || '',
      phoneNumber: profileData.phoneNumber || '',
      address: profileData.address || '',
    });
    setPreviewImage(
      profileData.profileImage
        ? `http://127.0.0.1:5000/uploads/${profileData.profileImage}`
        : '/default-avatar.png'
    );
  }, [profileData]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://127.0.0.1:5000/api/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCurrentPassword('');
      setNewPassword('');
      setOpenPassword(false);
      setSnack({ open: true, message: 'Password updated successfully', severity: 'success' });
    } catch (error) {
      setSnack({
        open: true,
        message: error.response?.data?.message || 'Failed to update password',
        severity: 'error',
      });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('fullName', editData.fullName);
      formData.append('email', editData.email);
      formData.append('phoneNumber', editData.phoneNumber);
      formData.append('address', editData.address);
      if (profileImage) formData.append('profileImage', profileImage);

      await axios.put('http://127.0.0.1:5000/api/users/update', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // تحديث البيانات مباشرة بدون reload
      setLocalProfileData({
        ...localProfileData,
        fullName: editData.fullName,
        email: editData.email,
        phoneNumber: editData.phoneNumber,
        address: editData.address,
        profileImage: profileImage ? profileImage.name : localProfileData.profileImage,
      });

      setEditOpen(false);
      setSnack({ open: true, message: 'Profile updated successfully', severity: 'success' });
    } catch (error) {
      setSnack({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error',
      });
    }
  };

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          borderRadius: 4,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Profile Image */}
        <Box
          sx={{
            width: 160,
            height: 160,
            mb: 2,
            mx: 'auto',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #1976d2',
            boxShadow: '0px 6px 18px rgba(0,0,0,0.25)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.05)' },
          }}
        >
          <img
            src={previewImage}
            alt="Profile Avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>

        <Typography variant="h4" fontWeight={700}>
          {localProfileData.fullName || 'User Name'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={3}>
          {localProfileData.role}
        </Typography>

        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Email', value: localProfileData.email },
            { label: 'Phone', value: localProfileData.phoneNumber },
            { label: 'Address', value: localProfileData.address },
          ].map((item) => (
            <Grid item xs={12} sm={6} key={item.label}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  },
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {item.value || '-'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenPassword(true)}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 3,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
              },
            }}
          >
            Change Password
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setEditOpen(true)}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 3,
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: '#1976d2',
              },
            }}
          >
            Edit Profile
          </Button>
        </Stack>
      </Paper>

      {/* Password Modal */}
      <Modal open={openPassword} onClose={() => setOpenPassword(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Update Password
          </Typography>
          <form onSubmit={handleChangePassword}>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              margin="normal"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, borderRadius: 3 }}
            >
              Update Password
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Edit Profile
          </Typography>
          <form onSubmit={handleProfileUpdate}>
            <TextField
              label="Full Name"
              name="fullName"
              value={editData.fullName}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={editData.email}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={editData.phoneNumber}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Address"
              name="address"
              value={editData.address}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ marginTop: 10, marginBottom: 10 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 1, borderRadius: 3 }}
            >
              Save Changes
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
