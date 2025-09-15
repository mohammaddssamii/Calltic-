import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Snackbar,
  Alert,
  Drawer,
  IconButton,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
} from "@mui/material";
import { styled, keyframes } from "@mui/system";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";

// Slide Transition for Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Shake animation for Dialog
const shake = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(8px); }
  100% { transform: translateX(0); }
`;

// Neon Glow animations for different categories
const neonColors = {
  Appetizers: "#0ff",
  Drinks: "#0f0",
  Desserts: "#ff00ff",
  Others: "#ff4500",
};
const neonGlow = (color) => keyframes`
  0% { box-shadow: 0 0 5px ${color}, 0 0 10px ${color}; }
  50% { box-shadow: 0 0 15px ${color}, 0 0 30px ${color}; }
  100% { box-shadow: 0 0 5px ${color}, 0 0 10px ${color}; }
`;

// Styled Components
const StyledCard = styled(Card)(({ glowColor }) => ({
  transition: "transform 0.3s, box-shadow 0.3s",
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-5px)",
    animation: `${neonGlow(glowColor)} 1.5s infinite`,
  },
}));

const StyledButton = styled(Button)({
  marginTop: "10px",
  borderRadius: 8,
  fontWeight: "bold",
});

const DisplayProduct = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [products, setProducts] = useState({}); // grouped by category
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);
  // eslint-disable-next-line
  const [cartRestaurantId, setCartRestaurantId] = useState(null);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);


  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(100);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/restaurants");
        setRestaurants(res.data);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      }
    };
    fetchRestaurants();
  }, []);

  const fetchProducts = async (restaurantId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/products/restaurant/${restaurantId}`
      );
      const grouped = {};
      res.data.forEach((product) => {
        const categoryName = product.category?.name || "Others";
        if (!grouped[categoryName]) grouped[categoryName] = [];
        grouped[categoryName].push(product);
      });
      setProducts(grouped);
      setSelectedRestaurant(
        restaurants.find((r) => r._id === restaurantId) || null
      );
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

 const fetchCart = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:5000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCart(res.data.items || []);
    if (res.data.items && res.data.items.length > 0) {
      setCartRestaurantId(res.data.items[0].product.restaurant._id);
    } else {
      setCartRestaurantId(null);
    }
  } catch (err) {
    console.error("Error fetching cart:", err);
  }
};

 const addToCart = async (product) => {
  try {
    // 1️⃣ جلب السلة الحالية من backend قبل أي إضافة
    const res = await axios.get("http://127.0.0.1:5000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const currentItems = res.data.items || [];
    const currentRestaurantId = currentItems.length > 0 
      ? currentItems[0].product.restaurant._id 
      : null;

    // 2️⃣ التحقق من المطعم
    if (currentRestaurantId && currentRestaurantId !== product.restaurant._id) {
      setSnackMessage(
        "⚠️ You cannot add products from a different restaurant. Please clear your cart first!"
      );
      setSnackSeverity("warning");
      setSnackOpen(true);
      return;
    }

    // 3️⃣ إضافة المنتج
    await axios.post(
      "http://127.0.0.1:5000/api/cart",
      { productId: product._id, quantity: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 4️⃣ تحديث السلة من backend مباشرة
    fetchCart();

    setSnackMessage("Product added to cart!");
    setSnackSeverity("success");
    setSnackOpen(true);

  } catch (err) {
    console.error("Error adding to cart:", err.response || err);
    setSnackMessage("Failed to add product to cart.");
    setSnackSeverity("error");
    setSnackOpen(true);
  }
};


  const updateQuantity = async (productId, newQty) => {
    if (newQty <= 0) {
      setProductToRemove(productId);
      setConfirmDialogOpen(true);
      return;
    }
    try {
      await axios.put(
        `http://127.0.0.1:5000/api/cart/${productId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackMessage("Item removed from cart!");
      setSnackSeverity("info");
      setSnackOpen(true);
      fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err);
      setSnackMessage("Failed to remove item.");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
    setConfirmDialogOpen(false);
    setProductToRemove(null);
  };
  const clearCart = async () => {
  try {
    await axios.delete("http://127.0.0.1:5000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSnackMessage("🗑️ Cart cleared successfully!");
    setSnackSeverity("info");
    setSnackOpen(true);
    fetchCart(); // تحديث السلة بعد الحذف
  } catch (err) {
    console.error("Error clearing cart:", err);
    setSnackMessage("Failed to clear cart.");
    setSnackSeverity("error");
    setSnackOpen(true);
  }
};


  const handleConfirmCart = () => {
    setSnackMessage(
      "✅ Your cart has been saved successfully! Please review your order in the Cart page before final confirmation."
    );
    setSnackSeverity("info");
    setSnackOpen(true);
  };

  const handleSnackClose = () => setSnackOpen(false);

  // --- FILTER + SEARCH + SORT FOR ALL & SELECTED CATEGORY ---
  const getProductsByCategory = () => {
    const result = {};
    Object.entries(products).forEach(([category, items]) => {
      let filteredItems = items.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          p.price <= maxPrice
      );

      if (sortOrder === "asc") filteredItems.sort((a, b) => a.price - b.price);
      else filteredItems.sort((a, b) => b.price - a.price);

      if (filteredItems.length > 0) result[category] = filteredItems;
    });

    if (selectedCategory !== "All") {
      return result[selectedCategory] ? { [selectedCategory]: result[selectedCategory] } : {};
    }
    return result;
  };

  const displayedProducts = getProductsByCategory();

  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h4"
        sx={{ marginBottom: 3, fontWeight: "bold", textAlign: "center" }}
      >
        {selectedRestaurant
          ? `${selectedRestaurant.name} - Menu`
          : "Choose a Restaurant"}
      </Typography>

      {!selectedRestaurant && (
        <Grid container spacing={4} justifyContent="center">
          {restaurants.map((rest) => (
            <Grid item key={rest._id} xs={12} sm={6} md={4} lg={4}>
              <StyledCard glowColor="#0ff" onClick={() => fetchProducts(rest._id)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://127.0.0.1:5000/uploads/${rest.image}`}
                  alt={rest.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h6">{rest.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rest.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rest.phoneNumber}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedRestaurant && (
        <>
          <Button variant="outlined" sx={{ mb: 2 }} onClick={() => setSelectedRestaurant(null)}>
            ⬅ Back to Restaurants
          </Button>

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap",justifyContent: "center", }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ width: 200 }}>
              <Typography variant="body2">Max Price: ${maxPrice}</Typography>
              <Slider
                value={maxPrice}
                min={1}
                max={200}
                step={1}
                onChange={(e, newVal) => setMaxPrice(newVal)}
                valueLabelDisplay="auto"
              />
            </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {Object.keys(products).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOrder}
                label="Sort By"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">Price (Low → High)</MenuItem>
                <MenuItem value="desc">Price (High → Low)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {Object.entries(displayedProducts).map(([category, items]) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                {category}
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                {items.map((product, index) => (
                  <Grid item key={product._id} xs={12} sm={6} md={4} lg={4}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <StyledCard glowColor={neonColors[product.category] || "#ff4500"}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={`http://127.0.0.1:5000/uploads/${product.image}`}
                          alt={product.name}
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent>
                          <Typography variant="h6">{product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.description}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            ${product.price}
                          </Typography>
                          <StyledButton
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => addToCart(product)}
                          >
                            Add to Cart
                          </StyledButton>
                        </CardContent>
                      </StyledCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </>
      )}

      {/* Cart Icon */}
      <IconButton
        onClick={() => {
          fetchCart();
          setDrawerOpen(true);
        }}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": { backgroundColor: "primary.dark" },
        }}
      >
        <Badge badgeContent={cart.reduce((acc, item) => acc + item.quantity, 0)} color="error">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 350, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Your Cart</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2 }} />
          {cart.length === 0 ? (
            <Typography>No items in cart</Typography>
          ) : (
            cart.map((item) => (
              <Box
                key={item.product._id}
                display="flex"
                flexDirection="column"
                sx={{ mb: 2, p: 1, borderRadius: 2, border: "1px solid #eee" }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{item.product.name}</Typography>
                  <Typography variant="subtitle1">${item.product.price * item.quantity}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                      size="small"
                      sx={{ bgcolor: "error.light", color: "white", "&:hover": { bgcolor: "error.main" } }}
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      sx={{ bgcolor: "success.light", color: "white", "&:hover": { bgcolor: "success.main" } }}
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setProductToRemove(item.product._id);
                      setConfirmDialogOpen(true);
                    }}
                  >
                    Remove
                  </Button>
                </Box>
                 {/* 👇 ضيف الـ TextField هون */}
    <TextField
      label="Add a note"
      variant="outlined"
      size="small"
      fullWidth
      value={item.note || ""}
      onChange={(e) => {
        const newNote = e.target.value;
        setCart((prevCart) =>
          prevCart.map((c) =>
            c.product._id === item.product._id ? { ...c, note: newNote } : c
          )
        );

        axios.put(
          `http://127.0.0.1:5000/api/cart/${item.product._id}/note`,
          { note: newNote },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch((err) => console.error("Error saving note:", err));
      }}
      sx={{ mt: 1 }}
    />
              </Box>
            ))
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">
            Total: ${cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)}
          </Typography>
          <StyledButton variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={handleConfirmCart}>
            Confirm Order
          </StyledButton>
         <StyledButton
  variant="outlined"
  color="error"
  fullWidth
  sx={{ mt: 2 }}
  onClick={() => setConfirmClearDialogOpen(true)}
>
  Clear Cart
</StyledButton>


        </Box>
      </Drawer>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setConfirmDialogOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            animation: confirmDialogOpen ? `${shake} 0.5s` : "none",
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: "#f44336", color: "white" }}>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this item from your cart?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={() => removeFromCart(productToRemove)}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Clear Cart Dialog */}
      <Dialog
  open={confirmClearDialogOpen}
  TransitionComponent={Transition}
  keepMounted
  onClose={() => setConfirmClearDialogOpen(false)}
  sx={{
    "& .MuiDialog-paper": {
      animation: confirmClearDialogOpen ? `${shake} 0.5s` : "none",
    },
  }}
>
  <DialogTitle sx={{ bgcolor: "#f44336", color: "white" }}>Confirm Clear Cart</DialogTitle>
  <DialogContent>
    <Typography>Are you sure you want to clear your entire cart?</Typography>
  </DialogContent>
  <DialogActions>
    <Button variant="outlined" color="primary" onClick={() => setConfirmClearDialogOpen(false)}>
      Cancel
    </Button>
    <Button
      variant="contained"
      color="error"
      onClick={() => {
        clearCart(); // دالة حذف الكارت
        setConfirmClearDialogOpen(false);
      }}
    >
      Clear Cart
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
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: "100%" }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DisplayProduct;
