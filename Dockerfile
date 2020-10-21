FROM php:7.2-apache
RUN apt update
WORKDIR /var/www/html
RUN rm -rf *
COPY ./ /var/www/html
RUN chown -R www-data:www-data /var/www/html