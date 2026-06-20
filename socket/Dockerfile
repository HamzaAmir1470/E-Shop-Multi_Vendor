# 1. Use the official Node.js image
FROM node:20-alpine

# 2. Set the working directory
WORKDIR /app/socket

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy the socket server code
COPY . .

# 5. Expose the port your socket server runs on (e.g., 4000)
EXPOSE 4000

# 6. Command to start the socket server
CMD ["npm", "start"]