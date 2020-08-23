FROM node:latest

ADD idl /usr/src/idl
ADD users /usr/src/users

WORKDIR /usr/src/users

RUN npm install

ENTRYPOINT [ "node", "service.js" ]

EXPOSE 3001
