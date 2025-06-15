FROM node:24-alpine

# Install Chrome and dependencies
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    dos2unix

# Set Chrome binary path
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Ensure proper line endings and permissions for shell script
RUN dos2unix run-tests.sh 2>/dev/null || true
RUN chmod +x run-tests.sh

CMD ["./run-tests.sh"]
