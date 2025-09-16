import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

export function Category() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, categoryId: null });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
  }, []);

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const handleSnackClose = () => setSnack({ ...snack, open: false });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      showSnack("Error fetching categories", "error");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showSnack("Name is required", "error");
    setLoading(true);

    try {
      if (editingCategory) {
        const res = await axios.put(
          `http://127.0.0.1:5000/api/categories/${editingCategory}`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategories(categories.map((c) => (c._id === editingCategory ? res.data : c)));
        showSnack("Category updated successfully!");
      } else {
        const res = await axios.post(
          "http://127.0.0.1:5000/api/categories",
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategories([...categories, res.data]);
        showSnack("Category added successfully!");
      }

      setName("");
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
      showSnack("Operation failed", "error");
    }
    setLoading(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setName(category.name);
  };

  const handleDeleteConfirm = (id) => {
    setDeleteDialog({ open: true, categoryId: id });
  };

  const handleDelete = async () => {
    const id = deleteDialog.categoryId;
    setLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:5000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c._id !== id));
      showSnack("Category deleted successfully!");
    } catch (err) {
      console.error(err);
      showSnack("Delete failed", "error");
    }
    setLoading(false);
    setDeleteDialog({ open: false, categoryId: null });
  };

  return (
    <Box p={{ xs: 2, sm: 3 }} maxWidth={700} mx="auto">
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 4, boxShadow: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          {editingCategory ? "Edit Category" : "Add New Category"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ minWidth: { xs: "100%", sm: 120 } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : editingCategory ? "Update" : "Add"}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Typography variant="h5" fontWeight={700} mb={2}>
        Categories
      </Typography>

      {loading && !categories.length ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    borderRadius: 3,
                    boxShadow: 2,
                    "&:hover": {
                      boxShadow: 6,
                      transform: "scale(1.02)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <Typography variant="body1" mb={{ xs: 1, sm: 0 }}>
                    {category.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => handleEdit(category)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteConfirm(category._id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, categoryId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this category?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, categoryId: null })}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={handleSnackClose} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
