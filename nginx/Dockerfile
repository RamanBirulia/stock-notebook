FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Copy frontend build files
COPY frontend/build /var/www/html

# Create directories for logs and SSL
RUN mkdir -p /var/log/nginx /etc/nginx/ssl

# Set proper permissions
RUN chown -R nginx:nginx /var/www/html /var/log/nginx && \
    chmod -R 755 /var/www/html

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
