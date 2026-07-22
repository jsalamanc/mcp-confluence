/**
 * Herramientas MCP para operaciones con páginas de Confluence
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfluenceClient } from '../confluence-client.js';

export function createPageTools(client: ConfluenceClient): Tool[] {
  return [
    {
      name: 'get_confluence_page',
      description: 'Obtener el contenido de una página de Confluence por su ID',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page_id: {
            type: 'string',
            description: 'El ID único de la página en Confluence'
          }
        },
        required: ['page_id']
      }
    },
    {
      name: 'create_confluence_page',
      description: 'Crear una nueva página en un espacio de Confluence',
      inputSchema: {
        type: 'object' as const,
        properties: {
          space_key: {
            type: 'string',
            description: 'La clave del espacio donde crear la página (ej: IMPR)'
          },
          title: {
            type: 'string',
            description: 'El título de la nueva página'
          },
          body: {
            type: 'string',
            description: 'El contenido de la página en formato storage (HTML de Confluence)'
          },
          parent_page_id: {
            type: 'string',
            description: 'Opcional: ID de la página padre si quieres crear una subpágina'
          }
        },
        required: ['space_key', 'title', 'body']
      }
    },
    {
      name: 'update_confluence_page',
      description: 'Actualizar una página existente en Confluence',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page_id: {
            type: 'string',
            description: 'El ID de la página a actualizar'
          },
          title: {
            type: 'string',
            description: 'El nuevo título de la página'
          },
          body: {
            type: 'string',
            description: 'El nuevo contenido en formato storage'
          },
          version_number: {
            type: 'number',
            description: 'El número de versión actual (se incrementará automáticamente)'
          }
        },
        required: ['page_id', 'title', 'body', 'version_number']
      }
    }
  ];
}

export async function executePageTool(
  toolName: string,
  toolInput: Record<string, any>,
  client: ConfluenceClient
): Promise<string> {
  switch (toolName) {
    case 'get_confluence_page': {
      const page = await client.getPage(toolInput.page_id);
      return JSON.stringify({
        success: true,
        data: {
          id: page.id,
          title: page.title,
          space: page.space.key,
          content: page.body.storage.value,
          url: page.links.webui,
          version: page.version.number
        }
      }, null, 2);
    }

    case 'create_confluence_page': {
      const page = await client.createPage(
        toolInput.space_key,
        toolInput.title,
        toolInput.body,
        toolInput.parent_page_id
      );
      return JSON.stringify({
        success: true,
        message: 'Página creada exitosamente',
        data: {
          id: page.id,
          title: page.title,
          space: page.space.key,
          url: page.links.webui,
          version: page.version.number
        }
      }, null, 2);
    }

    case 'update_confluence_page': {
      const page = await client.updatePage(
        toolInput.page_id,
        toolInput.title,
        toolInput.body,
        toolInput.version_number
      );
      return JSON.stringify({
        success: true,
        message: 'Página actualizada exitosamente',
        data: {
          id: page.id,
          title: page.title,
          space: page.space.key,
          url: page.links.webui,
          version: page.version.number
        }
      }, null, 2);
    }

    default:
      throw new Error(`Unknown page tool: ${toolName}`);
  }
}
