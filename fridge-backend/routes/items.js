const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');   // <-- import your Item model
const auth = require('../middleware/authMiddleware');  // <-- protect routes

const router = express.Router();

// All routes below require a valid JWT
router.use(auth);

// GET /items?category=&location=&expiringSoon=true
router.get('/', async (req, res) => {
    const { category, location, expiringSoon } = req.query;

    const filter = { userId: req.user.id };   // only your items
    if (category) filter.category = category;
    if (location) filter.location = location;

    if (String(expiringSoon).toLowerCase() === 'true') {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + 2);  // today + 2 days
        filter.bestBy = { $lte: d };
    }

    const items = await Item.find(filter).sort({ bestBy: 1, createdAt: -1 });
    res.json(items);
});

// POST /items
router.post('/', async (req, res) => {
    try {
        const { name, category = 'other', quantity = 1, location, bestBy, notes = '' } = req.body;

        if (!name || !location || !bestBy) {
            return res.status(400).json({ error: 'name, location, and bestBy are required' });
        }

        const item = await Item.create({
            userId: req.user.id,
            name: String(name).trim(),
            category,
            quantity,
            location,
            bestBy: new Date(bestBy),
            notes
        });

        res.status(201).json(item);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});


// PATCH /items/:id
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid item id' });
    }

    const item = await Item.findOne({ _id: id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const allowed = ['name', 'category', 'quantity', 'location', 'bestBy', 'notes'];
    for (const key of allowed) {
        if (key in req.body) {
            if (key === 'bestBy') item[key] = new Date(req.body[key]);
            else item[key] = req.body[key];
        }
    }

    await item.save();
    res.json(item);
});


// DELETE /items/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid item id' });
    }

    const deleted = await Item.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Item not found' });

    res.status(204).send();
});

module.exports = router;
