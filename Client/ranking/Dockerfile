FROM node:18.20.8

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs \
    npm                       # note this one

WORKDIR /usr/src/react

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]