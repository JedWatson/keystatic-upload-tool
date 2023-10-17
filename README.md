# Keystatic Cloud Image Upload Tool

This is a proof-of-concept tool for bulk uploading images to Keystatic Cloud.

It takes a directory of images `./images` and uploads them one by one to
Keystatic Cloud, storing succesful images in `./results.json`.

Images successfully uploaded (and present in the results) won't be re-uploaded
on subsequent runs of the script.

## Requirements

- A [Keystatic Cloud](https://keystatic.cloud) account with billing and images
  enabled (if you haven't been onboarded yet, talk to us in the
  [Keystatic Discord](https://keystatic.com/chat) cloud channel)

- Images must be `png`, `jpg`, `jpeg`, `gif` or `webp` with filenames that only
  contain alphanumeric characters, dashes and underscores (less than 255
  characters) and are less than 5MB in size

## Setup

First, clone this repo and place the images you want to upload in the
`./images` folder.

To use the tool, you'll need to create a `.env` file in the root of the project
that stores your Keystatic Cloud Project Key and a Session Cookie.

Your `.env` file should look like this:

```
PROJECT="..."
SESSION_COOKIE="..."
```

To get the value of your session cookie, log into [Keystatic Cloud](https://keystatic.cloud),
then use the browser's dev tools to inspect your cookies. Find the cookie called
`keystatic.session`, and copy the value.

To get your project key, go to your project settings in Keystatic Cloud, and
copy it. It will look like `team/project`.

## Uploading Images

To start the script, make sure you're using Node.js 18+ and run `npm start`.

It will loop through the images, uploading them, and storing the result in a
file called `./results.json` (which is ignored in git).

Each successful upload will have an entry created, with the original filename,
and the corresponding image ID and filename.

Errors will be logged to the console.

You can then use the result data to reference uploaded images in your Keystatic
project. The full URL can be figured out by opening the image library, and
copying the URL for one of the uploaded images; this gives you the full prefix
for your project images on `keystatic.net`.

The pattern for Image URLs on Keystatic Cloud is
`https://${team}.keystatic.net/${project}/images/{image-id}/{image-filename}`

Note that the `team` and `project` keys used are unique IDs and not the keys
specified in your Project Key (they are unique and will not ever change).

So to use the results from this upload tool, take the prefix from any image:
`https://${team}.keystatic.net/${project}/images/` and add the part from the
results: `{image-id}/{image-filename}` to build the full URL.

## Disclaimer

This is just a proof of concept! It relies on Keystatic Cloud internals that
may change at any time. Please don't have long-term expectations of it.

If you've got any questions, talk to me on the Keystatic Discord!

## Copyright

Copyright (c) Jed Watson 2023. MIT Licensed.
