# The home of our website.
Built on NextJS with TailwindCSS.

## Dev build

First make a env.app file from the 

```
npm i
npm run dev
```

## Deployment

This application has nginx and certbot bundled into it. Github actions will do most of the heavy lifting and automatically deploy when pushing to the master branch.

After the first deployment, you will need to edit the ./nginx/templates/default.template.conf to remove the 443 configurations. Now would be a good time to double check the DNS records. Restart the nginx container on the server and run:
```
docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ -d abonitech.com
```
This will issue a new certificate. This certificate is now stored in a docker volume, and we don't want to accidentally delete it. It will expire in 3 months, so we should remember to renew it with:
```
docker compose run --rm certbot renew
```

Once we have a certificate, we can edit the ./nginx/templates/default.template.conf to include the 443 configurations again. Restart the nginx container on the server and we should be good to go.

## Thanks

Thanks to the NextJS and TailwindCSS teams for making this easy. Peace out.

