import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import axios from "axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  // جلب بيانات السلة عند تحميل الصفحة
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/cart/get-cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        setCartItems(res.data.items);
      } catch (err) {
        console.error("Error fetching cart items:", err);
      }
    };
    fetchCart();
  }, []);

  // إزالة منتج من السلة
  const removeFromCart = async (productId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:5000/api/cart/remove-from-cart/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCartItems((prev) =>
        prev.filter((item) => item.product._id !== productId)
      );
    } catch (err) {
      console.error("Error removing cart item:", err);
    }
  };

  // حساب المجموع الكلي
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // إرسال الطلب
  const placeOrder = async () => {
    if (cartItems.length === 0) return;

    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      })),
      totalPrice,
    };

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/orders/place-order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Order placed successfully!");
      setCartItems([]); // تفريغ السلة بعد الطلب
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order: " + err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cartItems.map((item) => (
            <li
              key={item.product._id}
              style={{
                border: "1px solid #ccc",
                margin: "10px 0",
                padding: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={`http://127.0.0.1:5000/uploads/${item.product.image}`}
                alt={item.product.name}
                style={{ width: "100px", height: "100px", marginRight: "20px" }}
              />
              <div style={{ flex: 1 }}>
                <h3>{item.product.name}</h3>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.product.price}</p>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => removeFromCart(item.product._id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cartItems.length > 0 && (
        <div style={{ marginTop: "20px", fontWeight: "bold" }}>
          Total: ${totalPrice}
        </div>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={placeOrder}
        disabled={cartItems.length === 0}
        style={{ marginTop: "20px" }}
      >
        Place Order
      </Button>
    </div>
  );
};

export default Cart;
