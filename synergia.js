require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

console.log("MONGO_URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// Define the Booking Schema
const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, match: /^\S+@\S+\.\S+$/, trim: true },
    event: { type: String, required: true, trim: true },
    ticketType: { type: String, required: true, enum: ['Regular', 'VIP'], default: 'Regular' },
    createdAt: { type: Date, default: Date.now }
});

// Create the Booking Model
const Booking = mongoose.model('Booking', bookingSchema);

// Define the Event Schema
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    seatsAvailable: { type: Boolean, required: true }
});

// Create the Event Model
const Event = mongoose.model('Event', eventSchema);

// Validate Booking Input
function validateBookingInput(req, res) {
    const { name, email, event } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).send("Invalid participant name");
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).send("Invalid email address");
    }
    if (!event || typeof event !== 'string' || event.trim() === '') {
        return res.status(400).send("Invalid event name");
    }
    return null;
}

// Routes for Bookings

// 1. GET /api/bookings - Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (err) {
        res.status(500).send("An error occurred while fetching bookings.");
    }
});

// 2. POST /api/bookings - Create a new booking
app.post('/api/bookings', async (req, res) => {
    const validationError = validateBookingInput(req, res);
    if (validationError) return;

    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    } catch (err) {
        res.status(500).send("An error occurred while creating the booking.");
    }
});

// 3. GET /api/bookings/:id - Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).send("Booking not found");
        }
    } catch (err) {
        res.status(400).send("Invalid booking ID");
    }
});

// 4. PUT /api/bookings/:id - Update participant details
app.put('/api/bookings/:id', async (req, res) => {
    const validationError = validateBookingInput(req, res);
    if (validationError) return;

    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (updatedBooking) {
            res.json({ message: "Booking updated successfully", booking: updatedBooking });
        } else {
            res.status(404).send("Booking not found");
        }
    } catch (err) {
        res.status(400).send("Invalid booking ID");
    }
});

// 5. DELETE /api/bookings/:id - Delete/cancel booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (deletedBooking) {
            res.json({ message: "Booking canceled successfully", booking: deletedBooking });
        } else {
            res.status(404).send("Booking not found");
        }
    } catch (err) {
        res.status(400).send("Invalid booking ID");
    }
});

// 6. GET /api/bookings/search?email=xyz - Search booking by email
app.get('/api/bookings/search', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).send("Email query parameter is required");
    }

    try {
        const bookings = await Booking.find({ email: email });
        if (bookings.length > 0) {
            res.json(bookings);
        } else {
            res.status(404).send("No bookings found for the given email");
        }
    } catch (err) {
        res.status(500).send("An error occurred while searching for bookings.");
    }
});

// 7. GET /api/bookings/filter?event=Synergia - Filter bookings by event
app.get('/api/bookings/filter', async (req, res) => {
    const { event } = req.query;
    if (!event) {
        return res.status(400).send("Event query parameter is required");
    }

    try {
        const bookings = await Booking.find({ event: event });
        if (bookings.length > 0) {
            res.json(bookings);
        } else {
            res.status(404).send("No bookings found for the given event");
        }
    } catch (err) {
        res.status(500).send("An error occurred while filtering bookings.");
    }
});

// Routes for Events
app.get('/events', async (req, res) => {
    try {
        const { date, seatsAvailable, sort } = req.query;

        // Build the query object
        const query = {};
        if (date) {
            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).send("Invalid date format. Use YYYY-MM-DD.");
            }
            query.date = new Date(date);
        }
        if (seatsAvailable) {
            query.seatsAvailable = seatsAvailable === 'true';
        }

        // Execute the query
        let events = Event.find(query);

        // Apply sorting if requested
        if (sort === 'name') {
            events = events.sort({ name: 1 }); // Sort alphabetically by name
        }

        const result = await events;
        res.json(result);
    } catch (err) {
        res.status(500).send("An error occurred while fetching events.");
    }
});

// Add Sample Events (Optional)
app.post('/events/sample', async (req, res) => {
    const sampleEvents = [
        { name: "JavaScript Workshop", date: "2025-10-30", seatsAvailable: true },
        { name: "Python Bootcamp", date: "2025-10-31", seatsAvailable: false },
        { name: "Node.js Masterclass", date: "2025-10-30", seatsAvailable: true }
    ];
    await Event.insertMany(sampleEvents);
    res.send("Sample events added.");
});

// Start the Server
app.listen(5000, () => console.log("Server running on port 5000"));