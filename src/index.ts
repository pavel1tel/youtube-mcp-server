import { startMcpServer } from './server.js';
import { config } from 'dotenv';

await config();

// Check for required environment variables
if (!process.env.YOUTUBE_API_KEY) {
    console.error('Error: YOUTUBE_API_KEY environment variable is required.');
    console.error('Please set it before running this server.');
    process.exit(1);
}

// Check transport mode: 'http' for HTTP mode, anything else (or unset) for stdio mode
const transportMode = process.env.MCP_TRANSPORT || 'stdio';

if (transportMode === 'http') {
    // Start HTTP server
    import('./http.js').catch(error => {
        console.error('Failed to start HTTP server:', error);
        process.exit(1);
    });
} else {
    // Start stdio server (default)
    startMcpServer()
        .then(() => {
            console.log('YouTube MCP Server started successfully');
        })
        .catch(error => {
            console.error('Failed to start YouTube MCP Server:', error);
            process.exit(1);
        });
}
