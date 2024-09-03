const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB, getDB } = require('./db');
const { ObjectId } = require('mongodb');



// Setup
const app = express();
const port = 3000;

// Connect to MongoDB
connectDB();
// Home Route
app.get('/', (req, res) => {
  res.render('index');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// List Users
app.get('/users', async (req, res) => {
  const db = getDB();
  const users = await db.collection('users').find().toArray();
  res.render('users/index', { users });
});

// Show User Form
app.get('/users/new', (req, res) => {
  res.render('users/new');
});

// Create User
app.post('/users', async (req, res) => {
  const db = getDB();
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    phone_number: req.body.phone_number,
    address: req.body.address,
    order_history: []
  };
  await db.collection('users').insertOne(user);
  res.redirect('/users');
});

// Show Edit Form
app.get('/users/:id/edit', async (req, res) => {
  const db = getDB();
  const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });  
  res.render('users/edit', { user });
});

// Update User
app.post('/users/:id', async (req, res) => {
  const db = getDB();
  const updatedUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    phone_number: req.body.phone_number,
    address: req.body.address
  };
  await db.collection('users').updateOne({ _id: new ObjectId(req.params.id) }, { $set: updatedUser });  
  res.redirect('/users');
});

// Delete User
app.post('/users/:id/delete', async (req, res) => {
  const db = getDB();
  try {
    await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });  
    res.redirect('/users');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
});
// Menu Routes

// List Menu Items
app.get('/menu', async (req, res) => {
  const db = getDB();
  const menuItems = await db.collection('menu').find().toArray();
  res.render('menu/index', { menuItems });
});

// Show Add Menu Item Form
app.get('/menu/new', (req, res) => {
  res.render('menu/new');
});

// Create Menu Item
app.post('/menu', async (req, res) => {
  const db = getDB();
  const menuItem = {
    name: req.body.name,
    description: req.body.description,
    price: parseFloat(req.body.price),
    category: req.body.category,
    availability_status: req.body.availability_status
  };
  await db.collection('menu').insertOne(menuItem);
  res.redirect('/menu');
});


// Show Edit Menu Item Form
app.get('/menu/:id/edit', async (req, res) => {
  try {
    const db = getDB();
    const menuItem = await db.collection('menu').findOne({ _id: new ObjectId(req.params.id) });
    const menuItems = await db.collection('menu').find().toArray(); // Fetch all menu items if needed
    res.render('menu/edit', { menuItem, menuItems });
  } catch (error) {
    res.status(500).send('Error retrieving menu item');
  }
});

// Update Menu Item
app.post('/menu/:id', async (req, res) => {
  const db = getDB();
  const updatedMenuItem = {
    name: req.body.name,
    description: req.body.description,
    price: parseFloat(req.body.price),
    category: req.body.category,
    availability_status: req.body.availability_status
  };
  await db.collection('menu').updateOne({ _id: new ObjectId(req.params.id) }, { $set: updatedMenuItem });
  res.redirect('/menu');
});

// Delete Menu Item
app.post('/menu/:id/delete', async (req, res) => {
  const db = getDB();
  await db.collection('menu').deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect('/menu');
});

  function isValidObjectId(id) {
  return ObjectId.isValid(id) && (new ObjectId(id).toString() === id);
}

// List Orders
app.get('/orders', async (req, res) => {
  try {
    const db = getDB();
    const orders = await db.collection('orders').find().toArray();
    res.render('orders/index', { orders });
  } catch (error) {
    res.status(500).send('Error retrieving orders');
  }
});

// Show Add Order Form
app.get('/orders/new', async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users').find().toArray();
    res.render('orders/new', { users });
  } catch (error) {
    res.status(500).send('Error retrieving users');
  }
});

// Create Order
app.post('/orders', async (req, res) => {
  try {
    const db = getDB();
    const order = {
      user_id: req.body.user_id, 
      order_date: new Date(req.body.order_date),
      order_items: JSON.parse(req.body.order_items), 
      total_amount: parseFloat(req.body.total_amount),
      order_status: req.body.order_status,
      payment_status: req.body.payment_status,
      special_requests: req.body.special_requests
    };
    const result = await db.collection('orders').insertOne(order);
    const orderId = result.insertedId; 
    res.redirect(`/orders/success/${orderId}`); 
  } catch (error) {
    res.status(500).send('Error creating order');
  }
});

// Show Edit Order Form
app.get('/orders/:id/edit', async (req, res) => {
  try {
    const db = getDB();
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
    const users = await db.collection('users').find().toArray();
    res.render('orders/edit', { order, users });
  } catch (error) {
    res.status(500).send('Error retrieving order');
  }
});

