FROM ubuntu
MAINTAINER Istar Eldritch

RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && ln -s /usr/bin/nodejs /usr/bin/node

ENV PROJECT_PATH /opt
ENV PORT 3000

WORKDIR $PROJECT_PATH

EXPOSE $PORT

CMD ["node"]
