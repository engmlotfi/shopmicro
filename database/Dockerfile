FROM mysql:5.6

ENV MYSQL_DATABASE shop
ENV MYSQL_ROOT_PASSWORD=Micro@123
ENV TZ=Europe/Dublin

# Add the content of the / directory to your image
# All scripts in docker-entrypoint-initdb.d/ are automatically
# executed during container startup

ADD database/shopDB.sql /docker-entrypoint-initdb.d/shopDB.sql

EXPOSE 3306


