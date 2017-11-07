import { Router } from 'express';
import mongoose from 'mongoose';
import fs from "fs";
import File from '../models/file';

const router = Router();

router.post('/pdf', async (req, res) => {
  const data = req.body;
  const file = data.file;
  const domain = data.domain;
  const title = data.title;

  await fs.writeFile('test.pdf', file, 'base64');

  res.json({
    data
  });
});

export default router;
