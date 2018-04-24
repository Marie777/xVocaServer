import { Router } from 'express';
import mongoose from 'mongoose';
import fs from "fs";
import {convertToTxt, deleteFromDiscovery} from './watsonapi';

const router = Router();


//Upload pdf to server
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


//Convert pdf to text (watson discovery) and save to mongodb
router.get('/convertpdf', async (req, res) => {
  let param_file = {
    user: "5adda418da6ab03bd876c0f6",
    domain: "blaaaa",
    title: "multi6.pdf",
    type: "df"
  };


  const mongoRecord = await convertToTxt(param_file);
  const doc_id = mongoRecord.text.id;

  //Delete pdf from watson discovery
  // setTimeout(async (doc_id)=>{  }, 15000);

  res.send(mongoRecord);

});


//id: "b12d66a5-8e31-45c1-8f8e-5e292c72f223"
//TODO: Delete pdf from watson discovery
router.get('/deletediscovery', async (req, res) => {
  res.send(await deleteFromDiscovery("b12d66a5-8e31-45c1-8f8e-5e292c72f223"));
});



//TODO: delete pdf from server
router.get('/filedelete', async (req, res) => {

  res.send("deleted");
});





export default router;
