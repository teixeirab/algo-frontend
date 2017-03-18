FROM nginx:1.11.5

RUN apt-get update
RUN apt-get install vim -y
RUN apt-get -y install g++
RUN apt-get install build-essential -y

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
