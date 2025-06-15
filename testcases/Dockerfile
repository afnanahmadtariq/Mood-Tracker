FROM node:24-alpine

# Install Chrome and dependencies
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver

# Set Chrome binary path
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

COPY run-tests.sh ./run-tests.sh
RUN chmod +x run-tests.sh

CMD ["./run-tests.sh"]
