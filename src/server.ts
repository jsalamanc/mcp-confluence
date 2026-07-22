/**
 * Servidor MCP para Confluence
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfluenceClient } from './confluence-client.js';
import { createPageTools, executePageTool } from './tools/page-tools.js';
import { createSearchTools, executeSearchTool } from './tools/search-tools.js';
import { createAdvancedTools, executeAdvancedTool } from './tools/advanced-tools.js';
import { ConfluenceConfig } from './types.js';

// Obtener configuración desde variables de entorno
function getConfluenceConfig(): ConfluenceConfig {
  const baseUrl = process.env.CONFLUENCE_BASE_URL;
  const email = process.env.CONFLUENCE_EMAIL;
  const apiToken = process.env.CONFLUENCE_API_TOKEN;

  if (!baseUrl || !email || !apiToken) {
    throw new Error(
      'Missing required environment variables:\n' +
      '- CONFLUENCE_BASE_URL\n' +
      '- CONFLUENCE_EMAIL\n' +
      '- CONFLUENCE_API_TOKEN'
    );
  }

  return { baseUrl, email, apiToken };
}

async function main() {
  // Inicializar cliente de Confluence
  const config = getConfluenceConfig();
  const confluenceClient = new ConfluenceClient(config);

  // Crear servidor MCP
  const server = new Server({
    name: 'mcp-confluence',
    version: '0.1.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Crear todas las herramientas
  const allTools: Tool[] = [
    ...createPageTools(confluenceClient),
    ...createSearchTools(confluenceClient),
    ...createAdvancedTools(confluenceClient)
  ];

  // Handler para listar herramientas
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: allTools };
  });

  // Handler para ejecutar herramientas
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const toolName = request.params.name;
      const toolInput = request.params.arguments as Record<string, any>;

      let result: string;

      // Determinar qué tipo de herramienta es
      if (toolName.includes('page') && !toolName.includes('versions') && !toolName.includes('comments') && !toolName.includes('attachments')) {
        result = await executePageTool(toolName, toolInput, confluenceClient);
      } else if (toolName.includes('search') || toolName.includes('spaces') || toolName.includes('space_content')) {
        result = await executeSearchTool(toolName, toolInput, confluenceClient);
      } else {
        result = await executeAdvancedTool(toolName, toolInput, confluenceClient);
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: result
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: errorMessage }, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Conectar transporte stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP Confluence server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
