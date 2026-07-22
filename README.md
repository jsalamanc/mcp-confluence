# MCP Confluence

Servidor Model Context Protocol (MCP) para integrar Confluence con OpenCode.

## Características

- ✅ Leer páginas de Confluence
- ✅ Crear nuevas páginas
- ✅ Actualizar páginas existentes
- ✅ Buscar contenido en Confluence
- ✅ Listar espacios disponibles
- ✅ Obtener contenido de un espacio

## Requisitos

- Node.js 18+
- Credenciales de Confluence (email + API token)

## Instalación

```bash
cd /home/juan-diego/Documentos/repositorios-personales/mcp-confluence
npm install
npm run build
```

## Configuración

### 1. Obtener API Token de Confluence

1. Ir a https://id.atlassian.com/manage/api-tokens
2. Crear un nuevo API token
3. Copiar el token

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
CONFLUENCE_BASE_URL=https://project-tools-santillana.atlassian.net
CONFLUENCE_EMAIL=tu-email@example.com
CONFLUENCE_API_TOKEN=tu-api-token-aqui
```

### 3. Integrar con OpenCode

Añade esta configuración a tu `~/.config/opencode/opencode.jsonc`:

```json
{
  "mcp": {
    "confluence": {
      "type": "local",
      "command": ["npx", "--prefix", "/home/juan-diego/Documentos/repositorios-personales/mcp-confluence", "tsx", "src/index.ts"],
      "environment": {
        "CONFLUENCE_BASE_URL": "https://project-tools-santillana.atlassian.net",
        "CONFLUENCE_EMAIL": "tu-email@example.com",
        "CONFLUENCE_API_TOKEN": "tu-api-token"
      },
      "enabled": true
    }
  }
}
```

O usa las variables de entorno del sistema en lugar de pasar los valores directamente:

```json
{
  "mcp": {
    "confluence": {
      "type": "local",
      "command": ["npx", "--prefix", "/home/juan-diego/Documentos/repositorios-personales/mcp-confluence", "tsx", "src/index.ts"],
      "environment": {
        "CONFLUENCE_BASE_URL": "{env:CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "{env:CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "{env:CONFLUENCE_API_TOKEN}"
      },
      "enabled": true
    }
  }
}
```

## Uso

Una vez configurado, puedes usar Confluence con OpenCode:

```
Busca todas las páginas sobre "API" en Confluence. usa confluence
```

### Herramientas disponibles

#### Búsqueda

- `search_confluence` - Buscar contenido por palabras clave
- `get_confluence_spaces` - Listar todos los espacios disponibles
- `get_space_content` - Obtener todas las páginas de un espacio

#### Páginas

- `get_confluence_page` - Leer una página por ID
- `create_confluence_page` - Crear una nueva página
- `update_confluence_page` - Actualizar una página existente

## Desarrollo

```bash
# Ver cambios en tiempo real
npm run watch

# Ejecutar en modo desarrollo
npm run dev

# Compilar
npm run build

# Iniciar el servidor
npm start
```

## Estructura del Proyecto

```
src/
├── index.ts                 # Punto de entrada
├── server.ts               # Servidor MCP
├── confluence-client.ts    # Cliente API de Confluence
├── types.ts                # Tipos TypeScript
└── tools/
    ├── page-tools.ts       # Herramientas para páginas
    └── search-tools.ts     # Herramientas de búsqueda
```

## API de Confluence

Las herramientas usan la [API de Confluence v2](https://developer.atlassian.com/cloud/confluence/rest/v2/intro/).

## Licencia

MIT

## Próximas Características

- [ ] Eliminar páginas
- [ ] Añadir comentarios a páginas
- [ ] Gestionar restricciones de permisos
- [ ] Exportar páginas a diferentes formatos
- [ ] Gestionar adjuntos
- [ ] Trabajar con macros
