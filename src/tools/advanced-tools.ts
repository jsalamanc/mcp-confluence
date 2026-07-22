/**
 * Herramientas MCP avanzadas para operaciones con páginas de Confluence
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfluenceClient } from '../confluence-client.js';

export function createAdvancedTools(client: ConfluenceClient): Tool[] {
  return [
    {
      name: 'delete_confluence_page',
      description: 'Delete a Confluence page permanently',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page_id: {
            type: 'string',
            description: 'The unique ID of the page to delete'
          }
        },
        required: ['page_id']
      }
    },
    {
      name: 'add_confluence_comment',
      description: 'Add a comment to a Confluence page',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page_id: {
            type: 'string',
            description: 'The ID of the page to comment on'
          },
          comment_text: {
            type: 'string',
            description: 'The comment text to add'
          }
        },
        required: ['page_id', 'comment_text']
      }
    },
    {
      name: 'get_confluence_page_versions',
      description: 'Get version history of a Confluence page',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page_id: {
            type: 'string',
            description: 'The ID of the page'
          },
          limit: {
            type: 'number',
            description: 'Maximum versions to return (default: 25)',
            default: 25
          }
        },
        required: ['page_id']
      }
    },
    {
      name: 'get_confluence_page_comments',
      description: 'Get all comments on a Confluence page',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page_id: {
            type: 'string',
            description: 'The ID of the page'
          },
          limit: {
            type: 'number',
            description: 'Maximum comments to return (default: 25)',
            default: 25
          }
        },
        required: ['page_id']
      }
    },
    {
      name: 'get_confluence_page_attachments',
      description: 'List all attachments on a Confluence page',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page_id: {
            type: 'string',
            description: 'The ID of the page'
          },
          limit: {
            type: 'number',
            description: 'Maximum attachments to return (default: 25)',
            default: 25
          }
        },
        required: ['page_id']
      }
    },
    {
      name: 'export_confluence_page_html',
      description: 'Export a Confluence page as HTML',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page_id: {
            type: 'string',
            description: 'The ID of the page to export'
          }
        },
        required: ['page_id']
      }
    }
  ];
}

export async function executeAdvancedTool(
  toolName: string,
  toolInput: Record<string, any>,
  client: ConfluenceClient
): Promise<string> {
  switch (toolName) {
    case 'delete_confluence_page': {
      await client.deletePage(toolInput.page_id);
      return JSON.stringify({
        success: true,
        message: `Page ${toolInput.page_id} deleted successfully`
      }, null, 2);
    }

    case 'add_confluence_comment': {
      const result = await client.addComment(toolInput.page_id, toolInput.comment_text);
      return JSON.stringify({
        success: true,
        message: 'Comment added successfully',
        data: {
          pageId: toolInput.page_id,
          commentText: toolInput.comment_text
        }
      }, null, 2);
    }

    case 'get_confluence_page_versions': {
      const limit = toolInput.limit || 25;
      const versions = await client.getPageVersions(toolInput.page_id, limit);
      
      return JSON.stringify({
        success: true,
        pageId: toolInput.page_id,
        versionCount: versions.length,
        versions: versions.map(v => ({
          number: v.number,
          message: v.message,
          by: v.by?.email || 'Unknown',
          when: v.when,
          minorEdit: v.minorEdit
        }))
      }, null, 2);
    }

    case 'get_confluence_page_comments': {
      const limit = toolInput.limit || 25;
      const comments = await client.getPageComments(toolInput.page_id, limit);
      
      return JSON.stringify({
        success: true,
        pageId: toolInput.page_id,
        commentCount: comments.length,
        comments: comments.map(c => ({
          id: c.id,
          author: c.by?.email || 'Unknown',
          created: c.created,
          body: c.body?.view?.value || c.body?.storage?.value || ''
        }))
      }, null, 2);
    }

    case 'get_confluence_page_attachments': {
      const limit = toolInput.limit || 25;
      const attachments = await client.getPageAttachments(toolInput.page_id, limit);
      
      return JSON.stringify({
        success: true,
        pageId: toolInput.page_id,
        attachmentCount: attachments.length,
        attachments: attachments.map(a => ({
          id: a.id,
          title: a.title,
          type: a.type,
          size: a.extensions?.fileSize || 'Unknown',
          created: a.created,
          by: a.by?.email || 'Unknown'
        }))
      }, null, 2);
    }

    case 'export_confluence_page_html': {
      const html = await client.exportPageToHtml(toolInput.page_id);
      return JSON.stringify({
        success: true,
        pageId: toolInput.page_id,
        format: 'html',
        contentLength: html.length,
        content: html.substring(0, 1000) + (html.length > 1000 ? '...' : '')
      }, null, 2);
    }

    default:
      throw new Error(`Unknown advanced tool: ${toolName}`);
  }
}
