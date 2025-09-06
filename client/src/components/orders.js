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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:5000/api/orders/get-all-orders",
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

  return (
    <div style={{ padding: "20px" }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Total Quantity</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.user.username}</TableCell>
                <TableCell>
                  {order.items.map((item) => item.product.name).join(", ")}
                </TableCell>
                <TableCell>
                  {order.items.reduce((total, item) => total + item.quantity, 0)}
                </TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
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

      {/* Modal for Order Details */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Order ID: {selectedOrder._id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                User: {selectedOrder.user.username}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Status: {selectedOrder.status}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Total Price: ${selectedOrder.total}
              </Typography>
              <Typography variant="subtitle1">Products:</Typography>
              <List>
                {selectedOrder.items.map((item) => (
                  <ListItem key={item.product._id}>
                    <ListItemText
                      primary={`${item.product.name} (x${item.quantity})`}
                      secondary={`Price: $${item.product.price}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Orders;
