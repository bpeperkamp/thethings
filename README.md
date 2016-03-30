# Ionic starter IoT app, for communication with thethings.io (released as-is...)

For information on howto start with Ionic, you should start reading here: http://ionicframework.com/getting-started/

The developer documentation for thethings.io is located here: https://developers.thethings.io/index.html

Both these sites are very important for reading and understanding howto build all included here. Unfortunately, due to work, i have little time to offer support, so read carefully :)

Lastly, the software used for driving the arduino is located here: https://cylonjs.com (you can find information on how and what type of electronics you can use)


## The Node application

I built the serverside app on Node and used CylonJS for driving the arduino. It's probably quite easy to use Johnnyfive(js) as well, but you have to figure that out yourself. You should flash the firmata firmware before use, otherwise it won't work. (read here, howto do that: http://cylonjs.com/documentation/platforms/arduino/) For communication i used MQTT, which is quite small and fast, so it won't use a lot off bandwidth/battery. I uploaded all of the node_modules, but in some cases you will have to remove them first and install them for your platform. For example on Linux: Goto the server directory and remove node_modules (rm -rvf node_modules). Then reinstall them with "npm install". Running the server is easy, just use "node server.js", or use "forever" instead of "node" (npm install forever -g). 

## The Ionic App

You can start the app with "ionic serve" from the app directory, it will then be served via a regular webserver (http://localhost:8100 by default). For building for a specific platform i suggest you read here: http://ionicframework.com/docs/cli/run.html
