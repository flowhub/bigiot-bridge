FROM mhart/alpine-node:8

WORKDIR /app
COPY . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN npm install --production

# Note: EXPOSE is not supported by Heroku, application must respect $PORT
EXPOSE 5000
CMD ["node", "index.js"]
