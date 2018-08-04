import { Router } from 'express';
import {analyzeAll} from '../Algorithm/analyzetxt';
import { quizGenerator } from '../Algorithm/quiz';
import { delay } from '../common/utils';

const router = Router();

router.post('/', async (req, res) => {
  const {mongoId, domain} = req.body;
  const analyzed = await analyzeAll(mongoId, domain);
  const QnA = quizGenerator(analyzed);
  res.send({QnA});
});


export default router;
