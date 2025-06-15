FROM node:24

# Install Chrome and dependencies
RUN apt-get update && apt-get install -y \
    chromium-browser \
    chromium-chromedriver \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome binary path
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Ensure proper line endings and permissions for shell script
RUN dos2unix run-tests.sh
RUN chmod +x run-tests.sh

CMD ["./run-tests.sh"]
