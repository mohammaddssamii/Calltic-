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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const RestaurantPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: "", address: "", phoneNumber: "", description: "" });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token");

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/restaurants");
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
      showSnack("Error fetching restaurants", "error");
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const handleSnackClose = () => {
    setSnack({ ...snack, open: false });
  };

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
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (image) formData.append("image", image);

      if (editingId) {
        await axios.put(
          `http://127.0.0.1:5000/api/restaurants/${editingId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
          }
        );
        setEditingId(null);
        showSnack("Restaurant updated successfully!");
      } else {
        await axios.post(
          "http://127.0.0.1:5000/api/restaurants",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
          }
        );
        showSnack("Restaurant added successfully!");
      }

      setForm({ name: "", address: "", phoneNumber: "", description: "" });
      setImage(null);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    if (!token) return showSnack("No token provided", "error");

    try {
      await axios.delete(`http://127.0.0.1:5000/api/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRestaurants();
      showSnack("Restaurant deleted successfully!");
    } catch (err) {
      console.error(err);
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
        params.value ? (
          <Avatar src={`http://127.0.0.1:5000/uploads/${params.value}`} variant="rounded" />
        ) : (
          "N/A"
        ),
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
          <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
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
        <DataGrid rows={restaurants} columns={columns} getRowId={(row) => row._id} pageSize={7} />
      </div>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RestaurantPage;
