// controllers/dashboardController.js
const Restaurant = require('../models/resturant');
const Order = require('../models/orders');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    // عدد المطاعم
    const restaurantsCount = await Restaurant.countDocuments();

    // الطلبات لكل مطعم + المبيعات
    const ordersByRestaurant = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: { orderId: '$_id', restaurant: '$product.restaurant' },
          totalOrder: { $first: '$total' }
        }
      },
      {
        $group: {
          _id: '$_id.restaurant',
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$totalOrder' }
        }
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      { $unwind: '$restaurant' },
      {
        $project: {
          _id: 0,
          restaurantName: '$restaurant.name',
          totalOrders: 1,
          totalSales: 1
        }
      }
    ]);

    // عدد الموظفين
    const usersCount = await User.countDocuments();

    // توزيع الأدوار
    const roles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // عدد الطلبات لكل مستخدم + الاسم
    const ordersByUser = await Order.aggregate([
      { $group: { _id: '$user', totalOrders: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          username: '$user.username',
          totalOrders: 1
        }
      }
    ]);

    // احصائيات المستخدمين (الأونلاين + الوقت)
    const usersOnlineStats = await User.find({}, 'username role totalOnlineTime isOnline');

    res.json({
      restaurantsCount,
      ordersByRestaurant,
      usersCount,
      roles,
      ordersByUser,
      usersOnlineStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard stats', error: err.message });
  }
};