// Update Order
app.post('/orders/:id', async (req, res) => {
  try {
    const db = getDB();
    const updatedOrder = {
      user_id: req.body.user_id,
      order_date: new Date(req.body.order_date),
      order_items: JSON.parse(req.body.order_items), 
      total_amount: parseFloat(req.body.total_amount),
      order_status: req.body.order_status,
      payment_status: req.body.payment_status,
      special_requests: req.body.special_requests
    };
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updatedOrder }
    );
    if (result.matchedCount === 0) {
      return res.status(404).send('Order not found');
    }
    res.redirect('/orders');
  } catch (error) {
    res.status(500).send('Error updating order');
  }
});

// Delete Order
app.post('/orders/:id/delete', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('orders').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).send('Order not found');
    }
    res.redirect('/orders');
  } catch (error) {
    res.status(500).send('Error deleting order');
  }
});

// Success Page Route
app.get('/orders/success/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    res.render('orders/success', { orderId });
  } catch (error) {
    res.status(500).send('Error displaying success page');
  }
});


// List Reservations
app.get('/reservations', async (req, res) => {
  const db = getDB();
  const reservations = await db.collection('reservations').find().toArray();
  res.render('reservations/index', { reservations });
});

// Show Add Reservation Form
app.get('/reservations/new', (req, res) => {
  res.render('reservations/new');
});

// Create Reservation
app.post('/reservations', async (req, res) => {
  const db = getDB();
  const { user_name, user_email, user_phone, reservation_date, reservation_time, number_of_guests, special_requests } = req.body;

  // Check if the user already exists
  let user = await db.collection('users').findOne({ email: user_email });

  // If user does not exist, create a new user
  if (!user) {
    user = {
      name: user_name,
      email: user_email,
      phone: user_phone
    };
    const result = await db.collection('users').insertOne(user);
    user._id = result.insertedId;
  }

  const reservation = {
    user_id: user._id, 
    reservation_date: new Date(reservation_date),
    reservation_time: reservation_time,
    number_of_guests: parseInt(number_of_guests, 10),
    special_requests: special_requests
  };

  await db.collection('reservations').insertOne(reservation);
  res.redirect('/reservations');
});

// Show Edit Reservation Form
app.get('/reservations/:id/edit', async (req, res) => {
  const db = getDB();
  const reservation = await db.collection('reservations').findOne({ _id: new ObjectId(req.params.id) });
  const users = await db.collection('users').find().toArray();
  res.render('reservations/edit', { reservation, users });
});

// Update Reservation
app.post('/reservations/:id', async (req, res) => {
  const db = getDB();
  const { user_name, user_email, user_phone, reservation_date, reservation_time, number_of_guests, special_requests } = req.body;

  // Check if the user already exists
  let user = await db.collection('users').findOne({ email: user_email });

  // If user does not exist, create a new user
  if (!user) {
    user = {
      name: user_name,
      email: user_email,
      phone: user_phone
    };
    const result = await db.collection('users').insertOne(user);
    user._id = result.insertedId;
  }

  const updatedReservation = {
    user_id: user._id, 
    reservation_date: new Date(reservation_date),
    reservation_time: reservation_time,
    number_of_guests: parseInt(number_of_guests, 10),
    special_requests: special_requests
  };

  await db.collection('reservations').updateOne({ _id: new ObjectId(req.params.id) }, { $set: updatedReservation });
  res.redirect('/reservations');
});

// Delete Reservation
app.post('/reservations/:id/delete', async (req, res) => {
  const db = getDB();
  await db.collection('reservations').deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect('/reservations');
});



  // List Reviews
app.get('/reviews', async (req, res) => {
  const db = getDB();
  const reviews = await db.collection('reviews').find().toArray();
  res.render('reviews/index', { reviews });
});

// Show Add New Review Form
app.get('/reviews/new', async (req, res) => {
  const db = getDB();
  const users = await db.collection('users').find().toArray();
  res.render('reviews/new', { users });
});

// Create Review
app.post('/reviews', async (req, res) => {
  const db = getDB();
  const review = {
    user_name: req.body.user_name, 
    user_email: req.body.user_email,
    user_phone: req.body.user_phone,
    rating: parseInt(req.body.rating, 10),
    comment: req.body.comment,
    review_date: new Date(req.body.review_date)
  };
  await db.collection('reviews').insertOne(review);
  res.redirect('/reviews');
});

// Show Edit Review Form
app.get('/reviews/:id/edit', async (req, res) => {
  const db = getDB();
  const review = await db.collection('reviews').findOne({ _id: new ObjectId(req.params.id) });
  const users = await db.collection('users').find().toArray();
  res.render('reviews/edit', { review, users });
});

// Update Review
app.post('/reviews/:id', async (req, res) => {
  const db = getDB();
  const updatedReview = {
    rating: parseInt(req.body.rating, 10),
    comment: req.body.comment,
    review_date: new Date(req.body.review_date)
  };
  await db.collection('reviews').updateOne({ _id: new ObjectId(req.params.id) }, { $set: updatedReview });
  res.redirect('/reviews');
});

// Delete Review
app.post('/reviews/:id/delete', async (req, res) => {
  const db = getDB();
  await db.collection('reviews').deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect('/reviews');
});
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });