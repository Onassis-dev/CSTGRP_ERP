FROM node:20

# Instalar LibreOffice, fontconfig, y dependencias necesarias
RUN apt-get update && \
    apt-get install -y \
    libreoffice libreoffice-writer libreoffice-calc \
    fontconfig fonts-dejavu curl gnupg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# Configuración del directorio de trabajo
WORKDIR /app

# Copiar el package.json y las dependencias para que se instalen primero
COPY package.json ./

# Instalar dependencias del proyecto
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Copiar el código fuente del proyecto
COPY . .

# Construir la aplicación
RUN pnpm run build

# Exponer el puerto y ejecutar la aplicación
EXPOSE 3000
CMD ["node", "dist/main.js"]
