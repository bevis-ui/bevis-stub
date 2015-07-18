NPM_BIN = $(shell npm bin)
ENB = $(NPM_BIN)/enb
# YENV := 

all: npm build app-dev

# Install npm modules
.PHONY: npm
npm::
	@npm install

# Lint js files
.PHONY: lint
lint::
	@$(NPM_BIN)/jshint-groups
	@$(NPM_BIN)/jscs .

# Build and run tests
.PHONY: test
test:
	$(ENB) make test -n
	$(NPM_BIN)/mocha-phantomjs $(MOCHA_FLAGS) test/test.html

# Build project
.PHONY: build
build:
	$(ENB) make

# Clean build results
.PHONY: clean
clean:
	$(ENB) make clean

# Create new page
.PHONY: page
page:
	./tools/make-page.sh

# Create new block
.PHONY: block
block:
	./tools/make-block.sh

# Run application in development mode
app-dev:
	@$(NPM_BIN)/supervisor -w server,configs -- server/boot.js
