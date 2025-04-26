#!/bin/bash

IP=$(ifconfig eno2 | grep 'inet ' | awk '{print $2}')
FICHIER="front/.env"
sed -i "s/^VITE_ADRESS=.*/VITE_ADRESS=$IP/" "$FICHIER"
