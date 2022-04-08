FROM node:latest
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx tsc
EXPOSE 3010
# CMD ["sleep", "3600"]
# hit an ERR_OSSL_EVP_UNSUPPORTED error
ENV NODE_OPTIONS=--openssl-legacy-provider
CMD [ "node", "app.js"]


# docker build -t superheatedboy/svcresourceapi:latest .
# docker run -it -p 3010:3010 superheatedboy/svcresourceapi:latest sh

# docker exec -it 6ede9451a2b6 sh 
