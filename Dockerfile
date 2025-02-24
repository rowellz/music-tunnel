FROM node:19.0.0

WORKDIR /slick-portfolio-svelte

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev" ]