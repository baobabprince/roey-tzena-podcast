# Setup Guide: X-Radio Digest V2.0

Follow these steps to obtain the necessary credentials and configure the automated pipeline.

## 1. Google Gemini API Key
Used for scriptwriting using the Gemini 2.0 Flash model.

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Log in with your Google account.
3.  Click on **"Get API key"** in the sidebar.
4.  Create a new API key in a new or existing project.
5.  **GitHub Secret Name**: `GEMINI_API_KEY`

## 2. Google Cloud Service Account (for TTS)
Used for high-quality Hebrew speech synthesis (Neural2).

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  Navigate to **APIs & Services > Library**.
4.  Search for **"Cloud Text-to-Speech API"** and click **Enable**.
5.  Navigate to **IAM & Admin > Service Accounts**.
6.  Click **"Create Service Account"**. Give it a name (e.g., `tts-bot`) and click **Create and Continue**.
7.  (Optional) Assign the "Cloud Test-to-Speech Author" role, though usually no specific role is needed just to call the API if it's enabled.
8.  Once created, click on the service account email, go to the **"Keys"** tab.
9.  Click **Add Key > Create New Key** and select **JSON**.
10. Download the file. Copy the **entire content** of this JSON file.
11. **GitHub Secret Name**: `GCP_SA_KEY`

## 3. Twitter (X) Session Cookies
Used by the `Twikit` library to scrape your home timeline.

1.  Open Chrome or Firefox and log into [x.com](https://x.com).
2.  Open **Developer Tools** (F12 or Right-click > Inspect).
3.  Go to the **Application** tab (Chrome) or **Storage** tab (Firefox).
4.  In the left sidebar, expand **Cookies** and select `https://x.com`.
5.  Find the following two cookies:
    *   `auth_token`: A long hexadecimal string.
    *   `ct0`: A long alphanumeric string (CSRF token).
6.  **GitHub Secret Name**: `X_AUTH_TOKEN` (for the `auth_token` value)
7.  **GitHub Secret Name**: `X_CT0` (for the `ct0` value)

## 4. GitHub Token
Used to create Releases and push RSS updates.

1.  GitHub Actions automatically provides a `GITHUB_TOKEN`, but for pushing to the main branch, ensure the workflow has "Write" permissions (already configured in the YAML).
2.  If you encounter permission issues, you can create a **Personal Access Token (Fine-grained)** with `Contents: Read & Write` and save it as a secret named `GH_TOKEN`.

---

### How to add Secrets to GitHub:
1.  Go to your repository on GitHub.
2.  Click **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret** for each item above.


gh secret set X_CT0 --body "343c0c3ecaab3200c11415af0d58ced399098b98881dc3d73377e05e334a8f1d9121425d4e9fad995cdcceaad209613cc5feb9d72ae1c1bec0e7bae09575760462f9145ee1fc0f0a4f385bc8ea0905"