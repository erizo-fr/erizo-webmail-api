#!/bin/bash

echo ""
echo "--------------------------------------------------"
echo "DAV service ..."
echo "--------------------------------------------------"

echo "Cleaning ..."
rm -rf /usr/share/nginx/www/dav

echo "Installing dependencies ..."
apt-get install php5-sqlite

echo "Downloading Sabre DAV server ..."
mkdir /usr/share/nginx/www/dav
curl -L -s http://baikal-server.com/get/baikal-flat-0.2.7.zip > /usr/share/nginx/www/dav/dav.zip

echo "Installing ..."
cd /usr/share/nginx/www/dav
unzip dav.zip > /dev/null
rm /usr/share/nginx/www/dav/dav.zip
shopt -s dotglob nullglob
mv /usr/share/nginx/www/dav/baikal-flat/* /usr/share/nginx/www/dav/
rmdir /usr/share/nginx/www/dav/baikal-flat

echo "Configuring ..."

# Database
rm -rf /usr/share/nginx/www/dav/Specific/
mkdir -p /usr/share/nginx/www/dav/Specific/db
cp /vagrant/scripts/resources/dav/db.sqlite /usr/share/nginx/www/dav/Specific/db/

# config.php
cat > /usr/share/nginx/www/dav/Specific/config.php <<- EOM
<?php
define("PROJECT_TIMEZONE", 'Europe/Paris');
define("BAIKAL_CARD_ENABLED", TRUE);
define("BAIKAL_CAL_ENABLED", TRUE);
define("BAIKAL_DAV_AUTH_TYPE", 'Basic');
define("BAIKAL_ADMIN_ENABLED", TRUE);
define("BAIKAL_ADMIN_AUTOLOCKENABLED", FALSE);
define("BAIKAL_ADMIN_PASSWORDHASH", 'ccd25b06c60141fbff5689806eb04107');
?>
EOM

# config.system.php
cat > /usr/share/nginx/www/dav/Specific/config.system.php <<- EOM
<?php
define("BAIKAL_PATH_SABREDAV", PROJECT_PATH_FRAMEWORKS . "SabreDAV/lib/Sabre/");
define("BAIKAL_AUTH_REALM", 'BaikalDAV');
define("BAIKAL_CARD_BASEURI", PROJECT_BASEURI . "card.php/");
define("BAIKAL_CAL_BASEURI", PROJECT_BASEURI . "cal.php/");
define("PROJECT_SQLITE_FILE", PROJECT_PATH_SPECIFIC . "db/db.sqlite");
define("PROJECT_DB_MYSQL", FALSE);
define("PROJECT_DB_MYSQL_HOST", '');
define("PROJECT_DB_MYSQL_DBNAME", '');
define("PROJECT_DB_MYSQL_USERNAME", '');
define("PROJECT_DB_MYSQL_PASSWORD", '');
define("BAIKAL_ENCRYPTION_KEY", '53f7d527aa64393aa475a4e7bbf96523');
define("BAIKAL_CONFIGURED_VERSION", '0.2.7')
?>
EOM

chown -R www-data:www-data /usr/share/nginx/www/dav/
