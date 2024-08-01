# E-Commerce API

## Description

This is an ecommerce store API that involves regular users and admin users

## Features

- Admin can create, update, and delete products.
- Users can view all products and checkout product.
- Pagination support for product.
- Testing with jest and supertest.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Masterprecie/e-commerce-api.git
   ```
2. Navigate to the project directory:
   ```sh
   cd e-commerce-api
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables (create a `.env` file):

   ```env
   MONGODB_URL=your_database_connection_string
   AUTH_KEY=your_auth_key
   EMAIL_USERNAME=oyour_email_username_for_sending_email_from_google
   EMAIL_PASSWORD=oyour_email_password_for_sending_email_from_google
   CLOUD_NAME=ypur_cloudinary_name
   API_KEY=ypur_cloudinary_api_key
   API_SECRET=ypur_cloudinary_api_secret

   ```

5. Start the application:

```sh
npm run dev
```

## Usage

### Admin

- **Create a product**: Admin can create a new product by sending a POST request to `/product` with the product details.
- **get all product**: Admin can get all existing products by sending a GET request to `/products/:page/:limit`
- **get single product**: Admin can get a product by sending a GET request to `/product/:productId`
- **Update a product**: Admin can update an existing quiz by sending a PUT request to `/product/:productId` with the updated details.
- **Delete a product**: Admin can delete a quiz by sending a DELETE request to `/product/:productId`.

### Users

- **View all products**: Users can participate in a quiz by sending a GET request to `/products/:page/:limit`.
- **Create a product order**: Users can create a product order by sending a GET request to `/product/order`.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- Jest

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License.

## Documentation

```sh
https://documenter.getpostman.com/view/21468149/2sA3kd9xPT
```
