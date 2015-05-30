#!/bin/bash

# Update APT repo
apt-get update > /dev/null

# Configure .bashrc
cat >> /home/vagrant/.bashrc <<- EOM
{
alias ls='ls --color=always'
alias dir='dir --color=always'
alias ll='ls -alh'
}
EOM
cat >> /root/.bashrc <<- EOM
{
alias ls='ls --color=always'
alias dir='dir --color=always'
alias ll='ls -alh'
}
EOM


echo "Cleaning users ..."

if getent passwd homer > /dev/null 2>&1; then
	userdel homer
	rm -rf /home/homer
fi
if getent passwd marge > /dev/null 2>&1; then
	userdel marge
	rm -rf /home/marge
fi
if getent passwd bart > /dev/null 2>&1; then
	userdel bart
	rm -rf /home/bart
fi
if getent passwd lisa > /dev/null 2>&1; then
	userdel lisa
	rm -rf /home/lisa
fi
if getent passwd maggie > /dev/null 2>&1; then
	userdel maggie
	rm -rf /home/maggie
fi


echo "Create users ..."

echo "homer:homer => homer@localhost"
useradd --create-home --password hq0OflagTfW9. homer
echo "marge:marge => marge@localhost"
useradd --create-home --password QJDcPXOw1.t4c marge
echo "bart:bart => bart@localhost"
useradd --create-home --password bx6TtFUjV8ZAw bart
echo "lisa:lisa => lisa@localhost"
useradd --create-home --password jTWQLpkeV7rqg lisa
echo "maggie:maggie => maggie@localhost"
useradd --create-home --password 5duY88tboqb2I maggie


