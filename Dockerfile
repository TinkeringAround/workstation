FROM node:slim
RUN apt-get update && apt-get install -y curl
WORKDIR /usr/src/app
COPY package.json yarn.lock tsconfig.json ./
COPY src src
RUN yarn
RUN yarn build
EXPOSE 3000
CMD [ "yarn", "start" ]