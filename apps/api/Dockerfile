FROM node:20

# Install LibreOffice, Chrome, and necessary dependencies
# RUN --mount=type=cache,target=/var/cache/apt \
#     --mount=type=cache,target=/var/lib/apt \
#     apt-get update && \
#     apt-get install -y \
#         libreoffice \
#         fontconfig \
#         fonts-dejavu \
#         curl \
#         wget \
#         gnupg && \
#     wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
#     sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
#     apt-get update && \
#     apt-get install -y \
#         google-chrome-stable \
#         fonts-ipafont-gothic \
#         fonts-wqy-zenhei \
#         fonts-thai-tlwg \
#         fonts-kacst \
#         fonts-freefont-ttf \
#         libxss1 \
#         libappindicator3-1 \
#         libasound2 \
#         libatk-bridge2.0-0 \
#         libatk1.0-0 \
#         libcups2 \
#         libdbus-1-3 \
#         libdrm2 \
#         libgbm1 \
#         libgtk-3-0 \
#         libnspr4 \
#         libnss3 \
#         libx11-xcb1 \
#         libxcomposite1 \
#         libxdamage1 \
#         libxfixes3 \
#         libxrandr2 \
#         xdg-utils \
#         --no-install-recommends && \
#     rm -rf /var/lib/apt/lists/*

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
