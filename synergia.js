const express = require('express');
const app = express();
app.use(express.json());

let bookings = [
    { id: 1, name: "Ramesh", event: "Node.js Workshop", email: "ramesh@example.com" },
    { id: 2, name: "Suresh", event: "React Bootcamp", email: "suresh@example.com" }
];

function validateBookingInput(req, res) {
    const { name, event, email } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).send("Invalid participant name");
    }
    if (!event || typeof event !== 'string' || event.trim() === '') {
        return res.status(400).send("Invalid event name");
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).send("Invalid email address");
    }
    return null;
}

app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
    const validationError = validateBookingInput(req, res);
    if (validationError) return;

    const newBooking = { id: bookings.length + 1, ...req.body };
    bookings.push(newBooking);
    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
});

app.get('/api/bookings/:id', (req, res) => {
    const booking = bookings.find(b => b.id == req.params.id);
    if (booking) {
        res.json(booking);
    } else {
        res.status(404).send("Booking not found");
    }
});

app.put('/api/bookings/:id', (req, res) => {
    const validationError = validateBookingInput(req, res);
    if (validationError) return;

    const index = bookings.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        bookings[index] = { id: bookings[index].id, ...req.body };
        res.json({ message: "Booking updated successfully", booking: bookings[index] });
    } else {
        res.status(404).send("Booking not found");
    }
});

app.delete('/api/bookings/:id', (req, res) => {
    const index = bookings.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        const deletedBooking = bookings.splice(index, 1);
        res.json({ message: "Booking canceled successfully", booking: deletedBooking[0] });
    } else {
        res.status(404).send("Booking not found");
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));