SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)

dev:
	node build/dev.js

lint:
	eslint --ext .js,.vue src

build-main:
	NODE_ENV=production webpack --config build/webpack.main.config.js

build-renderer:
	NODE_ENV=production webpack --config build/webpack.renderer.config.js

build: build-main build-renderer
	electron-builder --dir

.PHONY: dev lint build build-main build-renderer
