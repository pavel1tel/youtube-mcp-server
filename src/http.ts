import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { createMcpServer } from './server.js';

// Check for required environment variables
if (!process.env.YOUTUBE_API_KEY) {
    console.error('Error: YOUTUBE_API_KEY environment variable is required.');
    console.error('Please set it before running this server.');
    process.exit(1);
}

const app = express();
app.use(express.json());

// Create the MCP server once (can be reused across requests)
const server = createMcpServer();

app.all('/mcp', async (req, res) => {
    // In stateless mode, create a new transport for each request to prevent
    // request ID collisions. Different clients may use the same JSON-RPC request IDs,
    // which would cause responses to be routed to the wrong HTTP connections if
    // the transport state is shared.

    try {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true
        });

        res.on('close', () => {
            transport.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error'
                },
                id: null
            });
        }
    }
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`YouTube MCP Server running on http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});
