<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1T37zJ0YZEdvHtSLdtbVycEMN7vH0NCf-

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Migration de la base de données auth

Better Auth créera automatiquement les tables nécessaires lors de la première utilisation. 

Pour générer le schéma manuellement :
```bash
pnpm auth:generate
```

Pour exécuter la migration :
```bash
pnpm auth:migrate
```