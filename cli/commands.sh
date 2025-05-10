#!/bin/bash

cd include/
tar -xvf dependancies.tar.gz
cd curl/
./configure --prefix=$PWD/../../ --with-ssl --without-libpsl
make
make install

cd ../nopoll/
./autogen.sh
./configure --prefix=$PWD/../../
make
make install

cd ../cJSON/
mkdir build
cd build
cmake .. -DCMAKE_INSTALL_PREFIX=$PWD/../../../ -DENABLE_CJSON_TEST=Off -DCMAKE_POLICY_VERSION_MINIMUM=3.5
make
make install

cd ../../../

#Apres dans le terminal il faut faire : export LD_LIBRARY_PATH=$PWD/lib
