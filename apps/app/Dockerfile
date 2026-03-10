FROM node:20-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm

ARG VITE_BASEURL
ENV VITE_BASEURL=${VITE_BASEURL}

WORKDIR /app
COPY . .

RUN pnpm install

RUN pnpm run build

FROM nginx

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
