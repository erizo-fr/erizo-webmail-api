#!/bin/bash

# Install user conf
/vagrant/scripts/steps/user-conf.sh

# Install build tools
/vagrant/scripts/steps/build-tools.sh

# Installing IMAP server
/vagrant/scripts/steps/imap.sh

# Installing IMAP server
/vagrant/scripts/steps/smtp.sh

# Installing HTTP server
/vagrant/scripts/steps/http.sh

# Installing Dav server
/vagrant/scripts/steps/dav.sh
