const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        venues: true
      }
    });
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
});

// Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        venues: true
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Failed to fetch vendor' });
  }
});

// Create new vendor (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, phone, email, address, description } = req.body;

    const vendor = await prisma.vendor.create({
      data: {
        name,
        phone,
        email,
        address,
        description
      }
    });

    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Failed to create vendor' });
  }
});

module.exports = router;