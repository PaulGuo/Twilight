SHELL := /bin/bash
PATH := ./node_modules/.bin:$(PATH)

dev: cleanup
	@node ./build/restart-electron-main.js & \
		webpack --watch --config ./build/webpack.main.config.js & \
		webpack-dev-server --config ./build/webpack.renderer.config.js & \
		wait

lint:
	eslint --ext .js,.vue src

cleanup:
	rm -rf ./dist/*

build-main: cleanup
	NODE_ENV=production webpack --config ./build/webpack.main.config.js

build-renderer: cleanup
	NODE_ENV=production webpack --config ./build/webpack.renderer.config.js

build-pack: build-main build-renderer
	electron-builder --dir

build-dist: build-main build-renderer
	electron-builder

.PHONY: dev lint build-dist build-pack cleanup build-main build-renderer
