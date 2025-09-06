import React from "react";
import axios from "axios";
import { useEffect,useState } from "react";

const DisplayProduct = () => {
    const [products, setProducts] = useState([]);

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
          const token = localStorage.getItem('token');
          const response = await axios.post("http://127.0.0.1:5000/api/cart/add-to-cart", { productId, quantity: 1 }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200) {
            console.log("Product added to cart:", response.data);
            alert("Product added to cart");
          }
        } catch (error) {
          console.error("Error adding product to cart:", error);
        }
    };

    return (
        <div>
            <h2>Product List</h2>
            <ul>
                {products.map(product => (
                    <div key={product._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                        <img src={`http://127.0.0.1:5000/uploads/${product.image}`} alt={product.name} style={{ width: '100px', height: '100px' }} />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>Price: ${product.price}</p>
                        <p>Category: {product.category.name}</p>
                        <button onClick={() => addToCart(product._id)}>Add to Cart</button>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default DisplayProduct;
