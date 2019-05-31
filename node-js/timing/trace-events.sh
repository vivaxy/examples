#!/usr/bin/env bash
node --trace-event-categories=v8,node.vm,node.bootstrap timing.js
