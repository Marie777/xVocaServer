import { Router } from 'express';
import fs from "fs";
import mongoose from 'mongoose';
import file from '../models/file';
import {convertToTxt, deleteFromDiscovery} from './watsonapi';
import {analyzeTextAlgo} from './analyzetxt';

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


//save to mongodb
const saveTxtDB = async (infoDoc) => {

  // TODO: userId, domain, title, type -> from req body
  let newFile = {
    user: "5adda418da6ab03bd876c0f6",
    domain: "blaaaa",
    title: "multi6.pdf",
    type: "df",
    text: infoDoc.results[0]
  };
  return(await file.create(newFile));
};


//Convert pdf to text (watson discovery)
router.get('/convertpdf', async (req, res) => {

  //TODO: file name from req body
  const infoDoc = await convertToTxt("multi6.pdf");
  const mongoRec = await saveTxtDB(infoDoc);
  const text = mongoRec.text.text;
  // res.send({text});

  try{
    res.send(await analyzeTextAlgo(text));
  }catch(error){
    res.send(error);
  }

});





//TODO: Delete pdf from watson discovery
router.get('/deletediscovery', async (req, res) => {
  res.send(await deleteFromDiscovery("211a26f9-5ad4-4c85-b8de-6822aa6fb346"));
});



//TODO: delete pdf from server
router.get('/filedelete', async (req, res) => {

  res.send("deleted");
});





export default router;
