import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ProfilePage({ profileData, setProfileData }) {
  // -------- Password Modal --------
  const [openPassword, setOpenPassword] = useState(false);
  const handleOpenPassword = () => setOpenPassword(true);
  const handleClosePassword = () => setOpenPassword(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://127.0.0.1:5000/api/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Password updated successfully');
      handleClosePassword();
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      alert(error.response?.data?.message || 'Failed to update password');
    }
  };

  // -------- Edit Profile Modal --------
  const [editOpen, setEditOpen] = useState(false);
  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);

  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // تحديث editData تلقائيًا عند تغير profileData
  useEffect(() => {
    setEditData({
      fullName: profileData.fullName || '',
      email: profileData.email || '',
      phoneNumber: profileData.phoneNumber || '',
      address: profileData.address || '',
    });
    setPreviewImage(profileData.profileImage ? `http://127.0.0.1:5000/uploads/${profileData.profileImage}` : null);
  }, [profileData]);

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
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

    const response = await axios.put(
      'http://127.0.0.1:5000/api/users/update',
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // أغلق المودال قبل الريلود
    handleEditClose();

    // إعادة تحميل الصفحة بالكامل
   // window.location.href = window.location.href;

   
window.location.replace(window.location.href);
    alert('Profile updated successfully');


  } catch (error) {
    console.error('Profile update error:', error);
    alert(error.response?.data?.message || 'Failed to update profile');
  }
};



  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file)); // عرض الصورة قبل الحفظ
    }
  };

  return (
    <div>
      <img
        src={previewImage || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...'}
        alt="Profile Avatar"
        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
      />
      <h1>User Name: {profileData.fullName}</h1>
      <h2>Email: {profileData.email}</h2>
      <h3>Role: {profileData.role}</h3>
      <h2>Phone Number: {profileData.phoneNumber}</h2>
      <h2>Address: {profileData.address}</h2>

      <Button onClick={handleOpenPassword} sx={{ mr: 2 }}>Change Password</Button>
      <Button onClick={handleEditOpen}>Edit Profile</Button>

      {/* Password Modal */}
      <Modal open={openPassword} onClose={handleClosePassword}>
        <Box sx={style}>
          <Typography variant="h6">Update Your Password</Typography>
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
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Update Password</Button>
          </form>
        </Box>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal open={editOpen} onClose={handleEditClose}>
        <Box sx={style}>
          <Typography variant="h6">Edit Your Profile</Typography>
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
              style={{ marginTop: '10px', marginBottom: '10px' }}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save Changes</Button>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
