# Development stage
FROM node:22 AS dev
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json  
RUN npm install
COPY . /app
CMD ["npm", "start"]

# Build the react app
FROM node:22 AS build
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json  
RUN npm install
COPY . /app
RUN npm run build

# Serve the react app
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
