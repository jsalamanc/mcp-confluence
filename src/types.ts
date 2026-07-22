/**
 * Tipos para Confluence API y MCP Server
 */

export interface ConfluenceConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

export interface ConfluencePage {
  id: string;
  type: string;
  title: string;
  body: {
    storage: {
      value: string;
      representation: string;
    };
  };
  space: {
    key: string;
    name: string;
  };
  version: {
    number: number;
  };
  links: {
    webui: string;
  };
}

export interface ConfluenceSpace {
  key: string;
  name: string;
  type: string;
  id: number;
}

export interface ConfluenceSearchResult {
  results: SearchResultItem[];
  start: number;
  limit: number;
  size: number;
  totalSize: number;
}

export interface SearchResultItem {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  url: string;
  lastModified: string;
  space: {
    key: string;
    name: string;
  };
}

export interface ConfluenceApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    status?: number;
  };
}
