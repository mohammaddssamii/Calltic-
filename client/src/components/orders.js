import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Chip, Divider, Card, CardContent, TextField,
  TablePagination, Box, Grid, Stack, Skeleton
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { motion } from "framer-motion";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOpenModal = (order) => { setSelectedOrder(order); setOpenModal(true); };
  const handleCloseModal = () => { setOpenModal(false); setSelectedOrder(null); };
  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  const filteredOrders = orders.filter(order => {
    const username = order.user?.username?.toLowerCase() || "";
    const customerName = order.customerName?.toLowerCase() || "";
    const customerPhone = order.customerPhone?.toLowerCase() || "";
    const searchLower = search.toLowerCase();
    return username.includes(searchLower) || customerName.includes(searchLower) || customerPhone.includes(searchLower);
  });

  const formatFulfillment = (order) => {
    if (order.fulfillment === "delivery") {
      const address = order.deliveryAddress ? ` / ${order.deliveryAddress}` : "";
      return `${order.region || "-"}${address}`;
    } else {
      return order.pickupType === "dine-in" ? "Dine-In" : "Takeaway";
    }
  };

  const getRestaurants = (order) => {
    if (!order.items) return "-";
    const names = [...new Set(order.items.map(i => i.product.restaurant?.name))].filter(Boolean);
    return names.join(", ") || "-";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Box sx={{ padding: "30px" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <ShoppingBagIcon fontSize="large" color="primary" />
          <Typography variant="h5" sx={{ fontWeight: "bold", marginLeft: "10px" }}>
            Orders Management
          </Typography>
        </Box>

        {/* Search */}
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
            {loading ? (
              // Skeleton Loader
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[...Array(5)].map((_, idx) => (
                  <Skeleton key={idx} variant="rectangular" height={40} />
                ))}
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Restaurant</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Delivery Address</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Total Price</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Date & Time</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((order) => (
                        <motion.tr key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                          <TableCell>{order.user?.username || "-"}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.customerPhone}</TableCell>
                          <TableCell>{getRestaurants(order)}</TableCell>
                          <TableCell sx={{ maxWidth: 150, overflowX: "auto", whiteSpace: "nowrap" }}>
                            {formatFulfillment(order)}
                          </TableCell>
                          <TableCell>${order.total}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={order.status === "Delivered" ? "success" : order.status === "Pending" ? "warning" : "error"}
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
                        </motion.tr>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <Stack spacing={1}>
                  <Typography><strong>User:</strong> {selectedOrder.user?.username || "-"}</Typography>
                  <Typography><strong>Customer:</strong> {selectedOrder.customerName}</Typography>
                  <Typography><strong>Phone:</strong> {selectedOrder.customerPhone}</Typography>
                  <Typography><strong>Fulfillment:</strong> {formatFulfillment(selectedOrder)}</Typography>
                  <Typography><strong>Restaurant(s):</strong> {getRestaurants(selectedOrder)}</Typography>
                  <Typography>
                    <strong>Status:</strong>{" "}
                    <Chip
                      label={selectedOrder.status}
                      color={selectedOrder.status === "Delivered" ? "success" : selectedOrder.status === "Pending" ? "warning" : "error"}
                      variant="outlined"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Typography>
                  {selectedOrder.notes && <Typography><strong>Notes:</strong> {selectedOrder.notes}</Typography>}

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6">Products:</Typography>

                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedOrder.items.map((item) => (
                        <Grid item xs={12} sm={6} key={item.product._id}>
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                            <Paper elevation={2} sx={{ padding: 2, borderRadius: "12px" }}>
                              <Typography fontWeight="bold">{item.product.name}</Typography>
                              <Typography variant="body2">Qty: {item.quantity}</Typography>
                              <Typography variant="body2">
                                Price: ${item.product.price} × {item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
                              </Typography>
                                {/* 👇 عرض النوت الخاصة بالمنتج إذا موجودة */}
            {item.note && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mt: 0.5 }}>
                Note: {item.note}
              </Typography>
            )}
                            </Paper>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "#888" }}>No products in this order.</Typography>
                  )}

                  <Divider sx={{ my: 1 }} />
                  <Typography><strong>Total:</strong> ${selectedOrder.total}</Typography>
                  <Typography><strong>Date & Time:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                </Stack>
              </motion.div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" color="error" sx={{ borderRadius: "10px" }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default Orders;
