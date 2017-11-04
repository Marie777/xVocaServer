import { Router } from 'express';
import Domain from '../models/domain';
import mongoose from 'mongoose';

const router = Router();

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw { message: "Invalid ID", status: 400 };
    }

    const domain = await Domain.findById(id).lean();

    if(domain === null) {
      throw { message: "Not found", status: 404 };
    }

    res.json(domain).status(200);
  } catch (e) {
    res.json(e).status(e.status);
  }
});

router.post('/', async (req, res) => {
  try {
    console.log(req.body);

    const domain = await Domain.create(req.body);
    res.json(domain);
  } catch (e) {
    res.json(e).status(e.status);
  }
});

router.post('/go',(req,res) =>{
  return Domain.create({userName:'sdf'}, (err)=>{res.send(err)});
})

export default router;
