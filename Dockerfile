FROM node:20.18

RUN mkdir /app

COPY . /app

WORKDIR /app

EXPOSE 3000