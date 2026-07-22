/**
 * Herramientas MCP para búsqueda en Confluence
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfluenceClient } from '../confluence-client.js';

export function createSearchTools(client: ConfluenceClient): Tool[] {
  return [
    {
      name: 'search_confluence',
      description: 'Buscar contenido en Confluence usando palabras clave',
      inputSchema: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description: 'Palabras clave para buscar en Confluence'
          },
          limit: {
            type: 'number',
            description: 'Número máximo de resultados (default: 25)',
            default: 25
          }
        },
        required: ['query']
      }
    },
    {
      name: 'get_confluence_spaces',
      description: 'Obtener lista de espacios disponibles en Confluence',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: {
            type: 'number',
            description: 'Número máximo de espacios a retornar (default: 25)',
            default: 25
          }
        }
      }
    },
    {
      name: 'get_space_content',
      description: 'Obtener todas las páginas de un espacio en Confluence',
      inputSchema: {
        type: 'object' as const,
        properties: {
          space_key: {
            type: 'string',
            description: 'La clave del espacio (ej: IMPR)'
          },
          limit: {
            type: 'number',
            description: 'Número máximo de páginas a retornar (default: 25)',
            default: 25
          }
        },
        required: ['space_key']
      }
    }
  ];
}

export async function executeSearchTool(
  toolName: string,
  toolInput: Record<string, any>,
  client: ConfluenceClient
): Promise<string> {
  switch (toolName) {
    case 'search_confluence': {
      const limit = toolInput.limit || 25;
      const results = await client.search(toolInput.query, limit);
      
      return JSON.stringify({
        success: true,
        query: toolInput.query,
        resultCount: results.length,
        results: results.map(result => ({
          id: result.id,
          type: result.type,
          title: result.title,
          excerpt: result.excerpt,
          space: result.space.key,
          url: result.url,
          modified: result.lastModified
        }))
      }, null, 2);
    }

    case 'get_confluence_spaces': {
      const limit = toolInput.limit || 25;
      const spaces = await client.getSpaces(limit);
      
      return JSON.stringify({
        success: true,
        spaceCount: spaces.length,
        spaces: spaces.map(space => ({
          key: space.key,
          name: space.name,
          type: space.type,
          id: space.id
        }))
      }, null, 2);
    }

    case 'get_space_content': {
      const limit = toolInput.limit || 25;
      const pages = await client.getSpaceContent(toolInput.space_key, limit);
      
      return JSON.stringify({
        success: true,
        spaceKey: toolInput.space_key,
        pageCount: pages.length,
        pages: pages.map(page => ({
          id: page.id,
          title: page.title,
          type: page.type,
          url: page.links.webui,
          version: page.version.number
        }))
      }, null, 2);
    }

    default:
      throw new Error(`Unknown search tool: ${toolName}`);
  }
}
