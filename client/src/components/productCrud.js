import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import axios from 'axios';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default function BasicTable() {
    const [rows, setRows] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [apiCategories, setApiCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const [snackSeverity, setSnackSeverity] = useState('success'); // success أو error

    const handleSnackClose = () => {
     setSnackOpen(false);
    };


    React.useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('http://127.0.0.1:5000/api/products');
          setRows(response.data);
          const categoryResponse = await axios.get('http://127.0.0.1:5000/api/categories');
          setApiCategories(categoryResponse.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }, []);

  return (
    <TableContainer component={Paper}>
         <form onSubmit={async(e) => {
           e.preventDefault();

           if (!name || !description || !price || !category || !image) {
               alert("Please fill in all fields before submitting.");
               return; 
            }

           const productData = { name, description, price, category, image };
           try {
            if(editingProduct) {
      // Update existing product
      const response = await axios.put(
        `http://127.0.0.1:5000/api/products/${editingProduct._id}`,
        productData,
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      
      const categoryObj = apiCategories.find(cat => cat._id === response.data.category);
      setRows(rows.map(r => r._id === response.data._id ? { ...response.data, category: categoryObj } : r));
      setEditingProduct(null); 

       setSnackMessage('Product updated successfully!');
       setSnackSeverity('success');
       setSnackOpen(true);

    } else {
      // Create new product
      const response = await axios.post('http://127.0.0.1:5000/api/products', productData, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      const categoryObj = apiCategories.find(cat => cat._id === response.data.category);
      setRows([...rows, { ...response.data, category: categoryObj }]);

      setSnackMessage('Product added successfully!');
      setSnackSeverity('success');
      setSnackOpen(true);
    }
           } catch (error) {
            console.error(error);

            setSnackMessage('Failed to save product: ' + (error.response?.data?.message || error.message));
            setSnackSeverity('error');
            setSnackOpen(true);

           }
           

           setName('');
           setDescription('');
           setPrice('');
           setCategory('');
           setImage('');
         }}>
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Description"
        variant="outlined"
        fullWidth
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
       <TextField
        label="Price"
        variant="outlined"
        fullWidth
        margin="normal"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
       <InputLabel id="demo-simple-select-label">Category</InputLabel>
        <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    value={category}
    label="Category"
    onChange={(e) => setCategory(e.target.value)}
  >
    {apiCategories.map((cat) => (
      <MenuItem key={cat._id} value={cat._id}>
        {cat.name}
      </MenuItem>
    ))}
  </Select>
       <TextField
        label="Image URL"
        variant="outlined"
        fullWidth
        margin="normal"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <Button
      variant="contained"
      color="primary"
      type="submit"
      >
        {editingProduct ? "Update" : "Submit"}
      </Button>

    </form>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Category</TableCell>
            <TableCell align="right">Image</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.description}</TableCell>
              <TableCell align="right">{row.price}</TableCell>
              <TableCell align="right">{row.category.name}</TableCell>
              <TableCell align="right"><img src={row.image} alt={row.name} style={{ width: '100px' }} /></TableCell>
               <TableCell align="right">
                <Button onClick={() => {
                   setEditingProduct(row);
                   setName(row.name);
                   setDescription(row.description);
                   setPrice(row.price);
                   setCategory(row.category._id);
                   setImage(row.image);
               }}>
                   Update
               </Button>

                <Button onClick={async()=>{
                    if(window.confirm("Are you sure you want to delete this product?")) {
                      try {
                        await axios.delete(`http://127.0.0.1:5000/api/products/${row._id}`, {
                          headers: {
                            "Authorization": `Bearer ${localStorage.getItem('token')}`
                          }
                        });
                        setRows(rows.filter(r => r._id !== row._id));
                      } catch (error) {
                        console.error(error);
                      }
                    }
                }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={handleSnackClose}>
        <MuiAlert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: '100%' }}>
             {snackMessage}
        </MuiAlert>
      </Snackbar>
    </TableContainer>
  );
}
