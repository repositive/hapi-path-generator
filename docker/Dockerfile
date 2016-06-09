FROM ubuntu
MAINTAINER Istar Eldritch

RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && ln -s /usr/bin/nodejs /usr/bin/node

ENV PROJECT_PATH /opt

WORKDIR $PROJECT_PATH

CMD ["node"]
