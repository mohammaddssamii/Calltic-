import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, Card, CardMedia, CardContent, Typography, Button, Snackbar, Alert } from "@mui/material";
import { styled } from "@mui/system";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
}));

const StyledButton = styled(Button)({
  marginTop: "10px",
  borderRadius: 8,
  fontWeight: "bold",
});

const DisplayProduct = () => {
  const [products, setProducts] = useState([]);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:5000/api/cart",
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setSnackMessage("Product added to cart successfully!");
        setSnackSeverity("success");
        setSnackOpen(true);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      setSnackMessage("Failed to add product to cart.");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const handleSnackClose = () => setSnackOpen(false);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: "bold", textAlign: "center" }}>
        Our Products
      </Typography>

      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
            <StyledCard>
              <CardMedia
                component="img"
                height="200"
                image={`http://127.0.0.1:5000/uploads/${product.image}`}
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                  {product.description}
                </Typography>
                <Typography variant="subtitle1" sx={{ marginTop: 1, fontWeight: "bold" }}>
                  ${product.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {product.category.name}
                </Typography>
                <StyledButton
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => addToCart(product._id)}
                >
                  Add to Cart
                </StyledButton>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: "100%" }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DisplayProduct;
