# MCP Confluence

A Model Context Protocol (MCP) server for integrating Confluence with OpenCode. Seamlessly search, read, create, and update Confluence pages directly from your AI coding agent.

## Features

- ✅ Search Confluence content by keywords
- ✅ List available spaces
- ✅ Get space content
- ✅ Read Confluence pages by ID
- ✅ Create new pages
- ✅ Update existing pages
- ✅ Full TypeScript support

## Requirements

- Node.js 18+
- Confluence API credentials (email + API token)

## Installation

### Using npm

```bash
npm install @jsalamanc_01/mcp-confluence
```

### Or use directly with OpenCode

```bash
npx @jsalamanc_01/mcp-confluence
```

## Configuration

### 1. Get Your Confluence API Token

1. Go to https://id.atlassian.com/manage/api-tokens
2. Create a new API token
3. Copy the token and save it securely

### 2. Setup with OpenCode

Add this to your `~/.config/opencode/opencode.jsonc`:

```json
{
  "mcp": {
    "confluence": {
      "type": "local",
      "command": ["npx", "-y", "@jsalamanc_01/mcp-confluence"],
      "enabled": true,
      "environment": {
        "CONFLUENCE_BASE_URL": "https://your-instance.atlassian.net",
        "CONFLUENCE_EMAIL": "your-email@example.com",
        "CONFLUENCE_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

Or use environment variables:

```json
{
  "mcp": {
    "confluence": {
      "type": "local",
      "command": ["npx", "-y", "@jsalamanc_01/mcp-confluence"],
      "enabled": true,
      "environment": {
        "CONFLUENCE_BASE_URL": "{env:CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "{env:CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "{env:CONFLUENCE_API_TOKEN}"
      }
    }
  }
}
```

## Usage

Once configured, you can use Confluence tools with OpenCode:

```
Search for all pages about "API" in Confluence. use confluence
```

### Available Tools

#### Search Tools (3)

- **`search_confluence`** - Search Confluence content by keywords
  - Parameters: `query` (string), `limit` (number, default: 25)
  - Returns: List of matching pages with metadata

- **`get_confluence_spaces`** - List all available spaces
  - Parameters: `limit` (number, default: 25)
  - Returns: List of all Confluence spaces

- **`get_space_content`** - Get all pages in a space
  - Parameters: `space_key` (string), `limit` (number, default: 25)
  - Returns: List of pages in the specified space

#### Page Management Tools (6)

- **`get_confluence_page`** - Read a page by ID
  - Parameters: `page_id` (string)
  - Returns: Full page content with metadata

- **`create_confluence_page`** - Create a new page
  - Parameters: `space_key` (string), `title` (string), `body` (string), `parent_page_id` (optional)
  - Returns: Created page details with URL

- **`update_confluence_page`** - Update an existing page
  - Parameters: `page_id` (string), `title` (string), `body` (string), `version_number` (number)
  - Returns: Updated page details

- **`delete_confluence_page`** - Delete a page permanently
  - Parameters: `page_id` (string)
  - Returns: Success confirmation

#### Collaboration Tools (3)

- **`add_confluence_comment`** - Add a comment to a page
  - Parameters: `page_id` (string), `comment_text` (string)
  - Returns: Comment confirmation with details

- **`get_confluence_page_comments`** - Get all comments on a page
  - Parameters: `page_id` (string), `limit` (number, default: 25)
  - Returns: List of all comments with author and timestamp

- **`get_confluence_page_versions`** - Get version history
  - Parameters: `page_id` (string), `limit` (number, default: 25)
  - Returns: List of all versions with editor info

#### Attachments & Export Tools (2)

- **`get_confluence_page_attachments`** - List page attachments
  - Parameters: `page_id` (string), `limit` (number, default: 25)
  - Returns: List of files attached to the page

- **`export_confluence_page_html`** - Export page as HTML
  - Parameters: `page_id` (string)
  - Returns: HTML content of the page

**Total: 14 tools**

## Examples

### Search for pages
```
Find all documentation about database migrations using confluence
```

### Create a page
```
Create a new page in the PROJ space titled "API Documentation" with installation instructions. use confluence
```

### Update a page
```
Update the README page with the latest changes. use confluence
```

### Delete a page
```
Delete the old migration guide page. use confluence
```

### Add a comment
```
Add a comment to the API documentation page saying "Updated with v2 endpoints". use confluence
```

### View page history
```
Show me the version history of the API documentation page. use confluence
```

### Get all comments
```
Get all comments on the deployment guide page. use confluence
```

### Export a page
```
Export the API documentation page as HTML. use confluence
```

## Development

### Local Setup

```bash
git clone https://github.com/jsalamanc/mcp-confluence.git
cd mcp-confluence
npm install
npm run build
```

### Commands

```bash
# Watch for changes
npm run watch

# Run in development mode
npm run dev

# Build for production
npm run build

# Start the server
npm start
```

### Project Structure

```
src/
├── index.ts                 # Entry point
├── server.ts               # MCP server implementation
├── confluence-client.ts    # Confluence API client with all methods
├── types.ts                # TypeScript types
└── tools/
    ├── page-tools.ts       # Page operations (read, create, update)
    ├── search-tools.ts     # Search operations
    └── advanced-tools.ts   # Advanced tools (delete, comments, versions, etc)
```

## API Reference

The tools use the [Confluence Cloud REST API v2](https://developer.atlassian.com/cloud/confluence/rest/v2/intro/).

### Authentication

All requests are authenticated using HTTP Basic Auth with:
- Username: Your Confluence email
- Password: Your API token

### Content Format

Page content uses Confluence's Storage Format (HTML-based markup):

```html
<p>This is a paragraph</p>
<h1>This is a heading</h1>
<ul>
  <li>List item</li>
</ul>
```

## Environment Variables

- **`CONFLUENCE_BASE_URL`** (required): Your Confluence instance URL (e.g., https://my-company.atlassian.net)
- **`CONFLUENCE_EMAIL`** (required): Your Confluence email address
- **`CONFLUENCE_API_TOKEN`** (required): Your Confluence API token

## Troubleshooting

### Authentication Error
- Verify your email and API token are correct
- Ensure the API token hasn't expired
- Check that the base URL doesn't have a trailing slash

### Page Not Found
- Verify the page ID is correct
- Ensure you have access to the page
- Check that the page exists and hasn't been deleted

### Publishing Error
- Verify the space key is correct
- Ensure you have write permissions to the space
- Check the HTML format of the body content

## Performance

- Search operations are cached for 5 minutes
- Batch operations are limited to 25 items by default
- API calls have a 30-second timeout

## Security

- Never commit your API tokens or credentials
- Use environment variables for sensitive data
- Regenerate tokens if they're exposed
- Restrict API token permissions to minimum required

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

### ✅ Completed (v0.3.0)
- [x] Search pages
- [x] List spaces
- [x] Get space content
- [x] Read pages
- [x] Create pages
- [x] Update pages
- [x] Delete pages
- [x] Add comments
- [x] Get page comments
- [x] Get page versions/history
- [x] List page attachments
- [x] Export pages as HTML

### 🚀 Planned Features
- [ ] Upload attachments to pages
- [ ] Export pages to PDF
- [ ] Manage page permissions
- [ ] Work with page macros
- [ ] Batch operations
- [ ] Watch/subscribe to page changes
- [ ] Move pages between spaces
- [ ] Archive/restore pages

## License

MIT

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/jsalamanc/mcp-confluence/issues)
- Check the [documentation](https://github.com/jsalamanc/mcp-confluence)

## Related Projects

- [OpenCode](https://opencode.ai) - AI coding agent
- [Model Context Protocol](https://modelcontextprotocol.io) - Protocol specification
- [Confluence Cloud API](https://developer.atlassian.com/cloud/confluence) - Confluence API documentation

---

**Made with ❤️ for the OpenCode community**
