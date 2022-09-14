if [ -f /var/www/html/clipboard ]
then
    sudo rm -rf /var/www/html/clipboard/*
else
    sudo mkdir -p /var/www/html/clipboard
fi

sudo cp -R * /var/www/html/clipboard
