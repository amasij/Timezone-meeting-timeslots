FROM node:alpine

#Specify a working directory
WORKDIR /usr/app

#Copy the dependencies file
COPY ./package.json ./

#Install dependencies
RUN npm install --verbose --unsafe

#Copy remaining files
COPY ./ ./

#Default command
CMD ["npm","start"]