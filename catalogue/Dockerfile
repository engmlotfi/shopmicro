FROM node:latest

ADD idl /usr/src/idl
ADD catalogue /usr/src/catalogue

WORKDIR /usr/src/catalogue

RUN npm install

ENTRYPOINT [ "node", "service.js" ]

EXPOSE 3002
