# CARTA LAB Web Engine

CARTA LAB is a highly customizable, lightweight frontend engine built for dynamic psychological, aesthetic, and strategic quizzes. It evaluates users across 5 dimensions and outputs bespoke insights, a beautiful radar chart, a social-ready poster, and a deep-dive handbook.

## 🚀 Features

- **Dynamic Quiz Engine**: Fetches and renders tests on the fly from JSON configurations. No hardcoded logic required to add a new test domain.
- **Dimensional Scoring**: Calculates scores across 5 customizable axes (e.g., Rationality vs. Emotion, Introversion vs. Extroversion) and maps them to distinct user archetypes.
- **Aesthetic UI/UX**: Designed with a "Morandi Italian" aesthetic, featuring a smooth `Noto Serif SC` font, elegant pastel colors, glassmorphism overlays, and a sophisticated minimalist vibe.
- **Social Poster Generation**: Generates high-quality, long-form social media posters (perfect for WeChat/Xiaohongshu) using `html-to-image`, fully compatible with iOS Safari and mobile browsers.
- **Deep-Dive Handbooks**: Generates 1000+ word, highly actionable, custom-formatted HTML handbooks for each topic. Includes hashed URL routing to prevent unauthorized scraping/guessing of premium content.
- **Serverless & Edge Ready**: Built entirely with static files (HTML/CSS/JS) and JSON data. Hosted seamlessly on Cloudflare Pages (or GitHub Pages) for instant global edge delivery.

## 🏗️ Architecture & Structure

The repository is structured to separate content (Data/Handbooks) from logic (JS) and presentation (CSS/HTML).

```text
cartalab-web/
├── generate_handbooks.py   # Python script to generate hashed HTML handbooks & update JSONs
└── public/                 # The actual web root deployed to Cloudflare Pages
    ├── index.html          # Main entry point (Quiz UI, Catalog, Loading States)
    ├── css/
    │   └── carta-core.css  # Core Morandi Italian aesthetic styling
    ├── js/
    │   └── quiz-engine.js  # Main application logic (Routing, Scoring, Radar Chart, Poster Generation)
    ├── data/
    │   ├── career.json     # Configuration for Individual Commercial Monetization
    │   ├── love.json       # Configuration for Intimate Relationship Defense 
    │   ├── shadow.json     # Configuration for Jungian Shadow Integration
    │   ├── habitat.json    # Configuration for Global Digital Nomad Arbitrage
    │   ├── energy.json     # Configuration for High-Functioning Energy Management
    │   └── car.json        # Configuration for Luxury Car Persona
    └── handbooks/          # Auto-generated deep-dive handbooks (Hashed URLs)
        ├── career-{hash}.html
        ├── love-{hash}.html
        └── ...
```

## 🧠 Data Configuration (The JSON Engine)

Each test is powered by a JSON file in `public/data/`. A typical configuration includes:

1. **Meta Information**: `title`, `description`, `dimensions` (the 5 axes of the radar chart), and `themeColor`.
2. **Questions**: An array of exactly 15 questions. Each question has 4 `options`.
3. **Option Logic**: 
   - `scores`: How choosing this option affects the 5 radar chart dimensions (e.g., `{"理智": 2, "共情": -1}`).
   - `types`: How this option counts towards the final Archetype outcome (e.g., `{"A": 2, "B": 1}`).
4. **Outcomes (Results)**: 5 distinct final outcomes (A, B, C, D, E) containing a title, sub-title, and ~500 words of concrete, actionable insights.

## 🛠️ Development & Deployment

### 1. Modifying Test Content
To add a new question or change scores, simply edit the corresponding JSON file in `public/data/`. The UI will instantly reflect the changes.

### 2. Updating Handbooks
If you wish to update the content of the deep-dive handbooks:
1. Edit the content strings inside `generate_handbooks.py`.
2. Run the script: 
   ```bash
   python3 generate_handbooks.py
   ```
3. The script will generate new HTML files with unique hashed filenames, delete old versions, and automatically inject the new `handbookUrl` into the respective JSON files.

### 3. Deployment
The project is configured for continuous deployment via **Cloudflare Pages**. 
Any push to the `main` branch of this repository will trigger an automatic build and deployment to the production environment (`testing.cartalab.co`).

```bash
# Push changes to deploy
git add .
git commit -m "feat: updated quiz content"
git push origin main
```
