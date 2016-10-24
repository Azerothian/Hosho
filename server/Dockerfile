FROM node:6.5.0

ENV NODE_ENV production

ENV DEBUG * 

RUN apt-get update \
  && apt-get install -y build-essential ca-certificates

RUN mkdir -p /app/build/

WORKDIR /app/

COPY package.json /app/

RUN cd /app/ && npm install --production

RUN apt-get remove -y build-essential \
  && apt-get autoremove -y \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY /build /app/build/

CMD node --max_old_space_size=16384 ./build/index.js
