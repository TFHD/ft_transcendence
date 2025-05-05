#!/bin/bash

IP=$(ifconfig eno2 | grep 'inet ' | awk '{print $2}')
FICHIER="front/.env"
sed -i "s/^VITE_ADDRESS=.*/VITE_ADDRESS=$IP/" "$FICHIER"
