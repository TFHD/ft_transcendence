#!/bin/bash

IP=$(ifconfig eno2 | grep 'inet ' | awk '{print $2}')
sed -i "s/^VITE_ADDRESS=.*/VITE_ADDRESS=$IP/" "front/.env"
sed -i "s/^ADDRESS=.*/ADDRESS=$IP/" "back/.env"
