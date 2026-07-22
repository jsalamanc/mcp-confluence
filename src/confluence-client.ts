/**
 * Cliente para interactuar con la API de Confluence
 */

import { ConfluenceConfig, ConfluencePage, ConfluenceSpace, ConfluenceSearchResult, SearchResultItem } from './types.js';

export class ConfluenceClient {
  private baseUrl: string;
  private email: string;
  private apiToken: string;
  private headers: Record<string, string>;

  constructor(config: ConfluenceConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remover trailing slash
    this.email = config.email;
    this.apiToken = config.apiToken;
    
    // Configurar headers con autenticación Basic
    const credentials = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    this.headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Leer una página de Confluence por ID
   */
  async getPage(pageId: string, expand: string[] = ['body.storage', 'version']): Promise<ConfluencePage> {
    const expandParam = expand.join(',');
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}?expand=${expandParam}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get page: ${response.statusText}`);
    }

    return response.json() as Promise<ConfluencePage>;
  }

  /**
   * Buscar contenido en Confluence
   */
  async search(query: string, limit: number = 25): Promise<SearchResultItem[]> {
    const cql = `text ~ "${query.replace(/"/g, '\\"')}"`;
    const url = `${this.baseUrl}/wiki/rest/api/content/search?cql=${encodeURIComponent(cql)}&limit=${limit}&expand=space,version`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to search: ${response.statusText}`);
    }

    const result = await response.json() as ConfluenceSearchResult;
    return result.results;
  }

  /**
   * Crear una nueva página en Confluence
   */
  async createPage(
    spaceKey: string,
    title: string,
    body: string,
    parentPageId?: string
  ): Promise<ConfluencePage> {
    const url = `${this.baseUrl}/wiki/rest/api/content`;
    
    const payload: Record<string, any> = {
      type: 'page',
      title,
      space: {
        key: spaceKey
      },
      body: {
        storage: {
          value: body,
          representation: 'storage'
        }
      }
    };

    if (parentPageId) {
      payload.ancestors = [{ id: parentPageId }];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create page: ${response.statusText} - ${error}`);
    }

    return response.json() as Promise<ConfluencePage>;
  }

  /**
   * Actualizar una página existente
   */
  async updatePage(
    pageId: string,
    title: string,
    body: string,
    versionNumber: number
  ): Promise<ConfluencePage> {
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}`;
    
    const payload = {
      type: 'page',
      title,
      body: {
        storage: {
          value: body,
          representation: 'storage'
        }
      },
      version: {
        number: versionNumber + 1
      }
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update page: ${response.statusText} - ${error}`);
    }

    return response.json() as Promise<ConfluencePage>;
  }

  /**
   * Obtener espacios disponibles
   */
  async getSpaces(limit: number = 25): Promise<ConfluenceSpace[]> {
    const url = `${this.baseUrl}/wiki/rest/api/space?limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get spaces: ${response.statusText}`);
    }

    const result = await response.json() as { results: ConfluenceSpace[] };
    return result.results;
  }

  /**
   * Obtener contenido de un espacio
   */
  async getSpaceContent(spaceKey: string, limit: number = 25): Promise<ConfluencePage[]> {
    const cql = `space = ${spaceKey}`;
    const url = `${this.baseUrl}/wiki/rest/api/content/search?cql=${encodeURIComponent(cql)}&limit=${limit}&expand=space,version`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get space content: ${response.statusText}`);
    }

    const result = await response.json() as ConfluenceSearchResult;
    // Mapear a ConfluencePage (simplificado)
    return result.results.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      body: { storage: { value: item.excerpt || '', representation: 'storage' } },
      space: item.space,
      version: { number: 1 },
      links: { webui: item.url }
    })) as ConfluencePage[];
  }

  /**
   * Eliminar una página
   */
  async deletePage(pageId: string): Promise<void> {
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to delete page: ${response.statusText}`);
    }
  }

  /**
   * Agregar un comentario a una página
   */
  async addComment(pageId: string, commentText: string): Promise<any> {
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}/comment`;
    
    const payload = {
      body: {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: commentText
              }
            ]
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to add comment: ${response.statusText} - ${error}`);
    }

    return response.json();
  }

  /**
   * Obtener versiones/historial de una página
   */
  async getPageVersions(pageId: string, limit: number = 25): Promise<any[]> {
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}/version?limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get page versions: ${response.statusText}`);
    }

    const result = await response.json() as { results: any[] };
    return result.results;
  }

  /**
   * Obtener adjuntos de una página
   */
  async getPageAttachments(pageId: string, limit: number = 25): Promise<any[]> {
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}/child/attachment?limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get attachments: ${response.statusText}`);
    }

    const result = await response.json() as { results: any[] };
    return result.results;
  }

  /**
   * Agregar un adjunto a una página
   */
  async addAttachment(pageId: string, filePath: string, fileName: string): Promise<any> {
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}/child/attachment`;
    
    // Lee el archivo
    const { readFileSync } = await import('fs');
    const fileContent = readFileSync(filePath);
    
    const formData = new FormData();
    const blob = new Blob([fileContent]);
    formData.append('file', blob, fileName);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.headers['Authorization']
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to add attachment: ${response.statusText} - ${error}`);
    }

    return response.json();
  }

  /**
   * Exportar página como PDF
   */
  async exportPageToPdf(pageId: string): Promise<ArrayBuffer> {
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}?expand=body.export_view`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to export page: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  /**
   * Obtener página como HTML
   */
  async exportPageToHtml(pageId: string): Promise<string> {
    const page = await this.getPage(pageId, ['body.export_view']);
    return page.body.storage.value;
  }

  /**
   * Obtener comentarios de una página
   */
  async getPageComments(pageId: string, limit: number = 25): Promise<any[]> {
    const url = `${this.baseUrl}/wiki/rest/api/content/${pageId}/comment?limit=${limit}&expand=body.view`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get comments: ${response.statusText}`);
    }

    const result = await response.json() as { results: any[] };
    return result.results;
  }
}
