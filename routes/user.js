import { Router } from 'express';
import user from '../models/user';
import mongoose from 'mongoose';

const router = Router();

router.post('/', async (req, res) => {
  var newUser = new User({});
  newUser.save((err) => {return err;});
});

export default router;
