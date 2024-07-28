# FoodExpress Backend

## Description

FoodExpress is a comprehensive food ordering and restaurant management system. The backend is built using Node.js, Express, and MongoDB. It provides RESTful APIs for managing user authentication, restaurant data, menu items, and orders. The backend also integrates with external services like Cloudinary for image uploads.

## Features

- User authentication with JWT stored in HTTP-only cookie
- Restaurant management (CRUD operations for restaurants, menus, and orders)
- Secure password storage with bcrypt
- User profile management
- Browse and search restaurants and menus
- Place and track orders
- Provide Ratings and Reviews
- Manage restaurant section for restaurant owners
- Restaurant Image upload and management with Cloudinary
- Data validation and error handling

## Technologies Used

- **Node.js**: Server-side JavaScript runtime
- **Express**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **React**: Frontend JavaScript library for building user interfaces

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- MongoDB instance (local or cloud-based)
- Cloudinary account for image uploads

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RonakR68/FoodExpress_backend.git
   cd FoodExpress_backend

2. Install dependencies
   ```bash
    npm install

3. Create a .env file in the root directory and add your configuration as per example.env
4. Start the server
   ```bash
    npm run dev
