FROM node:alpine
RUN apk update && apk upgrade && apk --no-cache add curl
WORKDIR /usr/src/app
COPY package.json tsconfig.json ./
COPY src src
RUN yarn install
RUN yarn build
EXPOSE 3000
CMD [ "yarn", "start" ]