# Synergia Event Booking API

This is a Node.js and Express-based REST API for managing event bookings. It uses MongoDB for data storage.

## Features
- Create, read, update, and delete bookings.
- Search bookings by email.
- Filter bookings by event.
- Validate input fields.
- Store data in MongoDB.

## Prerequisites
- Node.js installed on your system.
- MongoDB instance (local or cloud-based, e.g., MongoDB Atlas).

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
2. Install dependencies:
   npm install
3. Set up the .env file:
   Create a .env file in the root directory of the project.
   Add your MongoDB connection string to the .env file:
   ```bash
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/synergia_db?retryWrites=true&w=majority
   Replace <username> and <password> with your MongoDB credentials.
4. Start the server:
   npx nodemon [synergia.js](http://_vscodecontentref_/4)
5. Test the API:
   Use Postman or any API client to test the endpoints.
