all: flowtip.js flowtip.min.js flowtip-noamd.js flowtip-noamd.min.js

flowtip.js: lib/*.jsx
	node node_modules/requirejs/bin/r.js -o build.js out=flowtip.js

flowtip-noamd.js: lib/*.jsx
	node node_modules/requirejs/bin/r.js -o build-noamd.js out=flowtip-noamd.js

flowtip.min.js: flowtip.js
	node node_modules/uglify-js/bin/uglifyjs -c -o flowtip.min.js --source-map flowtip.min.js.map flowtip.js

flowtip-noamd.min.js: flowtip-noamd.js
	node node_modules/uglify-js/bin/uglifyjs -c -o flowtip-noamd.min.js --source-map flowtip-noamd.min.js.map flowtip-noamd.js
