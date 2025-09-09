import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Divider,
  Card,
  CardContent,
  TextField,
  TablePagination,
  Box,
  Grid,
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:5000/api/orders",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 🔥 البحث يشمل username و customerName و customerPhone
  const filteredOrders = orders.filter((order) => {
    const username = order.user?.username ? String(order.user.username).toLowerCase() : "";
    const customerName = order.customerName ? String(order.customerName).toLowerCase() : "";
    const customerPhone = order.customerPhone ? String(order.customerPhone).toLowerCase() : "";
    const searchLower = String(search).toLowerCase();

    return (
      username.includes(searchLower) ||
      customerName.includes(searchLower) ||
      customerPhone.includes(searchLower)
    );
  });

  return (
    <Box sx={{ padding: "30px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <ShoppingBagIcon fontSize="large" color="primary" />
        <Typography variant="h5" sx={{ fontWeight: "bold", marginLeft: "10px" }}>
          Orders Management
        </Typography>
      </Box>

      {/* Search Bar */}
      <TextField
        label="Search by User, Customer or Phone"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ marginBottom: "20px" }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Orders Table */}
      <Card sx={{ borderRadius: "16px", boxShadow: 3 }}>
        <CardContent>
          <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Customer Phone</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Total Price</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell>{order.user.username}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.customerPhone}</TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={
                            order.status === "Delivered"
                              ? "success"
                              : order.status === "Pending"
                              ? "warning"
                              : "error"
                          }
                          variant="outlined"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ borderRadius: "10px", textTransform: "none" }}
                          onClick={() => handleOpenModal(order)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", fontSize: "20px" }}>
          Order Details
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                <strong>User:</strong> {selectedOrder.user.username}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Customer Name:</strong> {selectedOrder.customerName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Customer Phone:</strong> {selectedOrder.customerPhone}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong>{" "}
                <Chip
                  label={selectedOrder.status}
                  color={
                    selectedOrder.status === "Delivered"
                      ? "success"
                      : selectedOrder.status === "Pending"
                      ? "warning"
                      : "error"
                  }
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
              </Typography>

              {/* Products Section with Grid Cards */}
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Products:
              </Typography>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {selectedOrder.items.map((item) => (
                    <Grid item xs={12} sm={6} key={item.product._id}>
                      <Paper elevation={2} sx={{ padding: 2, borderRadius: "12px" }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: ${item.product.price}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "#888", mb: 2 }}>
                  No products in this order.
                </Typography>
              )}

              <Typography variant="subtitle1" gutterBottom>
                <strong>Total Price:</strong> ${selectedOrder.total}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Date & Time:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            color="error"
            sx={{ borderRadius: "10px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
