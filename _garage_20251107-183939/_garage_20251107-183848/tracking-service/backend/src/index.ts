import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = parseInt(process.env.PORT || '5001', 10);

app.listen(port, () => {
  console.log(`Tracking API listening on port ${port}`);
});
