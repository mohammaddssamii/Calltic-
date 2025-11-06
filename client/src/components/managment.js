import React, { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { 
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert 
} from '@mui/material'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'; 

const AdminDashboard = () => { 
  const [stats, setStats] = useState(null); 
  const [openDialog, setOpenDialog] = useState(false); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [newRole, setNewRole] = useState(''); 
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' }); 
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; 

  const fetchStats = async () => { 
    try { 
      const res = await axios.get('http://127.0.0.1:5000/api/dashboard/stats', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      }); 
      setStats(res.data); 
    } catch (err) { 
      console.error(err); 
    } 
  }; 

  useEffect(() => { fetchStats(); }, []); 

  const handleRoleChange = (user, role) => { 
    setSelectedUser(user); 
    setNewRole(role); 
    setOpenDialog(true); 
  }; 

  const confirmRoleChange = async () => { 
    try { 
      await axios.put(
        'http://127.0.0.1:5000/api/users/change-role',
        { userId: selectedUser._id, role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      ); 
      setOpenDialog(false); 
      setSnack({ open: true, message: `Role of ${selectedUser.username} changed to ${newRole}`, severity: 'success' }); 
      fetchStats(); // تحديث البيانات بعد التغيير 
    } catch (err) { 
      console.error(err); 
      setSnack({ open: true, message: `Failed to change role: ${err.response?.data?.message || err.message}`, severity: 'error' }); 
      setOpenDialog(false); 
    } 
  }; 

  if (!stats) return <Typography>Loading...</Typography>; 

  return ( 
    <Box p={3}> 
      <Typography variant="h4" mb={3}>Admin Dashboard</Typography> 

      {/* Top Cards */} 
      <Grid container spacing={2} mb={4}> 
        <Grid item xs={12} sm={6} md={3}> 
          <Card> 
            <CardContent> 
              <Typography variant="h6">Restaurants</Typography> 
              <Typography variant="h4">{stats.restaurantsCount}</Typography> 
            </CardContent> 
          </Card> 
        </Grid> 
        <Grid item xs={12} sm={6} md={3}> 
          <Card> 
            <CardContent> 
              <Typography variant="h6">Total Users</Typography> 
              <Typography variant="h4">{stats.usersCount}</Typography> 
            </CardContent> 
          </Card> 
        </Grid> 
        <Grid item xs={12} sm={6} md={3}> 
          <Card> 
            <CardContent> 
              <Typography variant="h6">Orders</Typography> 
              <Typography variant="h4"> 
                {stats.ordersByRestaurant.reduce((acc, r) => acc + r.totalOrders, 0)} 
              </Typography> 
            </CardContent> 
          </Card> 
        </Grid> 
        <Grid item xs={12} sm={6} md={3}> 
          <Card> 
            <CardContent> 
              <Typography variant="h6">Total Sales</Typography> 
              <Typography variant="h4"> 
                JD{stats.ordersByRestaurant.reduce((acc, r) => acc + r.totalSales, 0).toFixed(2)} 
              </Typography> 
            </CardContent> 
          </Card> 
        </Grid> 
      </Grid> 

      {/* Charts */} 
      <Grid container spacing={3} mb={4}> 
        <Grid item xs={12} md={6}> 
          <Typography variant="h6" mb={1}>Orders by Restaurant</Typography> 
          <BarChart width={500} height={300} data={stats.ordersByRestaurant}> 
            <XAxis dataKey="restaurantName" /> 
            <YAxis /> 
            <Tooltip /> 
            <Bar dataKey="totalOrders" fill="#8884d8" /> 
            <Bar dataKey="totalSales" fill="#82ca9d" /> 
          </BarChart> 
        </Grid> 
        <Grid item xs={12} md={6}> 
          <Typography variant="h6" mb={1}>User Roles Distribution</Typography> 
          <PieChart width={400} height={300}> 
            <Pie data={stats.roles.map(r => ({ name: r._id, value: r.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label > 
              {stats.roles.map((_, index) => ( 
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> 
              ))} 
            </Pie> 
            <Legend /> 
            <Tooltip /> 
          </PieChart> 
        </Grid> 
      </Grid> 

      {/* Employees Table */} 
      <Typography variant="h6" mb={1}>Employees</Typography> 
      <TableContainer component={Paper} mb={4}> 
        <Table> 
          <TableHead> 
            <TableRow> 
              <TableCell>Username</TableCell> 
              <TableCell>Role</TableCell> 
              <TableCell>Total Online Time (min)</TableCell> 
              <TableCell>Online Status</TableCell> 
            </TableRow> 
          </TableHead> 
          <TableBody> 
            {stats.usersOnlineStats.map(user => ( 
              <TableRow key={user._id}> 
                <TableCell>{user.username}</TableCell> 
                <TableCell> 
                  <Select value={user.role} onChange={(e) => handleRoleChange(user, e.target.value)} > 
                    <MenuItem value="user">User</MenuItem> 
                    <MenuItem value="admin">Admin</MenuItem> 
                  </Select> 
                </TableCell> 
                <TableCell>{user.totalOnlineTime}</TableCell> 
                <TableCell>
                  <span style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: user.isOnline ? 'green' : 'gray',
                    marginRight: 5
                  }} />
                  {user.isOnline ? 'Online' : 'Offline'}
                </TableCell>
              </TableRow> 
            ))} 
          </TableBody> 
        </Table> 
      </TableContainer> 

      {/* Orders per User Table */} 
      <Typography variant="h6" mb={1}>Orders per User</Typography> 
      <TableContainer component={Paper}> 
        <Table> 
          <TableHead> 
            <TableRow> 
              <TableCell>Username</TableCell> 
              <TableCell>Total Orders</TableCell> 
            </TableRow> 
          </TableHead> 
          <TableBody> 
            {stats.ordersByUser.map(user => ( 
              <TableRow key={user.userId}> 
                <TableCell>{user.username}</TableCell> 
                <TableCell>{user.totalOrders}</TableCell> 
              </TableRow> 
            ))} 
          </TableBody> 
        </Table> 
      </TableContainer> 

      {/* Dialog لتأكيد تغيير الرول */} 
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}> 
        <DialogTitle sx={{ backgroundColor: '#f44336', color: '#fff' }}> Confirm Role Change </DialogTitle> 
        <DialogContent> Are you sure you want to change role of <b>{selectedUser?.username}</b> to <b>{newRole}</b>? </DialogContent> 
        <DialogActions> 
          <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button> 
          <Button onClick={confirmRoleChange} color="error" variant="contained">Confirm</Button> 
        </DialogActions> 
      </Dialog> 

      {/* Snackbar للنجاح/الفشل */} 
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} > 
        <Alert severity={snack.severity} sx={{ width: '100%' }}> {snack.message} </Alert> 
      </Snackbar> 
    </Box> 
  ); 
}; 

export default AdminDashboard;
