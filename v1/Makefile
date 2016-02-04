all: flowtip.js

flowtip.js: flowtip.coffee coordinator.coffee
	cat flowtip.coffee coordinator.coffee | coffee -c -s > flowtip.js
	cp flowtip.js pages/flowtip.js

