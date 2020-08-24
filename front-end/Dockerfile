FROM node:latest

ADD idl /usr/src/idl
ADD front-end /usr/src/front-end

WORKDIR /usr/src/front-end

RUN npm install

ENTRYPOINT [ "node", "server.js" ]

EXPOSE 8080
