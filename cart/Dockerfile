FROM node:latest

ADD idl /usr/src/idl
ADD cart /usr/src/cart

WORKDIR /usr/src/cart

RUN npm install

ENTRYPOINT [ "node", "service.js" ]

EXPOSE 3003
