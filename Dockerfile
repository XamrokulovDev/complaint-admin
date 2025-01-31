FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --no-audit

# Copy source code
COPY . .

# Set proper permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port if needed (uncomment and set your port)
# EXPOSE 3000

# Start the bot
CMD ["npm", "run", "dev"]