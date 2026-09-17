import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function seed() {
  console.log('Starting seed process...');
  
  try {
    // 1. Register a restaurant owner
    console.log('Registering owner...');
    const ownerRes = await axios.post(`${API_URL}/api/auth/register`, {
      email: 'owner@example.com',
      password: 'password123',
      name: 'Restaurant Owner',
      role: 'RESTAURANT_OWNER'
    });
    const ownerToken = ownerRes.data.accessToken;

    // 2. Register a customer
    console.log('Registering customer...');
    const customerRes = await axios.post(`${API_URL}/api/auth/register`, {
      email: 'customer@example.com',
      password: 'password123',
      name: 'Hungry Customer',
      role: 'CUSTOMER'
    });
    const customerToken = customerRes.data.accessToken;

    // 3. Register a driver
    console.log('Registering driver...');
    const driverRes = await axios.post(`${API_URL}/api/auth/register`, {
      email: 'driver@example.com',
      password: 'password123',
      name: 'Speedy Driver',
      role: 'DRIVER'
    });
    const driverToken = driverRes.data.accessToken;

    // 4. Create Restaurant
    console.log('Creating restaurant...');
    const restaurantRes = await axios.post(`${API_URL}/api/restaurants`, {
      name: 'Burger Palace',
      description: 'Best burgers in town',
      address: '123 Main St',
      phoneNumber: '555-0100'
    }, { headers: { Authorization: `Bearer ${ownerToken}` } });
    const restaurantId = restaurantRes.data.id;

    // 5. Create Menu Category
    console.log('Creating menu category...');
    const categoryRes = await axios.post(`${API_URL}/api/menus/categories`, {
      restaurantId,
      name: 'Mains',
      displayOrder: 1
    }, { headers: { Authorization: `Bearer ${ownerToken}` } });
    const categoryId = categoryRes.data.id;

    // 6. Create Menu Item
    console.log('Creating menu item...');
    await axios.post(`${API_URL}/api/menus/items`, {
      restaurantId,
      categoryId,
      name: 'Classic Burger',
      description: 'Beef patty, lettuce, tomato, cheese',
      price: 12.99
    }, { headers: { Authorization: `Bearer ${ownerToken}` } });

    console.log('Seed completed successfully!');
  } catch (error: any) {
    console.error('Seed failed:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

seed();
