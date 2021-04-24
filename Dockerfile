FROM node:14
ENV NODE_ENV=production
WORKDIR /app
COPY . /app
RUN npm install --production
COPY . .
EXPOSE 3000

CMD ["npm", "start"]
