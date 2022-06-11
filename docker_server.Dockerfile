FROM node:18

COPY . /usr/local/app

WORKDIR /usr/local/app

RUN yarn install

RUN yarn run build

CMD [ "yarn", "run", "start" ]