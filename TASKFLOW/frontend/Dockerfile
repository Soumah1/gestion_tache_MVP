FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Run the application
CMD sh -c "VITE_API_URL=http://localhost:8000/api/v1 npm run dev -- --host"

