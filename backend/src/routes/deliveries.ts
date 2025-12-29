import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// Create a delivery
router.post('/', async (req, res) => {
  const { clientName, serialNumber, product, price, address, phoneNumber, state, assignedToId, createdById } = req.body;
  if (!clientName || !address || !phoneNumber || !product) return res.status(400).json({ message: 'clientName, address, phoneNumber and product are required' });

  try {
    const delivery = await prisma.delivery.create({
      data: {
        clientName,
        serialNumber,
        product,
        price: price ? Number(price) : undefined,
        address,
        phoneNumber,
        state: state as any,
        assignedToId,
        createdById,
      },
    });
    res.status(201).json(delivery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

// List deliveries, optional filter by assignedToId
router.get('/', async (req, res) => {
  const assignedToId = req.query.assignedToId ? Number(req.query.assignedToId) : undefined;
  const where: any = {};
  if (assignedToId) where.assignedToId = assignedToId;

  try {
    const deliveries = await prisma.delivery.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(deliveries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

// Get single delivery
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery) return res.status(404).json({ message: 'not found' });
    res.json(delivery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

// Update delivery (state, assignment, or other fields)
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { state, assignedToId, clientName, address, phoneNumber, price, serialNumber, product } = req.body;

  try {
    const data: any = {};
    if (state) data.state = state;
    if (assignedToId !== undefined) data.assignedToId = assignedToId;
    if (clientName !== undefined) data.clientName = clientName;
    if (address !== undefined) data.address = address;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (price !== undefined) data.price = price;
    if (serialNumber !== undefined) data.serialNumber = serialNumber;
    if (product !== undefined) data.product = product;

    const delivery = await prisma.delivery.update({ where: { id }, data });
    res.json(delivery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

export default router;
