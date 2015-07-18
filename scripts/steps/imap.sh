#!/bin/bash

DIR=$(dirname "$0")
RESOURCE_DIR="$DIR/.."

echo ""
echo "--------------------------------------------------"
echo "IMAP service ..."
echo "--------------------------------------------------"


command -v dovecot >/dev/null 2>&1 || {
	echo "Installing ..."
	apt-get install -y dovecot-core dovecot-imapd dovecot-lmtpd
}

echo "Configuring ..."
cp -r $RESOURCE_DIR/resources/dovecot/etc/* /etc/dovecot

echo "Reload configuration ..."
service dovecot restart
