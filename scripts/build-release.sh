#!/bin/bash
VERSION="1.0.0"
BASEDIR=$(dirname "$PWD")

rm -rf $BASEDIR/api/__pycache__

build_deb(){
    local RELEASEDEB=$BASEDIR/build/cockpit-task-manager_$VERSION-debian
    local COCKPITDIR=$RELEASEDEB/usr/share/cockpit/cockpit-task-manager
    mkdir -p $RELEASEDEB/DEBIAN $COCKPITDIR
    cp -r $BASEDIR/api $COCKPITDIR 
    cp -r $BASEDIR/static $COCKPITDIR
    cp -r $BASEDIR/images $COCKPITDIR
    cp $BASEDIR/{LICENSE,manager.py,README.md,manifest.json,requirements.txt,tasks.html} $COCKPITDIR

    CONTROL="Package: cockpit-task-manager                        
Version: $VERSION
Section: utils
Priority: optional
Architecture: all
Depends: python3, python3-venv
Maintainer: Tony Ch. <t0nyc23@proton.me>
Description: A simple TO-DO/task manager for Cockpit."

    echo "$CONTROL" | tee $RELEASEDEB/DEBIAN/control > /dev/null
    cp $PWD/postinst.template $RELEASEDEB/DEBIAN/postinst
    dpkg-deb --build $RELEASEDEB
    rm -rf $RELEASEDEB
}

build_source(){
    local SOURCERELEASE=$BASEDIR/build/cockpit-task-manager_$VERSION
    mkdir -p $SOURCERELEASE
    cp -r $BASEDIR/scripts $SOURCERELEASE
    cp -r $BASEDIR/static $SOURCERELEASE
    cp -r $BASEDIR/api $SOURCERELEASE
    cp -r $BASEDIR/images $SOURCERELEASE
    cp $BASEDIR/{LICENSE,manager.py,README.md,manifest.json,requirements.txt,tasks.html,Dockerfile} $SOURCERELEASE

    cd ../build
    zip -r cockpit-task-manager_$VERSION.zip cockpit-task-manager_$VERSION
    tar czvf cockpit-task-manager_$VERSION.tar.gz cockpit-task-manager_$VERSION
    cd ../scripts

    rm -rf $SOURCERELEASE
}

build_source
build_deb
