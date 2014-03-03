Personalised interesting markets dashboard which computes data from the API to produce real time indexes for four different types of activity.

To run:
   - install nodejs
   - install npm
   - cd to root folder
   - type 'npm install'
   - type 'node client/server.js'
   - open another terminal window
   - cd to root folder
   - type 'node server/server.js'
   - open chrome, go to http://localhost:8888/
   
   

Presentation notes:

- go through each 'volatility' endpoint individually, talk through how each was computed
- show ability to compare with epics
- talk through how suggestedMarkets works, but state that this is just one thing you could provide the user with
- show pie charts, one at a time, make light of the tweet breakdown, it's a small ui thing
- mention possible use cases:
- - replacement for popular prices, 
- - an auto watchlist of interesting markets, 
- - a suggestion after a trade is placed, 
- - in app growls or something,
- - stand alone app
- - analysis/volatility public api?
