import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const distPath = path.join(__dirname, 'dist');

app.disable('x-powered-by');
app.use(
  express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    index: false,
  })
);

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Buy Sell Market listening on port ${port}`);
});
