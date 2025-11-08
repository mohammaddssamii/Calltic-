import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const RestaurantPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: "", address: "", phoneNumber: "", description: "" });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const token = localStorage.getItem("token");

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://calltic.onrender.com/api/restaurants");
      setRestaurants(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showSnack("Error fetching restaurants", "error");
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const handleSnackClose = () => setSnack({ ...snack, open: false });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return showSnack("No token provided", "error");
    if (!form.name || !form.address || !form.phoneNumber || !form.description) {
      return showSnack("Please fill in all fields!", "error");
    }

    const nameExists = restaurants.some(
      (r) => r.name.toLowerCase() === form.name.trim().toLowerCase() && r._id !== editingId
    );
    if (nameExists) return showSnack("Restaurant name already exists!", "error");
    if (!editingId && !image) return showSnack("Please select an image for the restaurant!", "error");

    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (image) formData.append("image", image);

      if (editingId) {
        await axios.put(`https://calltic.onrender.com/api/restaurants/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        setEditingId(null);
        showSnack("Restaurant updated successfully!");
      } else {
        await axios.post("https://calltic.onrender.com/api/restaurants", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        showSnack("Restaurant added successfully!");
      }

      setForm({ name: "", address: "", phoneNumber: "", description: "" });
      setImage(null);
      fetchRestaurants();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showSnack("Error saving restaurant", "error");
    }
  };

  const handleEdit = (restaurant) => {
    setForm({
      name: restaurant.name || "",
      address: restaurant.address || "",
      phoneNumber: restaurant.phoneNumber || "",
      description: restaurant.description || "",
    });
    setEditingId(restaurant._id);
  };

  const handleDeleteDialogOpen = (id) => setDeleteDialog({ open: true, id });
  const handleDeleteDialogClose = () => setDeleteDialog({ open: false, id: null });

  const handleDelete = async () => {
    if (!token) return showSnack("No token provided", "error");
    try {
      setLoading(true);
      await axios.delete(`https://calltic.onrender.com/api/restaurants/${deleteDialog.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRestaurants();
      setLoading(false);
      handleDeleteDialogClose();
      showSnack("Restaurant deleted successfully!");
    } catch (err) {
      console.error(err);
      setLoading(false);
      handleDeleteDialogClose();
      showSnack("Error deleting restaurant", "error");
    }
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "phoneNumber", headerName: "Phone", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "image",
      headerName: "Image",
      flex: 0.5,
      renderCell: (params) =>
        params.value ? <Avatar src={`https://calltic.onrender.com/uploads/${params.value}`} variant="rounded" /> : "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteDialogOpen(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {editingId ? "Edit Restaurant" : "Add New Restaurant"}
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Phone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <input type="file" onChange={handleImage} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {editingId ? "Update" : "Add"} Restaurant
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        All Restaurants
      </Typography>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={restaurants.map((r, i) => ({ ...r, animationDelay: i * 0.1 }))}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={7}
          components={{
            Row: (props) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: props.row.animationDelay }}
              >
                <div>{props.children}</div>
              </motion.div>
            ),
          }}
        />
      </div>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>

      {/* Loading Spinner */}
      <Backdrop open={loading} sx={{ color: "#fff", zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Styled Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteDialogClose}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "#d32f2f" }}>
          <WarningAmberIcon /> Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this restaurant?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantPage;
