import { createApp } from './app.js';

const PORT = Number(process.env.PORT ?? 5000);

const app = await createApp();

app.listen(PORT, () => {
  console.log(`[AutolytiQ] API listening on port ${PORT}`);
});
