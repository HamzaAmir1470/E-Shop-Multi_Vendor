# 1. Use Node.js version 22 to match your package.json engine
FROM node:22-alpine

# 2. Set the working directory inside the container
WORKDIR /app/backend

# 3. Copy package configuration files
COPY package*.json ./

# 4. Install production dependencies (ignores devDependencies like nodemon for cleaner builds)
RUN npm install --production

# 5. Copy the rest of your backend source code
COPY . .

# 6. Expose your backend port (make sure your server.js listens on this port, e.g., 8000)
EXPOSE 8000

# 7. Use the start script defined in your package.json
CMD ["npm", "start"]