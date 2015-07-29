#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# Install user conf
$DIR/steps/user-conf.sh

# Install build tools
$DIR/steps/build-tools.sh

# Installing IMAP server
$DIR/steps/imap.sh

# Installing SMTP server
$DIR/steps/smtp.sh

# Installing HTTP server
$DIR/steps/http.sh

# Installing Dav server
$DIR/steps/dav.sh
