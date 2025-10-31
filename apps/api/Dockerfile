# syntax=docker/dockerfile:1.4
FROM node:20

# Install LibreOffice, Chrome, and necessary dependencies
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && \
    apt-get install -y \
        libreoffice \
        fontconfig \
        fonts-dejavu \
        curl \
        wget \
        gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y \
        google-chrome-stable \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        fonts-freefont-ttf \
        libxss1 \
        --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# Set up working directory
WORKDIR /app

# Copy package.json and dependencies to install first
COPY package.json ./

# Install project dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Copy project source code
COPY . .

# Build the application
RUN pnpm run build

