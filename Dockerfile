# Use official Node.js image
FROM node:24-alpine

# Set working directory
WORKDIR /mood-tracker

# Copy package.json and lock file
COPY mood-tracker/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY mood-tracker/ .

# Copy and set up entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ARG MONGODB_URI
ARG JWT_SECRET

ENV MONGODB_URI=$MONGODB_URI
ENV JWT_SECRET_FALLBACK=$JWT_SECRET_FALLBACK

# Build the Next.js app
RUN npm run build || { echo "Build failed"; exit 1; }

# Expose the app port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]