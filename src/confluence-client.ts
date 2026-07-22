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
}
