# RAYVYN

RAYVYN website source, local assets, and Python preview server.

## Run locally

Requires Python 3. From the repository root:

```sh
python frontend/serve.py 8849
```

Open http://127.0.0.1:8849/ . No package installation is required.

## Project structure

- `frontend/site/`: HTML, CSS, JavaScript, fonts, images, and CMS data.
- `frontend/serve.py`: preview server with clean routes and the custom CMS byte-range protocol used by the documentation pages.
- `build_frontend.py`: script used to generate the customized frontend.
- `preview-desktop.png`, `preview-mobile.png`: visual previews.

The committed site files are ready to run; rebuilding is optional. Use the included server to preview all pages, because a basic static server does not implement the CMS query-range protocol.

Uploading this repository does not automatically create a publicly hosted website.
