FROM nginx:1.11.5

RUN apt-get update
RUN apt-get install vim -y
RUN apt-get -y install g++
RUN apt-get install build-essential -y
# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 4.6.0

RUN apt-get install curl -y

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get install nodejs build-essential -y

RUN npm install -g gulp

WORKDIR /usr/share/nginx/html
ADD package.json /usr/share/nginx/html

RUN npm install

ADD . /usr/share/nginx/html
ADD ./nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod a+x ./entrypoint.sh
CMD ./entrypoint.sh
