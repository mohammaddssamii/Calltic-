import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { Account } from '@toolpad/core/Account';
import { DemoProvider, useDemoRouter } from '@toolpad/core/internal';
import { Button } from '@mui/material';
import { useEffect,useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ProfilePage from './profilePage';
import RedeemIcon from '@mui/icons-material/Redeem';
import ProductCrud from './productCrud';
import { Category } from './category';
import CategoryIcon from '@mui/icons-material/Category';
import DisplayProduct from './displayProduct';
import Cart from './cart';
import  Order  from './orders';
import RestaurantPage from './resturant';


const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname, profileData }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {pathname === '/profile' && (
        <ProfilePage profileData={profileData} />
      )}
      {pathname === '/orders' && (
        <Order />
      )}
      {pathname === '/DisplayProduct' && (
        <DisplayProduct />
      )}
       {pathname === '/Cart' && (
        <Cart />
      )}
      {pathname === '/product' && (
       <ProductCrud />
      )}
      
      {pathname === '/category' && (
       <Category />
      )}
      {pathname === '/restaurant' && (
       <RestaurantPage />
      )}
      <Typography variant="body1">Current page: {pathname}</Typography>
      
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function ToolbarActionsSearch({ onLogout }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        sx={{ display: { xs: 'none', md: 'inline-block' }, mr: 1 }}
      />
      <ThemeSwitcher />
      <Account />
      <Tooltip title="Logout">
        <Button variant="outlined" color="error" onClick={onLogout}>
          Logout
        </Button>
      </Tooltip>
    </Stack>
  );
}

ToolbarActionsSearch.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

function SidebarFooter({ mini }) {
  return (
    <Typography
      variant="caption"
      sx={{ m: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}
    >
      {mini ? '©LIGHTIC' : `© ${new Date().getFullYear()} Made with love by LIGHTIC`}
    </Typography>
  );
}

SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};

function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <CloudCircleIcon fontSize="large" color="primary" />
      <Typography variant="h6">MY APP</Typography>
      <Chip size="small" label="LIGHTIC" color="info" />
      <Tooltip title="Connected to production">
        <CheckCircleIcon color="success" fontSize="small" />
      </Tooltip>
    </Stack>
  );
}

function DashboardLayoutSlots(props) {
  
    const navigation = useNavigate();
    const [profileData, setProfileData] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'DisplayProduct',
    title: 'Display Product',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'Cart',
    title: 'Cart',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'profile',
    title: 'Profile',
    icon: <AccountBoxIcon />,
  },
 
  ...(isAdmin ? [{segment: 'product',
    title: 'Product',
    icon: <RedeemIcon />,
  },
  {
    segment: 'category',
    title: 'Category',
    icon: <CategoryIcon />,
  },
  {
    segment: 'restaurant',
    title: 'Restaurant',
    icon: <CategoryIcon />,
  },
  ]:[]), // Only show this item if the user is an admin
  
];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            async function fetchProfile() {
                try {
                    const response = await axios.get('http://localhost:5000/api/users/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.status === 200) {
                        setProfileData(response.data);
                        setIsAdmin(response.data.role === 'admin'); // Check if the user is an admin
                    } else {
                        console.error('Failed to fetch profile:', response.status);
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    navigation('/login'); // Redirect to login if there's an error
                }
            }
            fetchProfile();
        }
    }, []);
  const { window, onLogout } = props;

  const router = useDemoRouter('/dashboard');

  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout
          slots={{
            appTitle: CustomAppTitle,
            toolbarActions: () => <ToolbarActionsSearch onLogout={onLogout} />,
            sidebarFooter: SidebarFooter,
          }}
        >
            {profileData.role ? (
                <p>Welcome {profileData.role ? profileData.role : 'not found '} </p>
            ) : (
                <p>Loading profile...</p>
            )}
          <DemoPageContent profileData={profileData} pathname={router.pathname} />
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}

DashboardLayoutSlots.propTypes = {
  window: PropTypes.func,
  onLogout: PropTypes.func.isRequired,
};

export default DashboardLayoutSlots;
