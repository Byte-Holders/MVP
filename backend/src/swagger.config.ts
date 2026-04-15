import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CodeGuardian API')
    .setDescription('API REST del backend CodeGuardian')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'registration-token',
    )
    .addTag('User', 'Registrazione utente')
    .addTag('WorkspaceManager', 'Gestione workspace')
    .addTag('workspace-repositories', 'Repository associate a un workspace')
    .addTag('WorkspaceUser', 'Membri di un workspace')
    .addTag('Membership', 'Inviti e gestione membership')
    .addTag('ScanManager', 'Avvio e stato delle scansioni')
    .addTag('repositories', 'Repository GitHub')
    .addTag('reports', 'Report di analisi')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
