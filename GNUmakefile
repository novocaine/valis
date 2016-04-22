APP_ES6 = $(shell find www/js/app -type f -name '*.js') www/js/app.js
LIBS = $(shell find www/js/lib -type f -name '*.js')
CSS = $(shell find www/css -type f -name '*.css')
CSS_TARGETS = $(CSS:www/css/%.css=build/es5/css/%.css)

HTML_TARGETS = build/es5/index.html

SOURCES = $(APP_ES6) $(LIBS)
ES5_TARGETS = $(SOURCES:www/js/%.js=build/es5/js/%.js)

NODE = node
BABEL = $(NODE) node_modules/babel-cli/bin/babel

TARGETS = $(ES5_TARGETS) $(CSS_TARGETS) $(HTML_TARGETS)

build: $(TARGETS)

clean:
	rm -rf build/es5

build/es5/js/lib/%.js: www/js/lib/%.js
	mkdir -p $(@D)
	cp $< $@

build/es5/css/%.css: www/css/%.css
	mkdir -p $(@D)
	cp $< $@

build/es5/%.html: www/%.html
	mkdir -p $(@D)
	cp $< $@

build/es5/js/%.js: www/js/%.js
	mkdir -p $(@D)
	$(BABEL) $< -o $@
