all: flowtip.js flowtip-noamd.js

flowtip.js: lib/*.jsx
	node node_modules/requirejs/bin/r.js -o build.js out=flowtip.js

flowtip-noamd.js: lib/*.jsx
	node node_modules/requirejs/bin/r.js -o build-noamd.js out=flowtip-noamd.js
