APP_ES6 = $(shell find www/js/app -type f -name '*.js') www/js/app.js
LIBS = $(shell find www/js/lib -type f -name '*.js')
CSS_SOURCES = $(shell find www/css -type f -name '*.css')

LESS_SOURCES = $(shell find www/less -type f -name '*.less')
LESS_TARGETS = $(LESS_SOURCES:www/less/%.less=build/es5/css/%.css)

CSS_TARGETS = $(CSS_SOURCES:www/css/%.css=build/es5/css/%.css) 

HTML_TARGETS = build/es5/index.html

SOURCES = $(APP_ES6) $(LIBS)
ES5_TARGETS = $(SOURCES:www/js/%.js=build/es5/js/%.js)

NODE = node
BABEL = $(NODE) node_modules/babel-cli/bin/babel
LESS = node_modules/less/bin/lessc

TARGETS = $(ES5_TARGETS) $(LESS_TARGETS) $(CSS_TARGETS) $(HTML_TARGETS)

build: $(TARGETS)

clean:
	rm -rf build/es5

build/es5/js/lib/%.js: www/js/lib/%.js
	mkdir -p $(@D)
	cp $< $@

build/es5/%.html: www/%.html
	mkdir -p $(@D)
	cp $< $@

build/es5/js/%.js: www/js/%.js
	mkdir -p $(@D)
	$(BABEL) $< -o $@

build/less/%.less: www/less/%.less
	$(LESS) $< $@

.SECONDEXPANSION:
build/es5/css/%.css: $$(if $$(findstring $$@,$(CSS_TARGETS)),www/css/$$*.css,build/less/$$*.less)
	mkdir -p $(@D)
	cp $< $@
