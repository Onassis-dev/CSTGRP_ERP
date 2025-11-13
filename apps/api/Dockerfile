FROM node:20

#Install LibreOffice, Chrome, and necessary dependencies
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y \
        libreoffice \
        fontconfig \
        fonts-dejavu \
        curl \
        wget \
        gnupg \
        google-chrome-stable \
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

# Expose port and run the application
EXPOSE 3000
CMD ["node", "dist/main.js"]
