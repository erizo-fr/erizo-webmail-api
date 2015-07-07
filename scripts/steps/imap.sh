#!/bin/bash

echo ""
echo "--------------------------------------------------"
echo "IMAP service ..."
echo "--------------------------------------------------"

command -v dovecot >/dev/null 2>&1 || {
	echo "Installing ..."
	apt-get install -y dovecot-imapd dovecot-lmtpd
}

echo "Configuring ..."

# Use maildir
sed -i 's/^#mail_location.*$/mail_location = maildir:~\/Maildir/' /etc/dovecot/conf.d/10-mail.conf

# Strip domain from auth attempts
sed -i 's/^.*auth_username_format.*$/auth_username_format = %Ln/' /etc/dovecot/conf.d/10-auth.conf

# Allow unsecured auth
sed -i 's/^#disable_plaintext_auth.*$/disable_plaintext_auth = no/' /etc/dovecot/conf.d/10-auth.conf

# Add postmaster address
sed -i 's/protocol lmtp {/protocol lmtp {\n  postmaster_address = root@localhost/' 20-lmtp.conf

echo "Reload configuration ..."
/etc/init.d/dovecot restart
