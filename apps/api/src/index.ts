import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';

const server = Fastify({ logger: true });

async function main() {
  await server.register(cors, {
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  });

  await server.register(healthRoutes);

  try {
    await server.listen({
      port: Number(process.env['PORT'] ?? 3001),
      host: '0.0.0.0',
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
