import { app } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
