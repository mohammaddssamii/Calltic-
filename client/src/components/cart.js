import React,{useEffect,useState} from "react";

import axios from "axios";

const Cart = ()=>{
    const [cartItems, setCartItems] = useState([]);
    
    useEffect(()=>{
       axios.get("http://127.0.0.1:5000/api/cart/get-cart",{
           headers:{
               Authorization:`Bearer ${localStorage.getItem('token')}`,
               "Content-Type":"application/json"
           }
       }).then(res=>{
           setCartItems(res.data.items);
       }).catch(err=>{
           console.error("Error fetching cart items:",err);
       })
    },[])
    const removeFromCart = (productId) => {
        axios.delete(`http://127.0.0.1:5000/api/cart/remove-from-cart/${productId}`,{
            headers:{
                Authorization:`Bearer ${localStorage.getItem('token')}`,
                "Content-Type":"application/json"
            }
        }).then((res)=>{
            setCartItems(cartItems.filter(item=>item.product._id !== productId));
        }).catch(err=>{
            console.error("Error removing cart item:",err);
        })
    }
    return(
        <div>
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <ul>
                    {cartItems.map(item=>(
                        <li key={item.product._id} style={{border:'1px solid #ccc',margin:'10px',padding:'10px'}}>
                            <img src={`http://127.0.0.1:5000/uploads/${item.product.image}`} alt={item.product.name} style={{width:'100px',height:'100px'}} />
                            <div>
                                <h3>{item.product.name}</h3>
                                <p>Quantity: {item.quantity}</p>
                                <button onClick={() => removeFromCart(item.product._id)}>Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default Cart;
