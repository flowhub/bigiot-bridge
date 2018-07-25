FROM mhart/alpine-node:8

WORKDIR /app
COPY . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN npm install --production

# Run the image as a non-root user
RUN adduser -D flowuser
USER flowuser

# Note: EXPOSE is not supported by Heroku, application must respect $PORT
EXPOSE 5000

CMD ["node", "./node_modules/.bin/noflo-nodejs", "--open", "false", "--graph", "graphs/RunParkingProvider.fbp"]
