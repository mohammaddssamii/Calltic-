import React from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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


export default function ProfilePage(props) {
  const navigation = useNavigate();
  const { profileData } = props;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
  fullName: profileData.fullName || '',
  email: profileData.email || '',
  phoneNumber: profileData.phoneNumber || '',
  address: profileData.address || '',
});

const handleEditOpen = () => setEditOpen(true);
const handleEditClose = () => setEditOpen(false);

const handleEditChange = (e) => {
  setEditData({ ...editData, [e.target.name]: e.target.value });
};

const handleProfileUpdate = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.put('http://localhost:5000/api/users/update', editData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    alert('Profile updated successfully');
    handleEditClose();
    // لو حاب ترجع تحدث الصفحة أو البيانات:
    window.location.reload(); // أو تحديث `profileData` من الأعلى
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile');
  }
};


  return (
   <div>
    <img src={profileData.image ?? "data:image/jpeg;base64,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"} alt="Profile Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
    <h1>User Name : {profileData.fullName}</h1>
    <h2>Email : {profileData.email}</h2>
    <h3>Role : {profileData.role}</h3>
    <h2>Phone Number : {profileData.phoneNumber}</h2>
    <h2>Address : {profileData.address}</h2>
    <Button onClick={handleOpen}>change password</Button>
    <Button onClick={handleEditOpen}>Edit Profile</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update Your Password
          </Typography>
         <form onSubmit={async (e) => {
            e.preventDefault();
            // Handle password change logic here
            try {
                const response = await axios.post('http://localhost:5000/api/users/change-password', {
                    currentPassword,
                    newPassword
                },{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                    alert('Password updated successfully');
                    handleClose();
              
            } catch (error) {
                console.error('Error updating password:', error);
                if (error.response && error.response.status === 400) {
                    alert("Current password is incorrect");
                }else {
                    alert('Failed to update password. Please try again later.');
                }
            }
          }}>
            <TextField
              label="Current Password"
              type="text"
              fullWidth
              margin="normal"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />    
            <TextField
              label="New Password"
              type="text"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary">
              Update Password
            </Button>
          </form>
        </Box>
      </Modal>
      <Modal
  open={editOpen}
  onClose={handleEditClose}
>
  <Box sx={style}>
    <Typography variant="h6" component="h2">
      Edit Profile Information
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
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Save Changes
      </Button>
    </form>
  </Box>
</Modal>

   </div>
  );
}
   