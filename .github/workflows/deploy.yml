name: Deploy to GitHub Pages

on:
  # Запуск при пуше в ветку main (проверьте, что ваша ветка называется main, а не master)
  push:
    branches: ["main"]
  # Возможность запустить вручную из вкладки Actions
  workflow_dispatch:

# Права, необходимые для деплоя на Pages через токен GITHUB_TOKEN
permissions:
  contents: read
  pages: write
  id-token: write

# Позволяет выполнять только один деплой за раз, пропуская промежуточные, если вы пушите часто
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Шаг сборки
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: 'npm' # Кэширование зависимостей для ускорения

      - name: Install dependencies
        # npm ci быстрее и надежнее npm install для CI-сред
        run: npm ci

      - name: Build project
        # Используем ваш скрипт "build": "tsc -b && vite build" из package.json
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Указываем папку, куда Vite собирает проект (обычно dist)
          path: ./dist

  # Шаг деплоя
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
