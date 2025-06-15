FROM node:24

# Install Chrome and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    dos2unix \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome binary path
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Ensure proper line endings and permissions for shell script
RUN dos2unix run-tests.sh
RUN chmod +x run-tests.sh

CMD ["./run-tests.sh"]
