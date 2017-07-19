SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)

dev:
	node build/dev.js

lint:
	eslint --ext .js,.vue src

build-prepare:
	rm -rf 'dist/*'

build-main: build-prepare
	NODE_ENV=production webpack --config build/webpack.main.config.js

build-renderer: build-prepare
	NODE_ENV=production webpack --config build/webpack.renderer.config.js

build-pack: build-prepare build-main build-renderer
	electron-builder --dir

build-dist: build-prepare build-main build-renderer
	electron-builder

.PHONY: dev lint build-dist build-pack build-prepare build-main build-renderer
