FROM node:latest

ADD idl /usr/src/idl
ADD orders /usr/src/orders

WORKDIR /usr/src/orders

RUN npm install

ENTRYPOINT [ "node", "service.js" ]

EXPOSE 3004
