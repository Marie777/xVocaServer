import { Router } from 'express';
import User from '../models/user';
import {
  findUsers,
  findUserFromId,
  findUserFromGoogleId,
  deleteDomainsFromGoogleId,
  updateDomainsFromGoogleId
} from '../databaseAPI/mongo_user';

const router = Router();

router.post('/tokenlogin/google', (req, res) => {
  console.log(req.user);
  res.json(req.user);
});


router.get('/googleId', async (req,res) =>{
  const googleId = req.body.googleId;
  res.json( await findUserFromGoogleId(req.body.googleId))
});


router.post('/newDomain', async (req, res) => {
  res.json(await updateDomainsFromGoogleId(req.body));
});

router.get('/deleteDomains/:googleId', async (req, res) =>{
  res.json( await deleteDomainsFromGoogleId(req.params.googleId));
});


router.get('/allUsers', async(req, res) =>{
  res.send( await findUsers());
});


router.get('/:id', async (req,res) =>{
  res.json( await findUserFromId(req.params.id))
});

export default router;
