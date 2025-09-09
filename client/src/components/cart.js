import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");

  const handleSnackClose = () => setSnackOpen(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/cart", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCartItems(res.data.items);
      } catch (err) {
        console.error(err);
        setSnackMessage("Failed to load cart items");
        setSnackSeverity("error");
        setSnackOpen(true);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `http://127.0.0.1:5000/api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setCartItems((prev) =>
        prev.map((item) =>
          item.product._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      setSnackMessage("Quantity updated");
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (err) {
      console.error(err);
      setSnackMessage("Failed to update quantity");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
      setSnackMessage("Item removed from cart");
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (err) {
      console.error(err);
      setSnackMessage("Failed to remove item");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const placeOrder = async (name, phone) => {
    if (!name || !phone) {
      setSnackMessage("Please enter customer name and phone");
      setSnackSeverity("error");
      setSnackOpen(true);
      return;
    }
    if (cartItems.length === 0) return;

    const orderData = {
      customerName: name,
      customerPhone: phone,
      items: cartItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      })),
      totalPrice,
    };

    try {
      await axios.post("http://127.0.0.1:5000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSnackMessage("Order placed successfully!");
      setSnackSeverity("success");
      setSnackOpen(true);
      setCartItems([]);
      setCustomerName("");
      setCustomerPhone("");
    } catch (err) {
      console.error(err);
      setSnackMessage("Failed to place order: " + (err.response?.data?.message || err.message));
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  // تصميم الصفحة بدون أي خلفية
  const containerStyle = {
    padding: "30px",
    minHeight: "90vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    flexDirection: "column",
  };

  const cardStyle = {
    display: "flex",
    alignItems: "center",
    borderRadius: "16px",
    padding: "20px",
    margin: "15px 0",
    background: "#ffffff",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  const cardHoverStyle = {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
  };

  const imgStyle = { width: "120px", height: "120px", borderRadius: "12px", objectFit: "cover", marginRight: "20px" };
  const inputStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    width: "250px",
    marginRight: "15px",
    outline: "none",
  };
  const totalStyle = { fontWeight: "bold", fontSize: "24px", marginTop: "20px", textAlign: "right", color: "#00796b" };

  const emptyStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#555",
    fontSize: "26px",
    padding: "50px",
    borderRadius: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#00796b" }}>Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div style={emptyStyle}>
          <p>Your cart is empty 😔</p>
          <p>Add some products to get started!</p>
        </div>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              key={item.product._id}
              style={cardStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
            >
              <img src={`http://127.0.0.1:5000/uploads/${item.product.image}`} alt={item.product.name} style={imgStyle} />
              <div style={{ flex: 1 }}>
                <h3 style={{ color: "#00796b" }}>{item.product.name}</h3>
                
                <p style={{ display: "flex", alignItems: "center", color: "#555" }}>
                  Quantity:
                  {/* زر الناقص */}
                  <Button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    size="small"
                    sx={{
                      minWidth: "35px",
                      height: "35px",
                      mx: 1,
                      fontWeight: "bold",
                      fontSize: "18px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ff8a65, #ff7043)",
                      color: "#fff",
                      transition: "all 0.3s ease",
                      '&:hover': { transform: "scale(1.2)", background: "linear-gradient(135deg, #ff7043, #ff5722)" },
                    }}
                  >
                    -
                  </Button>

                  {item.quantity}

                  {/* زر الزائد */}
                  <Button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    size="small"
                    sx={{
                      minWidth: "35px",
                      height: "35px",
                      mx: 1,
                      fontWeight: "bold",
                      fontSize: "18px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4db6ac, #26a69a)",
                      color: "#fff",
                      transition: "all 0.3s ease",
                      '&:hover': { transform: "scale(1.2)", background: "linear-gradient(135deg, #26a69a, #00796b)" },
                    }}
                  >
                    +
                  </Button>
                </p>

                <p style={{ color: "#00796b", fontWeight: "bold" }}>Price: ${item.product.price}</p>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeFromCart(item.product._id)}
                  style={{ marginTop: "10px" }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px", flexWrap: "wrap" }}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#00796b" }}>Customer Info</h3>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Customer Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={totalStyle}>Total: ${totalPrice}</div>
              <Button
                variant="contained"
                size="large"
                style={{ marginTop: "15px", backgroundColor: "#00796b" }}
                onClick={() => placeOrder(customerName, customerPhone)}
                disabled={cartItems.length === 0}
              >
                Place Order
              </Button>
            </div>
          </div>
        </>
      )}

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={handleSnackClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <MuiAlert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: "100%" }}>
          {snackMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default Cart;
