# FoodExpress Backend

## Description

This is backend repository for FoodExpress app. You can find Frontend repository [here](https://github.com/RonakR68/FoodExpress_frontend).

FoodExpress is a food ordering and restaurant management web application. The backend is built using Node.js, Express, and MongoDB. It provides RESTful APIs for managing user authentication, restaurant data, menu items, and orders. It uses Python Flask and sci-kit learn for restaurant recommendation system based on user collaborative filtering. The backend also integrates with external services like Cloudinary for image uploads.

[Live Webiste Link](https://foodexpress-frontend-g6dx.onrender.com/)

## Features

- **User Authentication**: User authentication using JWT stored in HTTP-only cookie. Users can also use Google account for fast and secure login.
- **Restaurant Management**: Add and manage restaurant details, menu items and orders.
- **Secure Password Storage**: Passwords are hashed using bcrypt for security.
- **User Profile Management**: Users can manage their profile details and can manage addresses.
- **Restaurant Browsing and Search**: Users can browse and search for available restaurants and their menu items.
- **Order Placement and Tracking**: Users can place and track their active orders status and can also view past orders details.
- **Ratings and Reviews**: Users can provide ratings and reviews for restaurants and food items.
- **Restaurant Recommendation System**: Collaborative-based recommendation system to suggest restaurants based on similar user preferences.
- **Responsive Design**: Modern UI with responsive design to ensure a seamless experience for users.
- **Image Upload and Management**: Restaurant image uploads are managed through Cloudinary.
- **Data Validation and Error Handling**: Validation and error handling across the application.
- **Dark Mode Support**: Option for users to switch to dark mode for a better viewing experience.


## Technologies Used

- **Node.js**
- **Express**
- **MongoDB**
- **React**
- **Vite**
- **Tailwind CSS**
- **Shadcn UI**
- **Python Flask**
- **sci-kit learn**

## Getting Started

### Prerequisites

- Node.js, npm and python installed on your machine
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

3. Set up Python environment for the recommendation system
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install flask scikit-learn

4. Create a .env file in the root directory and add your configuration as per example.env

5. Start the server
   ```bash
    npm run dev

6. Navigate to src/controllers directory and start the python flask recommendation service
   ``` cd ./src/controllers
   python3 RecommendationsController.py

