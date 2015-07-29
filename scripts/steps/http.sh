#!/bin/bash

echo ""
echo "--------------------------------------------------"
echo "HTTP service ..."
echo "--------------------------------------------------"

command -v nginx >/dev/null 2>&1 || {
	echo "Installing Nginx ..."
	apt-get install -y nginx
}

command -v php5-fpm >/dev/null 2>&1 || {
	echo "Installing PHP..."
	apt-get install -y php5-fpm
}

echo "Setting up configuration ..."
cat > /etc/nginx/sites-available/default <<- EOM
server {
	listen   8080;

	root /usr/share/nginx/www;
	index index.php index.html;

	location / {
		try_files \$uri \$uri/ /index.php?\$args;
	}

	location ~ ^(.+\.php)(.*) {
		fastcgi_split_path_info ^(.+\.php)(.*)\$;
		fastcgi_pass localhost:9000;
		fastcgi_index index.php;
		include fastcgi_params;
	}

	location ~ /\.ht {
		deny all;
	}
}
EOM

echo "Reload services ..."
service nginx restart
service php5-fpm restart
