# nc-website

The website of [Nimble Commander-Fork](https://github.com/cfanmaoli/nimble-commander), adapted
from the original [nimble-commander-website](https://github.com/mikekazakov/nimble-commander-website)
by Michael Kazakov (GPLv3, see LICENSE.md).

## Preview

The site is plain static HTML with no build step:

    python3 -m http.server 8000

Then open <http://127.0.0.1:8000/>. Subpages work with relative links only, so previewing from the
repository root keeps them intact.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Landing page: showcase, product focus, features, fork-vs-original comparison, download |
| `download/` | Download, installation and quarantine notes, RAR component, language packs |
| `whats-new/` | Release highlights with links to WHATS_NEW.md and GitHub Releases |
| `support/` | Issue tracker, discussions, user guide, companion repositories |
| `privacy/` | Privacy policy for the app and this static site |
| `css/style.css`, `img/` | Design and screenshots from the original site |
| `.nojekyll` | Serve the files as-is on GitHub Pages |

## Deploying

Push to `main` and enable GitHub Pages for the repository (deploy from the `main` branch, root
folder). The site is then available at <https://cfanmaoli.github.io/nc-website/>.
