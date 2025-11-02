FROM node:16-alpine

WORKDIR /app

# Build arguments
ARG YOUTUBE_API_KEY
ARG PORT=8080

# Environment variables
ENV YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
ENV MCP_TRANSPORT=http
ENV PORT=${PORT}

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Set execution permission for CLI
RUN chmod +x dist/cli.js

# Expose the HTTP server port (default 3000, override with -p flag)
EXPOSE ${PORT}

# Run the HTTP server
CMD ["node", "dist/index.js"]