import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  Input,
  Avatar,
  Stack,
  IconButton,
  Snackbar,
  Alert as MuiAlert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
} from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    restaurant: "",
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const token = localStorage.getItem("token");
  const formRef = useRef(null);
  const theme = useTheme();

  const handleSnackClose = () => setSnackOpen(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducts, resCategories, resRestaurants] = await Promise.all([
          axios.get("https://calltic.onrender.com/api/products"),
          axios.get("https://calltic.onrender.com/api/categories"),
          axios.get("https://calltic.onrender.com/api/restaurants"),
        ]);

        const productsArray = Array.isArray(resProducts.data)
          ? resProducts.data
          : resProducts.data.products;

        const mappedProducts = productsArray.map((p) => ({
          ...p,
          category:
            p.category?._id
              ? resCategories.data.find((c) => c._id === p.category._id) || { name: "" }
              : resCategories.data.find((c) => c._id === p.category) || { name: "" },
          restaurant:
            p.restaurant?._id
              ? resRestaurants.data.find((r) => r._id === p.restaurant._id) || { name: "" }
              : resRestaurants.data.find((r) => r._id === p.restaurant) || { name: "" },
        }));

        setProducts(mappedProducts);
        setCategories(resCategories.data);
        setRestaurants(resRestaurants.data);
      } catch (err) {
        console.error("Fetch Error:", err.response || err);
        setSnackMessage("Error fetching data");
        setSnackSeverity("error");
        setSnackOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage = (e) => setForm({ ...form, image: e.target.files[0] });

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!form.name) {
      tempErrors.name = "Name is required";
      isValid = false;
    }
    if (!form.description) {
      tempErrors.description = "Description is required";
      isValid = false;
    }
    if (!form.price) {
      tempErrors.price = "Price is required";
      isValid = false;
    }
    if (!form.category) {
      tempErrors.category = "Please select a category";
      isValid = false;
    }
    if (!form.restaurant) {
      tempErrors.restaurant = "Please select a restaurant";
      isValid = false;
    }
    if (!form.image && !editingId) {
      tempErrors.image = "Image is required";
      isValid = false;
    }

    const duplicate = products.find(
      (p) =>
        p.name.toLowerCase() === form.name.toLowerCase() &&
        p.restaurant?._id === form.restaurant &&
        p._id !== editingId
    );
    if (duplicate) {
      tempErrors.name =
        "This product name already exists for the selected restaurant";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("No token provided");
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null) formData.append(key, form[key]);
      });

      let res;
      if (editingId) {
        res = await axios.put(
          `https://calltic.onrender.com/api/products/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(
          products.map((p) =>
            p._id === res.data._id
              ? {
                  ...res.data,
                  category:
                    categories.find((c) => c._id === res.data.category) || { name: "" },
                  restaurant:
                    restaurants.find((r) => r._id === res.data.restaurant) || { name: "" },
                }
              : p
          )
        );
        setEditingId(null);
        setSnackMessage("Product updated successfully!");
      } else {
        res = await axios.post(
          "https://calltic.onrender.com/api/products",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts([
          ...products,
          {
            ...res.data,
            category:
              categories.find((c) => c._id === res.data.category) || { name: "" },
            restaurant:
              restaurants.find((r) => r._id === res.data.restaurant) || { name: "" },
          },
        ]);
        setSnackMessage("Product added successfully!");
      }

      setSnackSeverity("success");
      setSnackOpen(true);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        restaurant: "",
        image: null,
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      setSnackMessage("Failed: " + (err.response?.data?.message || err.message));
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category?._id || "",
      restaurant: product.restaurant?._id || "",
      image: null,
    });
    setEditingId(product._id);
    setErrors({});
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDeleteDialogOpen = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteId(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!token) return alert("No token provided");
    try {
      await axios.delete(`https://calltic.onrender.com/api/products/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== deleteId));
      setSnackMessage("Product deleted successfully!");
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (err) {
      console.error(err);
      setSnackMessage("Failed to delete product");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
    handleDeleteDialogClose();
  };

  const filteredProducts = products.filter(
    (p) =>
      (!filterCategory || p.category?._id === filterCategory) &&
      (!filterRestaurant || p.restaurant?._id === filterRestaurant) &&
      (!searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <CircularProgress
          size={70}
          thickness={5}
          sx={{
            color: theme.palette.primary.main,
            animationDuration: "800ms",
          }}
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading products...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }}>
      <Typography variant="h4" gutterBottom>
        {editingId ? "Edit Product" : "Add New Product"}
      </Typography>

      {/* Form */}
      <Paper sx={{ p: 3, mb: 4 }} ref={formRef}>
        <Grid container spacing={2}>
          {/* Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          {/* Description */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
          {/* Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Price"
              name="price"
              value={form.price}
              onChange={handleChange}
              fullWidth
              error={!!errors.price}
              helperText={errors.price}
            />
          </Grid>
          {/* Category */}
          <Grid item xs={12} sm={6}>
            <InputLabel>Category</InputLabel>
            <Select
              value={form.category}
              name="category"
              onChange={handleChange}
              fullWidth
              error={!!errors.category}
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error">
              {errors.category}
            </Typography>
          </Grid>
          {/* Restaurant */}
          <Grid item xs={12} sm={6}>
            <InputLabel>Restaurant</InputLabel>
            <Select
              value={form.restaurant}
              name="restaurant"
              onChange={handleChange}
              fullWidth
              error={!!errors.restaurant}
            >
              <MenuItem value="">Select Restaurant</MenuItem>
              {restaurants.map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error">
              {errors.restaurant}
            </Typography>
          </Grid>
          {/* Image */}
          <Grid item xs={12} sm={6}>
            <Input type="file" accept="image/*" onChange={handleImage} />
            {errors.image && (
              <Typography variant="caption" color="error">
                {errors.image}
              </Typography>
            )}
            {form.image ? (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2">Preview:</Typography>
                <Avatar
                  src={URL.createObjectURL(form.image)}
                  variant="rounded"
                  sx={{ width: "100%", height: 200 }}
                />
              </Box>
            ) : (
              editingId && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="body2">Current image:</Typography>
                  <Avatar
                    src={`https://calltic.onrender.com/uploads/${
                      products.find((p) => p._id === editingId)?.image
                    }`}
                    variant="rounded"
                    sx={{ width: "100%", height: 200 }}
                  />
                </Box>
              )
            )}
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              {editingId ? "Update" : "Add"} Product
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          label="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={filterRestaurant}
          onChange={(e) => setFilterRestaurant(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Restaurants</MenuItem>
          {restaurants.map((r) => (
            <MenuItem key={r._id} value={r._id}>
              {r.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Product Cards */}
      <Grid container spacing={3}>
        {filteredProducts.map((p, index) => (
          <Grid item xs={12} sm={6} md={4} key={p._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: "0px 8px 20px rgba(0,0,0,0.3)", y: -5 }} 
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  boxShadow: 3,
                  height: 400,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  
                }}
              >
                <Avatar
                  src={`https://calltic.onrender.com/uploads/${p.image}`}
                  variant="rounded"
                  sx={{ width: "100%", height: 200, mb: 1 }}
                />
                <Box>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {p.description}
                  </Typography>
                  <Typography variant="body2">Price: {p.price} JOD</Typography>
                  <Typography variant="body2">
                    Category: {p.category?.name}
                  </Typography>
                  <Typography variant="body2">
                    Restaurant: {p.restaurant?.name}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  sx={{ mt: 1 }}
                >
                  <IconButton color="primary" onClick={() => handleEdit(p)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteDialogOpen(p._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: "100%" }}
        >
          {snackMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ProductPage;
