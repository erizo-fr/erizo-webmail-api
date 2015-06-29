#!/bin/bash

echo ""
echo "--------------------------------------------------"
echo "SMTP service ..."
echo "--------------------------------------------------"

echo "Installing ..."
apt-get install -y exim4


echo "Configuring ..."

# Use split config mode
sed -i "s/dc_use_split_config.*$/dc_use_split_config='true'/" /etc/exim4/update-exim4.conf.conf

# Use localhost as domain name
sed -i "s/dc_other_hostnames.*$/dc_other_hostnames='localhost'/" /etc/exim4/update-exim4.conf.conf

# Listen every IP
sed -i "s/dc_local_interfaces.*$/dc_local_interfaces='0.0.0.0'/" /etc/exim4/update-exim4.conf.conf

# Use LMTP transport
sed -i 's/^\s*transport\s=.*$/  transport = dovecot_lmtp/' /etc/exim4/conf.d/router/900_exim4-config_local_user

# Setup LMTP transport
cat > /etc/exim4/conf.d/transport/99_exim4-config_dovecot <<- EOM
dovecot_lmtp:
        driver = lmtp
        socket = /var/run/dovecot/lmtp
        batch_max = 200
EOM

echo "Reload configuration ..."
update-exim4.conf
/etc/init.d/exim4 reload
