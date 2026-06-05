import { Router } from 'express';

const router = Router();

router.post('/', (_req, res) => {
  const celebrities = [
    { name: '迪丽热巴', similarity: 85 },
    { name: '刘亦菲', similarity: 78 },
    { name: '杨幂', similarity: 72 },
    { name: '赵丽颖', similarity: 81 },
  ];
  const randomCelebrity = celebrities[Math.floor(Math.random() * celebrities.length)];
  const score = Math.floor(Math.random() * 30) + 70;
  
  res.json({
    success: true,
    data: {
      passed: true,
      score,
      celebrityMatch: randomCelebrity,
      verifiedAt: new Date().toISOString(),
    },
  });
});

export default router;
