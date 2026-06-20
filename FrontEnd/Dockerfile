# 1. Use the official Node.js image
FROM node:20-alpine

# 2. Set the working directory
WORKDIR /app/frontend

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the application code
COPY . .

# 5. Expose Vite's default dev port
EXPOSE 5173

# 6. Start Vite with the host flag so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]